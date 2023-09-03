export default class CabinetItemSheet extends ItemSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 400,
      height: 800,
      classes: [SYSTEM.id, "sheet", "item", this.itemType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.itemType}.hbs`,
      resizable: false,
      tabs: [],
      scrollY: [],
    });
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);
    context.source = context.data;
    context.item = context.document;
    return context;
  }
}
