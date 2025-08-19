const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class PresentationForm extends HandlebarsApplicationMixin(ApplicationV2) {  
  static DEFAULT_OPTIONS = {
    classes: ["cabinet","scrollable"],
    tag: "form",
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
    },
    window: {
      resizable: true,
      icon: "fas fa-gear",
    },
    position: { width: 800, height: 700 },
    id: "guide-systeme",
    actions: {
      toggleLockMode: this._toggleLockMode,
    },
  };

  static PARTS = {
    presentation: {
      template: "systems/cabinet/templates/forms/guide-systeme.hbs",
    },
  };
  get title() {
    return this.settingTitle;
  }
  //settingName = "suiviRef";
  settingTitle = game.i18n.localize("CDM.gmtools.presentation");

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.images = SYSTEM.IMAGES;
    return context;
  }
}
