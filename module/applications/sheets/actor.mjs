export default class CabinetActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 1000,
      height: 750,
      classes: [SYSTEM.id, "sheet", "actor", this.actorType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.actorType}.hbs`,
      resizable: false,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "qualites" }],
      scrollY: []
    });
  }

  /** @override */
  async getData(options) {
    const context = {};

    
    const isEditable = this.actor.isUnlocked;
    context.cssClass = isEditable ? "editable" : "locked";
    context.editable = isEditable;

    context.actor = this.document;
    context.system = this.document.system;

    return context;
  }
  
  activateListeners(html) {
    super.activateListeners(html);

    // Lock/Unlock la fiche
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));
  }

  /**
   * Manage the lock/unlock button on the sheet
   *
   * @name _onSheetChangelock
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.actor.sheet.render(true);
  }
}
