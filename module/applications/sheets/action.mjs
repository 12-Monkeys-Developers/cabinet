import CabinetItemSheet from "./item.mjs";

export default class ActionSheet extends CabinetItemSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 500,
      resizable: true,
    });
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "action";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.qualites = SYSTEM.QUALITES;
    context.aspects = SYSTEM.ASPECTS;
    context.attributs = SYSTEM.ATTRIBUTS;

    return context;
  }
}
