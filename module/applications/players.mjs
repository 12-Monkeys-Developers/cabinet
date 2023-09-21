export default class CabinetPlayerList extends PlayerList {

  constructor(options) {
    super(options);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cabinet/templates/user/players.html",
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".fa-solid.fa-person").click(this._onDesignerComedien.bind(this));
  }

  async _onDesignerComedien(event) {
    console.log("Comedien :", event);
    const li = $(event.currentTarget).closest(".player");
    const id = li.data("userId");
    console.log("User : ", id);
    const character = game.users.get(id).character;

    if (character) {
      // Comedien actuel
      const idComedienActuel = game.settings.get("cabinet", "comedien");
      const current = game.actors.get(idComedienActuel);
      if (current) await current.update({ "system.comedien": false });
      
      game.settings.set("cabinet", "comedien", character.id);
      await character.update({ "system.comedien": true, "system.jardin": false });

      const allowed = Hooks.call("cabinet.changerComedien", id, true);
      if ( allowed === false ) return;
    }
  }

  /** @override */
  getData(options = {}) {
    let context = super.getData((options = {}));
    context.isGM = game.user.isGM;
    //context.hasEsprit = game.user.character !== null;
    return context;
  }
}
