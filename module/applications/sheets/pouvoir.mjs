import CabinetItemSheet from "./item.mjs";

export default class PouvoirSheet extends CabinetItemSheet {
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "pouvoir";

  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 500,
      height: 500,
      classes: [SYSTEM.id, "sheet", "item", this.itemType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.itemType}.hbs`,
      resizable: false,
      tabs: [],
      scrollY: [],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false });
    context.spheres = SYSTEM.SPHERES;
    context.imgsphere = SYSTEM.IMAGES[this.item.system.sphere + "_logo"];
    context.selectNiveau = {
      1: "1",
      2: "2",
      3: "3",
    };

    return context;
  }
}
