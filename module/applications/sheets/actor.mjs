export default class CabinetActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 800,
      height: 600,
      classes: [SYSTEM.id, "sheet", "actor", this.actorType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.actorType}.hbs`,
      resizable: false,
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
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click((ev) => this._onItemEdit(ev));
    html.find(".item-delete").click((ev) => this._onItemDelete(ev));
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
  
  /**
   * Créer un embedded item
   *
   * @name _onItemCreate
   * @param {*} event
   */
  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemData = {
      type: element.dataset.type,
    };
    switch (element.dataset.type) {
      case "acquis":
        itemData.name = game.i18n.localize("CDM.NOUVEAU.acquis");
        break;
    }
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Editer un embedded item
   *
   * @name _onItemEdit
   * @param {*} event
   */
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.dataset.field;
    let item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  /**
   * Supprimer un embedded item
   *
   * @name _onItemDelete
   * @param {*} event
   */
  async _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.dataset.field;
    let item = this.actor.items.get(itemId);
    if (item === null) {
      return;
    }
    await this.actor.deleteEmbeddedDocuments("Item", [item.id], { render: true });
    if (this.actor.type === "esprit" && item.type === "corruption") {
      Hooks.callAll("cabinet.deleteCorruptionOnEsprit", item.uuid);
    }
  }
}
