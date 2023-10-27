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
      await this.cabinet.update({[`system.arbre.${actor.system.positionArbre}.idEsprit`]: null});
      await actor.update({ "system.positionArbre": "", "system.jardin": true });
    }
    // Sur une sphère
    else {
      li = event.target.closest(".sphere");
      if (!li) return;
      if (!li.dataset.field) return;

      let oldPosition = actor.system.positionArbre;
      let newPosition = li.dataset.field;

      if (this.validerDeplacement(oldPosition, newPosition)) {
        await actor.update({ "system.positionArbre": newPosition, "system.jardin": false });
        await this.cabinet.update({[`system.arbre.${newPosition}.idEsprit`]: actor.id});
      }
    }
    this.render();
  }

  /**
   * Valide le déplacement entre les deux positions
   * @param {*} oldPosition
   * @param {*} newPosition
   * @returns {boolean} true si le déplacement est possible
   */
  async validerDeplacement(oldPosition, newPosition) {
    let contenuArbre = await this.remplirArbre();
    // si la position est occupée on sort
    if (contenuArbre[newPosition].id) return false;
    //si l'esprit etait dans son jardin on valide
    if (!oldPosition) return true;


    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    let membresSet = cabinet.system.esprits;

    // Recencement des positions occupées
    // TO DO Vérifier si rien n'est cassé
    let positionsOccupees = {};
    membresSet.forEach((element) => {
      let actor = game.actors.get(element);
      if (actor.system?.positionArbre.length) positionsOccupees[actor.system.positionArbre] = 1;
    });

    return await this.trouverChemin(oldPosition, newPosition, positionsOccupees);
  }

  /**
   * Le déplacement entre le noeud de départ et d'arrivée est-il autorisé ?
   * @param {*} startNode
   * @param {*} endNode
   * @param {*} cheminsFermes
   * @returns {boolean} true si le déplacement est possible
   */
  async trouverChemin(startNode, endNode, cheminsFermes) {
    //on parcourt tous les nodes adjacents
    //console.log("startNode", startNode);
    for (let node of ArbreVieForm.GRAPH[startNode]) {
      //console.log("current node : ", node);
      //si le node est la destination, c'est gagné
      if (node === endNode) {
        //console.log("chemin validé, node n-1 : ", startNode);
        return true;
      }
      // si le node adjacent est squatté ou déjà visité, on n'y va pas
      else if (!cheminsFermes[node]) {
        let newCheminsFermes = foundry.utils.deepClone(cheminsFermes);

        //ajoute le node actuel aux nodes visités ou fermés
        newCheminsFermes[startNode] = 1;
        //console.log("nouvelle boucle basée sur : ", node);

        if (this.trouverChemin(node, endNode, newCheminsFermes)) {
          return true;
        }
      }
    }
    return false;
  }

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

      // Mise à jour des qliph
      for (const [qualite, value] of Object.entries(actor.system.qualites)) {
        if (value.qlipha) {
          contenuArbre[SYSTEM.QUALITES[qualite].sphere].qliphaNom = actor.name;
          contenuArbre[SYSTEM.QUALITES[qualite].sphere].qliphaToken = actor.prototypeToken.texture.src;
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
