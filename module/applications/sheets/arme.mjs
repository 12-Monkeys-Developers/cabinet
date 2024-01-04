import CabinetItemSheet from "./item.mjs";

export default class ArmeSheet extends CabinetItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 390,
      width: 550,
      resizable: true,
    });
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "arme";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false });
    return context;
  }
}