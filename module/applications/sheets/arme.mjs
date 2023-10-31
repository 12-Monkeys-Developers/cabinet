import CabinetItemSheet from "./item.mjs";

export default class ArmeSheet extends CabinetItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 700,
      width: 750,
      resizable: false,
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

    context.arme_soustypes = SYSTEM.ARME_SOUSTYPES;
    context.arme_categories = SYSTEM.ARME_CATEGORIES;
    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false });
    return context;
  }
}