import { SYSTEM } from "../../config/system.mjs";
import CabinetAction from "../../data/action.mjs";
import CabinetActorSheet from "./actor.mjs";

export default class EspritSheet extends CabinetActorSheet {
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("cabinet.updateCorps", async (corpsId) => this.render());
  }

  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 1000,
      height: 780,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "qualites" }],
    });
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "esprit";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.qualites = this.#formatQualites(context.actor.system.qualites);
    context.aspects = this.#formatAspects(context.actor.system.aspects);
    context.actions = this.#formatActions(this.actor.items.filter((i) => i.type === "action"));

    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.acquis.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    // Pouvoirs par ordre niveau et mise en forme de la description
    context.pouvoirs = this.actor.items
      .filter((item) => item.type == "pouvoir")
      .sort(function (a, b) {
        return a.system.niveau > b.system.niveau;
      });
    context.pouvoirs.forEach((element) => {
      element.system.shperelabel = SYSTEM.SPHERES[element.system.sphere].label;
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    // corruptions par ordre niveau et mise en forme de la description
    context.corruptions = this.actor.items.filter((item) => item.type == "corruption");
    context.corruptions.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    context.adversaireshtml = TextEditor.enrichHTML(this.actor.system.adversaires, { async: false });
    context.contactshtml = TextEditor.enrichHTML(this.actor.system.contacts, { async: false });
    context.noteshtml = TextEditor.enrichHTML(this.actor.system.notes, { async: false });
    context.objetshtml = TextEditor.enrichHTML(this.actor.system.objets, { async: false });
    context.profilprivatehtml = TextEditor.enrichHTML(this.actor.system.profil.private, { async: false });
    context.routinehtml = TextEditor.enrichHTML(this.actor.system.routine, { async: false });

    context.backgroundColor = this.actor.system.backgroundColor;

    context.comedien = this.actor.system.comedien;
    context.jardin = this.actor.system.jardin;

    return context;
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid);
    if(["arme", "armure", "grace"].includes(item.type)) return false;
    else return super._onDropItem(event, data);
  }

  /**
   * Format les qualités pour les afficher sur la fiche
   * @param {object} qualites
   * @return {object[]}
   */
  #formatQualites(qualites) {
    return Object.values(SYSTEM.QUALITES).map((cfg) => {
      const qualite = foundry.utils.deepClone(cfg);
      return qualite;
    });
  }

  /**
   * Format les aspects por les afficher sur la fiche
   * @param {object} aspects
   * @return {object[]}
   */
  #formatAspects(aspects) {
    return Object.values(SYSTEM.ASPECTS).map((cfg) => {
      const aspect = foundry.utils.deepClone(cfg);
      aspect.label = game.i18n.localize(aspect.label);
      aspect.trad = game.i18n.localize(aspect.trad);
      aspect.valeur = aspects[aspect.id].valeur;
      return aspect;
    });
  }

  /**
   * Format les actions por les afficher sur la fiche
   * _id, name, formulaHtml, formulaTooltip, circonstances
   * @param {object[]} les embedded items de type action
   * @return {object[]}
   */
  #formatActions(actions) {
    let corps;
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    if (cabinet) {
      const corpsId = cabinet.system.corps;
      corps = game.actors.get(corpsId);
    }

    return actions.map((cfg) => {
      const action = foundry.utils.deepClone(cfg);
      // formulaHtml
      action.formulaHtml = action.system.formulaHtml;
      action.formulaTooltip = action.system.getFormulatTooltip(this.actor.system, corps ? corps.system.attributs : null);
      return action;
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".qualite-group").click(this._onQualiteRoll.bind(this));
    html.find(".logo_action").click(this._onActionRoll.bind(this));

    // Activate context menu
    this._contextMenu(html);
  }

  /** @inheritdoc */
  _contextMenu(html) {
    ContextMenu.create(this, html, ".cabinet-contextmenu", this._getEntryContextOptions());
  }

  /**
   * Retourne les context options du menu Esprit
   * @returns {object[]}
   * @private
   */
  _getEntryContextOptions() {
    return [
      {
        name: `Aller dans mon Jardin Secret`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        condition: () => {
          return !this.actor.system.jardin;
        },
        callback: () => this._onAllerJardin(),
      },
      {
        name: `Revenir dans le cabinet`,
        icon: `<i class="fa-regular fa-loveseat"></i>`,
        condition: () => {
          return this.actor.system.jardin;
        },
        callback: () => this._onQuitterJardin(),
      },
      {
        name: `Demander le contrôle`,
        icon: `<i class="fa-solid fa-person-simple"></i>`,
        condition: () => {
          return !this.actor.system.comedien;
        },
        callback: () => this._devenirComedien(),
      },
    ];
  }

  /**
   * @description Jet de compétence depuis une qualité dans l'onglet Qualités
   * @param {*} event
   * @returns
   */
  async _onQualiteRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    // Ne pas déclencher de jet si la feuille est déverrouillée
    if (this.actor.isUnlocked) return;

    let element = event.currentTarget;
    let qualite = element.dataset.field;

    return this.actor.rollSkill(qualite, { dialog: true, title: SYSTEM.QUALITES[qualite].label });
  }

  /**
   * @description Jet de compétence depuis une action dans l'onglet Actions
   * @param {*} event
   * @returns
   */
  async _onActionRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    // Ne pas déclencher de jet si la feuille est déverrouillée
    if (this.actor.isUnlocked) return;

    let element = event.currentTarget;
    console.log("_onActionRoll", element);
    const actionId = element.dataset.field;
    const action = this.actor.items.get(actionId);
    const actionSystem = action.system;

    // Si l'action n'est possible que pour le comédient et que l'esprit n'est pas le comédien, message d'avertissement
    if (actionSystem.controle && !this.actor.system.comedien) return ui.notifications.warn(game.i18n.localize("CDM.WARNING.ActionReserveeComedie"));

    let qualite = actionSystem.qualite;
    const keysToIgnore = ["formula", "formulaTooltip", "circonstances"];
    const defaultValues = Object.fromEntries(Object.entries(actionSystem).filter(([key, value]) => value !== undefined && !keysToIgnore.includes(key)));

    defaultValues.action = action.name;

    // Information du corps si l'esprit est le comédien
    if (this.actor.system.comedien) {
      const cabinetId = game.settings.get("cabinet", "cabinet");
      const cabinet = game.actors.get(cabinetId);
      if (cabinet) {
        const corpsId = cabinet.system.corps;
        const corps = game.actors.get(corpsId);
        const attributs = corps.system.attributs;
        defaultValues.attributs = attributs;
      }
    }

    console.log("_onActionRoll defaultValues", defaultValues);
    return this.actor.rollSkill(qualite, { dialog: true, defaultValues: defaultValues });
  }

  async _onAllerJardin() {
    await this.actor.deplacerPosition(null);
    this.render();
  }

  async _onQuitterJardin() {
    await this.actor.deplacerPosition("auto");
    this.render();
  }

  /**
   *
   */
  async _devenirComedien() {
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    let comedien = game.actors.get(cabinet.system.comedien);

    if (!comedien) {
      await cabinet.majComedien(this.actor.id);
    } else {
      // Informer le MJ
      const html = await renderTemplate("systems/cabinet/templates/chat/demanderComedienButton.hbs", {
        nomEsprit: this.actor.name,
        nomComedien: comedien.name,
      });
      const chatData = {
        speaker: ChatMessage.getSpeaker({
          alias: game.user.name,
          actor: this.actor.id,
        }),
        content: html,
      };
      ChatMessage.create(chatData);

      // send data message to the player session
      /* const emitData = {
        espritDemandeur: this.actor.id,
      };
      game.socket.emit({
        type: "demandeComedien",
        data: emitData,
      });
      */
    }
  }
}
