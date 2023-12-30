export class PresentationForm extends FormApplication {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Présentation du système",
      id: "guide-systeme",
      template: "systems/cabinet/templates/forms/guide-systeme.hbs",
      width: 800,
      height: 700,
      resizable: true,
      closeOnSubmit: false,
    });
  }
  async getData(options) {
    const context = {};

    context.images = SYSTEM.IMAGES;

    return context;
  }
}