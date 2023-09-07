import CabinetActorSheet from "./actor.mjs";

export default class EspritSheet extends CabinetActorSheet {
  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "esprit";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    // Qualités
    context.qualites = this.#formatQualites(context.actor.system.qualites);
    context.aspects = this.#formatAspects(context.actor.system.aspects);

    return context;
  }

  /**
   * Format les qualités por les afficher sur la fiche
   * @param {object} qualites
   * @return {object[]}
   */
  #formatQualites(qualites) {
    return Object.values(SYSTEM.QUALITES).map((cfg) => {
      const qualite = foundry.utils.deepClone(cfg);
      qualite.label = game.i18n.localize(qualite.label);
      qualite.valeur = qualites[qualite.id].valeur;
      qualite.defautLabel = qualites[qualite.id].defaut.label;
      qualite.defautValeur = qualites[qualite.id].defaut.valeur;
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
}
