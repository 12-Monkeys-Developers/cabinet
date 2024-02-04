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
      scrollY: [],
    });
  }

  /** @override */
  async getData(options) {
    const context = {};

    const isEditable = this.actor.isUnlocked;
    context.cssClass = isEditable ? "editable" : "locked";
    context.editable = isEditable;
    context.uneditable = !isEditable;
    context.femme = this.actor.sexeIllustration;

    context.actor = this.document;
    context.system = this.document.system;

    context.images = SYSTEM.IMAGES;

    return context;
  }

  /**
   * Retourne les context options des embedded items
   * @returns {object[]}
   * @private
   */
  _getItemEntryContextOptions() {
    return [
      {
        name: `Frapper`,
        icon: `<i class="fa-regular fa-hand-fist"></i>`,
        condition: (li) => {
          const itemId = li.data("itemId");
          const item = this.actor.items.get(itemId);
          if (!item) return false;
          return item.type === "arme" && item.system.estCorpsACorps && this.actor.type === "corps";
        },
        callback: (li) => {
          const armeId = li.data("itemId");
          this.actor.utiliserArme(armeId, "Frapper");
        },
      },
      {
        name: `Se bagarrer`,
        icon: `<i class="fa-regular fa-hand-back-fist"></i>`,
        condition: (li) => {
          const itemId = li.data("itemId");
          const item = this.actor.items.get(itemId);
          if (!item) return false;
          return item.type === "arme" && item.system.estCorpsACorps && this.actor.type === "corps";
        },
        callback: (li) => {
          const armeId = li.data("itemId");
          this.actor.utiliserArme(armeId, "Se bagarrer");
        },
      },
      {
        name: `Tirer`,
        icon: `<i class="fa-solid fa-gun"></i>`,
        condition: (li) => {
          const itemId = li.data("itemId");
          const item = this.actor.items.get(itemId);
          if (!item) return false;
          return item.type === "arme" && item.system.estDistance && this.actor.type === "corps";
        },
        callback: (li) => {
          const armeId = li.data("itemId");
          this.actor.utiliserArme(armeId, "Tirer");
        },
      },
      {
        name: `Lancer`,
        icon: `<i class="fa-regular fa-hand"></i>`,
        condition: (li) => {
          const itemId = li.data("itemId");
          const item = this.actor.items.get(itemId);
          if (!item) return false;
          return item.type === "arme" && item.system.estDistance && this.actor.type === "corps";
        },
        callback: (li) => {
          const armeId = li.data("itemId");
          this.actor.utiliserArme(armeId, "Lancer");
        },
      },
      {
        name: `Calculer les dégâts`,
        icon: `<i class="fa-solid fa-dice"></i>`,
        condition: (li) => {
          const itemId = li.data("itemId");
          const item = this.actor.items.get(itemId);
          if (!item) return false;
          return item.type === "arme";
        },
        callback: async (li) => {
          const armeId = li.data("itemId");
          const arme = this.actor.items.get(armeId);
          if (!arme) return false;
          return this.actor.lancerDegats(armeId);
        },
      },
      {
        name: `Détails`,
        icon: `<i class="fa-regular fa-cogs"></i>`,
        condition: true,
        callback: (li) => {
          const itemId = li.data("itemId");
          this._ouvrirItem(itemId);
        },
      },
      {
        name: `Supprimer`,
        icon: `<i class="fa-solid fa-trash"></i>`,
        condition: true,
        callback: (li) => {
          const itemId = li.data("itemId");
          this._supprimerItem(itemId);
        },
      },
    ];
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Lock/Unlock la fiche
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));
    html.find(".change-sexe").click(this._onSheetChangeSexe.bind(this));
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click((ev) => this._onItemEdit(ev));
    html.find(".item-delete").click((ev) => this._onItemDelete(ev));
    html.find(".inline-edit").change(this._onEmbeddedItemEdit.bind(this));

    // Activate context menu
    this._contextMenu(html);

    // Santé pour le corps et les PNJs
    if (this.actor.type === "corps" || this.actor.type === "pnj") {
      html.find(".case-sante").click(this._onCocherCaseSante.bind(this));
    }
  }

  /** @inheritdoc */
  _contextMenu(html) {
    ContextMenu.create(this, html, ".item-contextmenu", this._getItemEntryContextOptions());
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

  async _onSheetChangeSexe(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "femme");
    if (flagData) await this.actor.unsetFlag(game.system.id, "femme");
    else await this.actor.setFlag(game.system.id, "femme", "femme");
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
        case "arme":
          itemData.name = game.i18n.localize("CDM.NOUVEAU.arme");
        break;
        case "armure":
          itemData.name = game.i18n.localize("CDM.NOUVEAU.armure");
          break;
      case "corruption":
        itemData.name = game.i18n.localize("CDM.NOUVEAU.corruption");
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
    this._ouvrirItem(itemId);
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
    await this._supprimerItem(itemId);
  }

  _ouvrirItem(itemId) {
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }
  
  async _supprimerItem(itemId) {
    let item = this.actor.items.get(itemId);
    if (item === null) {
      return;
    }
    await this.actor.deleteEmbeddedDocuments("Item", [item.id], { render: true });
    if (this.actor.type === "esprit" && item.type === "corruption") {
      Hooks.callAll("cabinet.deleteCorruptionOnEsprit", item.uuid);
    }
  }

  /**
   * Coche ou décoche une case de santé
   * @param {Event} event
   */
  async _onCocherCaseSante(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let index = parseInt(element.dataset.index);
    let zone = element.dataset.zone;
    let nouvelleValeur = index < this.actor.system.sante[zone].seuil - 1 ? index + 1 : index;

    if (index == this.actor.system.sante[zone].seuil - 1) {
      return;
    } else if (nouvelleValeur == this.actor.system.sante[zone].valeur) await this.actor.update({ [`system.sante.${zone}.valeur`]: nouvelleValeur - 1 });
    else await this.actor.update({ [`system.sante.${zone}.valeur`]: nouvelleValeur });
  }
  /**
   *
   * @param {*} event
   * @returns
   */
  _onEmbeddedItemEdit(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).data("itemId");
    let item = this.actor.items.get(itemId);

    const element = event.currentTarget;
    let field = element.dataset.field;
    let newValue;
    if (element.type === "checkbox") newValue = element.checked;
    else if (element.type === "number") newValue = element.valueAsNumber;
    else newValue = element.value;
    return item.update({ [field]: newValue });
  }
}
