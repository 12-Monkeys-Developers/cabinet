import CabinetItemSheet from "./item.mjs";

export default class AcquisSheet extends CabinetItemSheet {
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "acquis";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.spheres = SYSTEM.SPHERES;
    return context;
  }
}
