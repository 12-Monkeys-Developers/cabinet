import CabinetItemSheet from "./item.mjs"

export default class AcquisSheet extends CabinetItemSheet {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  static get defaultOptions() {
    const options = super.defaultOptions
    return Object.assign(options, {
      height: 350,
      width: 450,
      resizable: true,
    })
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "acquis"

  /** @override */
  async getData(options) {
    const context = await super.getData(options)

    context.spheres = SYSTEM.SPHERES
    context.selectValeur = {
      1: "1",
      2: "2",
      3: "3",
    }
    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false })
    return context
  }
}
