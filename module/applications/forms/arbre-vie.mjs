export class ArbreVieForm extends FormApplication {
  constructor(options) {
    super(options);
    Hooks.on('updateActor', async (document, change, options, userId) => this.render());
  }

  static get getDefaults() {
    return {};
  }

  settingName = "arbredevie";
  settingTitle = "title";

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "L'Arbre de Vie",
      id: "arbre-de-vie",
      template: "systems/cabinet/templates/forms/arbre-vie.hbs",
      width: 616,
      height: 680,
      resizable: false,
      closeOnSubmit: false,
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  async getData(options) {
    let membresSet = game.settings.get("cabinet", "membres");
    let context = {
      membresJardin: [],
    };
    context.contenuArbre = await this.remplirArbre();
    membresSet.forEach((element) => {
      let actor = game.actors.get(element);
      if (!actor.system.positionArbre.length) {
        context.membresJardin.push({
          nom: actor.name,
          id: actor.id,
          token: actor.prototypeToken.texture.src,
        });
      }
    });
    return context;
  }

  static registerDefault() {}

  activateListeners(html) {
    super.activateListeners(html);
  }
  _canDragStart(selector) {
    return true;
  }

  _canDragDrop(selector) {
    return true;
  }

  /** @override */
  _onDragStart(event) {
    let actorId = event.target.dataset.field;
    const actor = game.actors.get(actorId);
    if (!actor) return;
    //tester user is gm ou bien user a les droits sur cet actor
    console.log("ownership", actor.ownership);
    if (!game.user.isGM && !actor.ownership[game.userId]) return;
    event.dataTransfer.setData("text/plain", JSON.stringify(actor.toDragData()));
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Actor") return false;
    const actor = await Actor.implementation.fromDropData(data);

    if (actor.type !== "esprit") return false;
    let li = event.currentTarget.closest(".jardin");
    if (li) {
      await actor.update({ "system.positionArbre": "" });
    } else {
      li = event.target.closest(".sphere");
      if (!li) return;
      if (!li.dataset.field) return;

      let oldPosition = actor.system.positionArbre;
      let newPosition = li.dataset.field;

      if (await this.validerDeplacement(oldPosition, newPosition)) {
        await actor.update({ "system.positionArbre": newPosition });
      }
    }
    this.render();
  }

  async remplirArbre() {
    let membresSet = game.settings.get("cabinet", "membres");
    let contenuArbre = {
      kether: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      binah: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      chokmah: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      geburah: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      chesed: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      tiferet: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      hod: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      netzach: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      yesod: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
      malkuth: {
        id: null,
        nom: null,
        token: null,
        qliphaToken: null,
        qliphaNom: null,
      },
    };
    membresSet.forEach(async (element) => {
      let actor = game.actors.get(element);
      if (actor.system.positionArbre.length) {
        contenuArbre[actor.system.positionArbre].id = actor.id;
        contenuArbre[actor.system.positionArbre].nom = actor.name;
        contenuArbre[actor.system.positionArbre].token = actor.prototypeToken.texture.src;
      }

      for (const [qualite, value] of Object.entries(actor.system.qualites)) {
        if (value.qlipha) {
          contenuArbre[SYSTEM.QUALITES[qualite].sphere].qliphaNom = actor.name;
          contenuArbre[SYSTEM.QUALITES[qualite].sphere].qliphaToken = actor.prototypeToken.texture.src;
        }
      }
    });
    return contenuArbre;
  }
  async validerDeplacement(oldPosition, newPosition) {
    let contenuArbre = await this.remplirArbre();
    // si la position est occupée on sort
    if (contenuArbre[newPosition].id) return false;
    //si l'esprit etait dans son jardin on valide
    if (!oldPosition) return true;

    let graph = {
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
    let membresSet = game.settings.get("cabinet", "membres");

    //recencement des positions occupées
    let positionsOccupees = {};
    membresSet.forEach((element) => {
      let actor = game.actors.get(element);
      if (actor.system?.positionArbre.length) positionsOccupees[actor.system.positionArbre] = 1;
    });

    return await this.trouverChemin(oldPosition, newPosition, graph, positionsOccupees);
  }

  async trouverChemin(startNode, endNode, graph, cheminsFermes) {
    //on parcourt tous les nodes adjacents
    //console.log("startNode", startNode);
    for (let node of graph[startNode]) {
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

        if (await this.trouverChemin(node, endNode, graph, newCheminsFermes)) {
          return true;
        }
      }
    }
    return false;
  }
}
