import CabinetItemSheet from "./item.mjs"

export default class ArmeSheet extends CabinetItemSheet {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  static get defaultOptions() {
    const options = super.defaultOptions
    return Object.assign(options, {
      height: 390,
      width: 550,
      resizable: true,
    })
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "arme"

  /** @override */
  async getData(options) {
    const context = await super.getData(options)

    context.descriptionhtml = await TextEditor.enrichHTML(this.item.system.description, { async: false })
    context.selectPrecision = {
      "-2": "-2",
      "-1": "-1",
      0: "0",
      1: "1",
      2: "2",
      3: "3",
    }
    return context
  }
}
