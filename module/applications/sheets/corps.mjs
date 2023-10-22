import CabinetActorSheet from "./actor.mjs";

export default class EspritSheet extends CabinetActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 900,
      height: 800,
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
    
    const comedienId = context.actor.system.comedien;
    const comedienName = game.actors.get(comedienId).name;    
    context.comedien = comedienName;

    context.malus = context.actor.system.malus;

    return context;
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
