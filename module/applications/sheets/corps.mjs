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
      width: 800,
      height: 750,
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
    const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];

    if (cabinet) {
      let comedienId = cabinet.system.comedien;
      if (comedienId) {
        let comedien = game.actors.get(comedienId);
        context.comedien.name = comedien.name;
        context.comedien.img = comedien.img;
        context.corruptions = comedien.items.filter((item) => item.type == "corruption");
        context.corruptions.forEach((element) => {
          element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
        });
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
    context.prot={};
    SYSTEM.MEMBRES.forEach((element) => {
      context.prot[element]= this.actor.getProtection(element);
    });
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid);
    if (["action", "acquis", "corruption", "grace", "pouvoir"].includes(item.type)) return false;
    else return super._onDropItem(event, data);
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
