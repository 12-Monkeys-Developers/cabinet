export class GestionForm extends FormApplication {
  constructor(options) {
    super(options);
    Hooks.on("cabinet.changerComedien", async (actorId, newValue) => this.render());
  }

  static get getDefaults() {
    return {};
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Gestion du Cabinet",
      id: "gestionform",
      template: "systems/cabinet/templates/forms/gestion-cabinet.hbs",
      width: 800,
      height: 600,
      resizable: true,
      closeOnSubmit: false,
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  getData(options) {
    let listeMembres = game.settings.get("cabinet", "membres");
    let context = {};
    const membres = [];
    listeMembres.forEach((element) => {
      let actor = game.actors.get(element);
      membres.push({
        nom: actor.name,
        img: actor.img,
        id: actor.id,
        estComedien: actor.system.comedien,
        token: actor.prototypeToken.texture.src,
        dansJardin: actor.system.jardin,
      });
    });
    context.membres = membres;
    return context;
  }

  static registerDefault() {
    game.settings.register("cabinet", "membres", {
      name: "Gestion du cabinet",
      type: Object,
      config: false,
      scope: "world",
      default: [],
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".comedien").change(this._changerComedien.bind(this));
    html.find(".jardin").change(this._allerJardin.bind(this));
    html.find(".membre-enlever").click(this._enleverMembre.bind(this));
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Actor") return false;
    const actor = await Actor.implementation.fromDropData(data);

    if (actor.type !== "esprit") return false;
    const actorId = actor._id;

    let membres = game.settings.get("cabinet", "membres");
    if (membres.includes(actorId)) return false;
    membres.push(actorId);
    await game.settings.set("cabinet", "membres", membres);

    this.render();
  }

  //assigne le comédien
  async _changerComedien(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let actorId = element.dataset.field;
    let newActor = game.actors.get(actorId);
    const currentValueComedien = newActor.system.comedien;
    //si il est déjà le comedien, il quitte le controle qui devient null
    if (currentValueComedien) {
      await game.settings.set("cabinet", "comedien", null);
    } else {
      if (newActor.system.jardin) {
        await newActor.quitterJardin();
      }
      let oldActorId = await game.settings.get("cabinet", "comedien");
      if (oldActorId) {
        let oldActor = game.actors.get(oldActorId);
        await oldActor.update({ "system.comedien": false });
      }
      await game.settings.set("cabinet", "comedien", actorId);
    }
    await newActor.update({ "system.comedien": !currentValueComedien });
    this.render();
  }

  async _allerJardin(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let actorId = element.dataset.field;
    let actor = game.actors.get(actorId);

    const currentValue = actor.system.jardin;
    if (actor.system.jardin) {
      await actor.quitterJardin();
    } else {
      await actor.update({ "system.positionArbre": "", "system.comedien": false, "system.jardin": true });
    }
    this.render();
  }

  async _enleverMembre(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let indexArray = element.dataset.field;
    //console.log(element);
    let membres = game.settings.get("cabinet", "membres");
    const x = membres.splice(indexArray, 1);
    await game.settings.set("cabinet", "membres", membres);
    this.render();
  }
}
