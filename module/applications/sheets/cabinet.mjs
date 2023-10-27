import CabinetActorSheet from "./actor.mjs";

export default class CabinetSheet extends CabinetActorSheet {
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
  static actorType = "cabinet";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.esprits = this.actor.listeEsprits;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".select-cabinet").click(this._onSelectCabinet.bind(this));
  }  

  /**
   * @description Sélectionne le cabinet comme actif
   * - Met à jour le settings du monde
   * - Donner les droits sur le cabinet à tous les joueurs par défaut
   * @param {*} event
   * @returns
   */
  async _onSelectCabinet(event) {
    event.preventDefault();
    event.stopPropagation();

    let cabinetId = event.currentTarget.dataset.actorId;
    await game.settings.set("cabinet","cabinet",cabinetId);
    await this.actor.update({"ownership.default": 3});
  }  
}
