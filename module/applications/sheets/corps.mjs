import { ComedienUtils, CabinetUtils } from "../../utils.mjs";
import CabinetActorSheet from "./actor.mjs";

export default class CorpsSheet extends CabinetActorSheet {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }

  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 550,
      height: 600,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }],
    });
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "corps";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.attributs = this.#formatAttributs(context.actor.system.attributs);

    context.comedien = {
      name: "Pas de contrôle",
      img: null,
    };
    const cabinet = CabinetUtils.cabinet();

    if (cabinet) {
      const comedien = ComedienUtils.actuel();
      if (comedien) {
        context.comedien.name = comedien.name;
        context.comedien.img = comedien.img;
        context.corruptions = comedien.items.filter((item) => item.type == "corruption");
        context.corruptions.forEach((element) => {
          element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
        });
        // Les actions de combat sont sur le corps mais visible uniquement s'il y a un comédien
        context.combat = this.#formatCombat(this.actor.items.filter((item) => item.type == "action" && item.system.categorie === "combat"));
      }
    }
    context.malus = context.actor.system.malus;

    context.noteshtml = TextEditor.enrichHTML(this.actor.system.notes, { async: false });
    context.equipementhtml = TextEditor.enrichHTML(this.actor.system.equipement, { async: false });
    context.descriptionhtml = TextEditor.enrichHTML(this.actor.system.description, { async: false });

    context.armes = this.actor.items.filter((item) => item.type == "arme");
    context.armes.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    context.armures = this.actor.items.filter((item) => item.type == "armure");
    context.prot = {};
    SYSTEM.MEMBRES.forEach((element) => {
      context.prot[element] = this.actor.getProtection(element);
    });
    return context;
  }

  /**
   * Formate les actions de combat pour les afficher sur la fiche
   * _id, name, formulaHtml, formulaTooltip, circonstances
   * @param {object[]} actions les embedded items de type action
   * @return {object[]}
   */
  #formatCombat(actions) {
    let corps;
    let comedien;
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (cabinet) {
      const corpsId = cabinet.system.corps;
      if (corpsId !== this.actor.id) return [];
      corps = this.actor;
      const comedienId = cabinet.system.comedien;
      if (comedienId) {
        comedien = game.actors.get(comedienId);
      }
    }

    return actions.map((cfg) => {
      const action = foundry.utils.deepClone(cfg);
      // formulaHtml
      action.formulaHtml = action.system.formulaHtml;
      action.formulaTooltip = action.system.getFormulatTooltip(comedien?.system, corps ? corps.system.attributs : null);
      return action;
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".logo_action").click(this._onActionRoll.bind(this));
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
    if (!action) return false;

    // Une action du corps est réalisée par le comédien
    const comedien = ComedienUtils.actuel();
    if (!comedien) return ui.notifications.console.warn(game.i18n.localize("CABINET.WARNING.comedienInexistant"));
    
    return await comedien.rollAction(action);
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid);
    if (["acquis", "corruption", "grace", "pouvoir"].includes(item.type)) return false;
    if (item.type === "action" && item.system.categorie !== "combat") return false;
    return super._onDropItem(event, data);
  }

  /**
   * Format les attributs pour les afficher sur la fiche
   * @param {object} attributs
   * @return {object[]}
   */
  #formatAttributs(attributs) {
    return Object.values(SYSTEM.ATTRIBUTS).map((cfg) => {
      const attribut = foundry.utils.deepClone(cfg);
      attribut.label = game.i18n.localize(attribut.label);
      attribut.valeur = attributs[attribut.id].valeur;
      return attribut;
    });
  }
}
