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
