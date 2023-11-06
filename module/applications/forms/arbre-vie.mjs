export class ArbreVieForm extends FormApplication {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "L'Arbre de Vie",
      id: "arbre-de-vie",
      template: "systems/cabinet/templates/forms/arbre-vie.hbs",
      width: 616,
      height: 680,
      resizable: false,
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
      closeOnSubmit: false,
    });
  }

  /**
   * Lien vers le Cabinet qui est configuré par ce formulaire
   * @type {CabinetCabinet}
   */
  get cabinet() {
    return this.object;
  }

  static GRAPH = {
    kether: ["chokmah", "binah", "tiferet"],
    chokmah: ["kether", "binah", "tiferet", "chesed"],
    binah: ["kether", "chokmah", "tiferet", "geburah"],
    chesed: ["geburah", "chokmah", "tiferet", "netzach"],
    geburah: ["chesed", "binah", "tiferet", "hod"],
    tiferet: ["kether", "chokmah", "chesed", "binah", "netzach", "yesod", "hod", "geburah"],
    netzach: ["tiferet", "chesed", "yesod", "hod", "malkuth"],
    hod: ["tiferet", "malkuth", "netzach", "yesod", "geburah"],
    yesod: ["tiferet", "malkuth", "netzach", "hod"],
    malkuth: ["netzach", "yesod", "hod"],
  };

  /** @override */
  async getData(options) {
    let context = {};

    // Jardin
    context.membresJardin = this.cabinet.listeEsprits.filter((e) => e.dansJardin);

    // Arbre
    context.contenuArbre = await this.remplirArbre();

    return context;
  }

  /** Define whether a user is able to begin a dragstart workflow for a given drag selector */
  /** @inheritdoc */
  _canDragStart(selector) {
    return true;
  }

  /** Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector */
  /** @inheritdoc */
  _canDragDrop(selector) {
    return true;
  }

  /** @override */
  _onDragStart(event) {
    let actorId = event.target.dataset.field;
    const actor = game.actors.get(actorId);
    if (!actor) return;
    // console.log("ownership", actor.ownership);
    // Uniquement pour le GM ou un user qui a les droits sur l'actor
    if (!game.user.isGM && !actor.ownership[game.userId]) return;
    event.dataTransfer.setData("text/plain", JSON.stringify(actor.toDragData()));
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    // Récupère le type et l'uuid
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Actor") return false;

    const actor = await fromUuid(data.uuid);
    if (actor.type !== "esprit") return false;

    let li = event.currentTarget.closest(".jardin");
    // Dans le jardin
    if (li) {
      await actor.deplacerPosition(null, false);
    }
    // Sur une sphère
    else {
      li = event.target.closest(".sphere");
      if (!li) return;
      if (!li.dataset.field) return;

      let oldPosition = actor.system.positionArbre;
      let newPosition = li.dataset.field;

      if (await this.validerDeplacement(actor.id, oldPosition, newPosition)) {
        await actor.deplacerPosition(newPosition, false);
      }
    }
    this.render();
  }

  /**
   * Valide le déplacement entre 2 noeuds de l'arbre
   * via une approche de parcours en largeur (BFS) du graphe 
   * @param {uuid}  idEsprit
   * @param {*} depart      Sphère de départ
   * @param {*} arrivee     Sphère d'arrivée
   * @returns {boolean}     true si c'est possible, false sinon
   */
  validerDeplacement(idEsprit, depart, arrivee) {
    const spheresOccupees = this.cabinet.spheresOccupees;
    const spheresReservees = this.cabinet.getSpheresReservees(idEsprit)

    //const spheresInatteignables = new Set([...spheresOccupees, ...spheresReservees]);
    const spheresInatteignables = new Set([...spheresOccupees]);

    // Vérifier si la sphère d'arrivée est occupée
    if (spheresInatteignables.has(arrivee)) {
      console.log(`La sphère d'arrivée '${arrivee}' est occupée.`);
      return false;
    }

    // Vérifier si la sphère d'arrivée n'est pas bloqué par la Qlipha d'un autre esprit
    if (spheresReservees.has(arrivee)) {
      console.log(`La sphère d'arrivée '${arrivee}' est bloquée par la Qlipha d'un autre esprit.`);
      return false;
    }

    // Vérifier si le déplacement est possible en parcourant le graphe
    const queue = [depart];
    const visited = new Set();

    while (queue.length > 0) {
      const currentSphere = queue.shift();

      if (currentSphere === arrivee) {
        return true; // Déplacement possible
      }

      if (!visited.has(currentSphere)) {
        visited.add(currentSphere);
        const adjacentSpheres = ArbreVieForm.GRAPH[currentSphere];

        for (const adjacent of adjacentSpheres) {
          if (!spheresInatteignables.has(adjacent)) {
            queue.push(adjacent);
          }
        }
      }
    }

    console.log(`Il n'y a pas de chemin de '${depart}' à '${arrivee}'.`);
    return false; // Aucun chemin possible
  }

  /**
   * Crée l'arbre à afficher
   * @returns 
   */
  async remplirArbre() {
    // Création de l'arbre vierge
    let contenuArbre = this.creerArbre();

    // Mise à jour de l'arbre avec les esprits
    this.cabinet.system.esprits.forEach(async (element) => {
      let actor = game.actors.get(element);

      // L'esprit est sur une sphère
      if (actor.system.positionArbre) {
        contenuArbre[actor.system.positionArbre].id = actor.id;
        contenuArbre[actor.system.positionArbre].nom = actor.name;
        contenuArbre[actor.system.positionArbre].token = actor.prototypeToken.texture.src;
      }

      // Mise à jour des qliphoth
      for (const [qualite, value] of Object.entries(actor.system.qualites)) {
        if (value.qlipha) {
          const sphere = SYSTEM.QUALITES[qualite].sphere;
          contenuArbre[sphere].qliphaNom = actor.name;
          contenuArbre[sphere].qliphaToken = actor.prototypeToken.texture.src;          
          await this.cabinet.update({[`system.arbre.${sphere}.idQlipha`]: actor.id});
        }
      }
    });
    return contenuArbre;
  }

  /**
   * Crée l'arbre de vie
   * @returns {object}
   */
  creerArbre() {
    return {
      kether: this._creerNoeud(),
      binah: this._creerNoeud(),
      chokmah: this._creerNoeud(),
      geburah: this._creerNoeud(),
      chesed: this._creerNoeud(),
      tiferet: this._creerNoeud(),
      hod: this._creerNoeud(),
      netzach: this._creerNoeud(),
      yesod: this._creerNoeud(),
      malkuth: this._creerNoeud(),
    };
  }

  /**
   * Crée un noeud de l'arbre
   * @returns {object}
   */
  _creerNoeud() {
    return {
      id: null,
      nom: null,
      token: null,
      qliphaToken: null,
      qliphaNom: null,
    };
  }
}

