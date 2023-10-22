import CabinetItemSheet from "./item.mjs";

export default class CorruptionSheet extends CabinetItemSheet {
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "corruption";

  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 600,
      height: 400,
      classes: [SYSTEM.id, "sheet", "item", this.itemType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.itemType}.hbs`,
      resizable: false,
      tabs: [],
      scrollY: []
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false });
    return context;
  }
}

