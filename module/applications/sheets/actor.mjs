export default class CabinetActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 1000,
      height: 750,
      classes: [SYSTEM.id, "sheet", "actor", this.actorType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.actorType}.hbs`,
      resizable: true,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "qualites" }],
      scrollY: []
    });
  }

  /** @override */
  async getData(options) {
    const context = {};

    const isEditable = this.isEditable;
    context.cssClass = isEditable ? "editable" : "locked";
    context.editable = isEditable;

    context.actor = this.document;
    context.system = this.document.system;

    return context;
  }
}
