// Register forms and forms contents
export function registerForms() {
  game.settings.register("cabinet", "arbreform", {
    name: "Arbre de Vie",
    type: ArbreVieForm,
    config: false,
    default: false,
    scope: "world",
  });
  game.settings.register("cabinet", "gestionform", {
    name: "Gestion du Cabinet",
    type: GestionForm,
    config: false,
    default: false,
    scope: "world",
  });
  ArbreVieForm.registerDefault();
  GestionForm.registerDefault();
}

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
      template: "systems/cabinet/templates/forms/arbre_vie.hbs",
      width: 500,
      height: 727,
      resizable: false,
      closeOnSubmit: false,
    });
  }
  getData(options) {
    const newData = {
      formdata: game.settings.get("cabinet", this.settingName),
    };
    return newData;
  }
  static registerDefault() {
    game.settings.register("cabinet", "arbredevie", {
      name: "Arbre de Vie",
      type: null,
      config: false,
      scope: "world",
      default: 0,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
export class GestionForm extends FormApplication {
  static get getDefaults() {
    return {};
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Gestion du Cabinet",
      id: "gestionform",
      template: "systems/cabinet/templates/forms/gestion_cabinet.hbs",
      width: 800,
      height: 600,
      resizable: true,
      closeOnSubmit: false,
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }
  getData(options) {
    let reference = game.settings.get("cabinet", "gestion");
    const newData = {
      membres: [],
    };
    reference.membres.forEach((element) => {
      let actor = game.actors.get(element);
      newData.membres.push({
        nom: actor.name,
        img: actor.img,
        id: actor.id,
        estComedien: actor.estComedien,
        token : actor.prototypeToken.texture.src,
        dansJardin : actor.dansJardin});
    });
    return newData;
  }

  static registerDefault() {
    game.settings.register("cabinet", "gestion", {
      name: "Gestion du cabinet",
      type: null,
      config: false,
      scope: "world",
      default: {
        membres: [],
      },
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

    let reference = game.settings.get("cabinet", "gestion");
    if (reference.membres.includes(actorId)) return false;
    reference.membres.push(actorId);
    await game.settings.set("cabinet", "gestion", reference);
    
    this.render();
  }

  //assigne le comédien
  async _changerComedien(event) {
    event.preventDefault();
    const element  = event.currentTarget;
    let actorId = element.dataset.field;
    let reference = game.settings.get("cabinet", "gestion");
    reference.comedien = actorId;
    await game.settings.set("cabinet", "gestion", reference);
    this.render();
  }
  async _allerJardin(event) {
    event.preventDefault();
    const element  = event.currentTarget;
    let actorId = element.dataset.field;
    let actor = game.actors.get(actorId);
    let flagData = await actor.getFlag(game.system.id, "dansJardin");
    if (flagData) await actor.unsetFlag(game.system.id, "dansJardin");
    else await actor.setFlag(game.system.id, "dansJardin", true);
    this.render();
  }
  async _enleverMembre(event) {
    event.preventDefault();
    const element  = event.currentTarget;
    let indexArray = element.dataset.field;
    console.log(element);
    let reference = game.settings.get("cabinet", "gestion");
    const x = reference.membres.splice(indexArray, 1);
    await game.settings.set("cabinet", "gestion", reference);
    this.render();
  }
}
