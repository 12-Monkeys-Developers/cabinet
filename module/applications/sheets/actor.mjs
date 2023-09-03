export default class CabinetActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 760,
      height: 750,
      classes: [SYSTEM.id, "sheet", "actor", this.actorType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.actorType}.hbs`,
      resizable: false,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "qualites" }],
      scrollY: [],
    });
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);
    return context;
  }
}
