export class ArbreVieForm extends FormApplication {
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

  getData(options) {
    let membresSet = game.settings.get("cabinet", "membres");
    let context = {
      membresJardin: [],
    };
    context.contenuArbre = this.remplirArbre();
    console.log("contenuArbre : ", context.contenuArbre);
    membresSet.forEach((element) => {
      let actor = game.actors.get(element);
      if (!actor.system.positionArbre) {
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
  _onDeplacerToken(event) {
    event.preventDefault();
    let element = event.currentTarget;
    console.log("dataset : ", element.dataset);

    let actorId = element.dataset.field;
    let actor = game.actors.get(actorId);
    let newPosition = element.dataset.position;
    let oldPosition = actor.system.positionArbre;
    //tester user is gm ou bien user a les droits sur cet actor
    console.log("ownership", actor.ownership);
    // if(game.user.isGM || game.user)

    // si la position est libre
    if (this.validerDeplacement(oldPosition, newPosition)) {
      actor.update({ "system.positionArbre": newPosition });

      //ajouter un message de confirmation de déplacement dans le chat
    } else ui.notifications.warn("Aucun chemin disponible vers la sphère " + newPosition + ".", { permanent: true });
    this.render();
  }

  /** @override */
  _onDragStart(event) {
    let actorId = event.originalTarget.dataset.field;

    console.log("actorId", actorId);
    const actor = game.actors.get(actorId);
    event.dataTransfer.setData("text/plain", JSON.stringify(actor.toDragData()));
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    console.log("event : ", event);
    console.log("data : ", data);
    if (data.type !== "Actor") return false;
    const actor = await Actor.implementation.fromDropData(data);

    if (actor.type !== "esprit") return false;
    let li = event.currentTarget.closest(".jardin");
    console.log("li : ", li);
    if (li) {
      //await actor.update({ "system.positionArbre": null });
      await actor.update({ 'system.-=positionArbre' : null });
      //actor.system.positionArbre = null;
      console.log("actor3 : ", actor);
    } else {
      li = event.target.closest(".sphere");
      if (!li) return;
      if (!li.dataset.field) return;
      console.log("actor2 : ", actor);

      let oldPosition = actor.system.positionArbre;
      let newPosition = li.dataset.field;

      if (await this.validerDeplacement(oldPosition, newPosition)) {
        await actor.update({ "system.positionArbre": newPosition });
      }
    }
    /*
  const actorId = actor._id;

  let membres = game.settings.get("cabinet", "membres");
  if (!membres.includes(actorId))
  {
    membres.push(actorId);
  await game.settings.set("cabinet", "membres", membres);
  
  }
*/
    this.render();
  }

  remplirArbre() {
    let membresSet = game.settings.get("cabinet", "membres");
    let contenuArbre = {
      kether: null,
      binah: null,
      chokmah: null,
      geburah: null,
      chesed: null,
      tiferet: null,
      hod: null,
      netzach: null,
      yesod: null,
      malkuth: null,
    };
    membresSet.forEach((element) => {
      let actor = game.actors.get(element);
      if (actor.system.positionArbre) {
        contenuArbre[actor.system.positionArbre] = {
          id: actor.id,
          nom: actor.name,
          token: actor.prototypeToken.texture.src,
        };
      }
      console.log("contenuArbresp : ", contenuArbre);
    });
    return contenuArbre;
  }
  async validerDeplacement(oldPosition, newPosition) {
    let contenuArbre = this.remplirArbre();
    // si la position est occupée on sort
    if (contenuArbre[newPosition]) return false;
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
      if (actor.system?.positionArbre) positionsOccupees[actor.system.positionArbre] = 1;
    });

    console.log("positionsOccupees : ", positionsOccupees);
    return await this.trouverChemin(oldPosition, newPosition, graph, positionsOccupees);
  }

  async trouverChemin(startNode, endNode, graph, cheminsFermes) {
    //on parcourt tous les nodes adjacents
    console.log("startNode", startNode);
    for (let node of graph[startNode]) {
      console.log("current node : ", node);
      //si le node est la destination, c'est gagné
      if (node === endNode) {
        console.log("chemin validé, node n-1 : ", startNode);
        return true;
      }
      // si le node adjacent est squatté ou déjà visité, on n'y va pas
      else if (!cheminsFermes[node]) {
        let newCheminsFermes = foundry.utils.deepClone(cheminsFermes);

        //ajoute le node actuel aux nodes visités ou fermés
        newCheminsFermes[startNode] = 1;
        console.log("nouvelle boucle basée sur : ", node);

        if (await this.trouverChemin(node, endNode, graph, newCheminsFermes)) {
          return true;
        }
      }
    }
    return false;
  }
}
