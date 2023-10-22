import CabinetItemSheet from "./item.mjs";

export default class AcquisSheet extends CabinetItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 400,
      width: 600,
      resizable: false,
    });
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "acquis";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.spheres = SYSTEM.SPHERES;
    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false });
    return context;
  }
}
