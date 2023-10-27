import CabinetActorSheet from "./actor.mjs";

export default class CorpsSheet extends CabinetActorSheet {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    //Hooks.on("cabinet.changerComedienAvecGestion", () => this.render());
    //Hooks.on("cabinet.changerComedienAvecPlayer", (id, valeur) => this.render());
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }

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

    let comedien = "";
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);

    if (cabinet) {
      let comedienId = cabinet.system.comedien;
      let comedienName = "";
      if (comedienId) {
        comedienName = game.actors.get(comedienId).name;
        comedien = comedienName;
      }
    }

    context.comedien = comedien;
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
