import CabinetItemSheet from "./item.mjs"

export default class ArmureSheet extends CabinetItemSheet {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  static get defaultOptions() {
    const options = super.defaultOptions
    return Object.assign(options, {
      height: 600,
      width: 410,
      resizable: false,
    })
  }
  /**
   * Le type d'Item qu'affiche cette Sheet
   * @type {string}
   */
  static itemType = "armure"

  /** @override */
  async getData(options) {
    const context = await super.getData(options)
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.description, { async: false })
    return context
  }
}
