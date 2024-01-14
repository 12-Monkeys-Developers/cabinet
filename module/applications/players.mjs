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

  /**
   * Designe un esprit comme comédien
   * @param {*} event 
   */
  async _onDesignerComedien(event) {
    console.log("Cabinet | Designer un comédien", event);
    const li = $(event.currentTarget).closest(".player");
    const id = li.data("userId");
    console.log("Cabinet | Utilisateur : ", id);
    const character = game.users.get(id).character;

    if (character) {
      let cabinet = CabinetUtils.cabinet();
      if (cabinet) {
        cabinet.majComedien(character.id);
      }
    }
  }

  /** @override */
  getData(options = {}) {
    let context = super.getData((options = {}));
    context.isGM = game.user.isGM;
    return context;
  }
}
