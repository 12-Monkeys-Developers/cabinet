import { SYSTEM } from "../../config/system.mjs";
import CabinetActorSheet from "./actor.mjs";

export default class PnjSheet extends CabinetActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 550,
      height: 770,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }],
    });
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "pnj";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.aspects = this.#formatAspects(context.actor.system.aspects);

    context.attributs = this.#formatAttributs(context.actor.system.attributs);
    context.descriptionhtml = TextEditor.enrichHTML(context.actor.system.description, { async: false });

    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.acquis.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    context.combat = this.#formatCombat(context.actor.system.combat);
    context.malus = context.actor.system.malus;

    context.opinions = SYSTEM.OPINIONS;

    return context;
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid);
    if(["action"].includes(item.type)) return false;
    else return super._onDropItem(event, data);
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

    /**
   * Format les actions de combat pour les afficher sur la fiche
   * @param {object} combat
   * @return {object[]}
   */
    #formatCombat(combats) {
      return Object.values(SYSTEM.COMBAT).map((cfg) => {
        const combat = foundry.utils.deepClone(cfg);
        combat.label = game.i18n.localize(combat.label);
        combat.valeur = combats[combat.id].valeur;        
        if (!combats[combat.id].hasLabelComplement || combats[combat.id].labelComplement !== "") {
          combat.afficherAction = true;
        }
        else combat.afficherAction = false;
        return combat;
      });
    }

}
