import { CabinetUtils } from "../utils.mjs";
export default class CabinetPlayerList extends foundry.applications.ui.Players {
  constructor(options) {
    super(options);
    Hooks.on("cabinet.majComedien", async (comedien) => this.render());
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
    console.log("Cabinet | Designer un comédien par le menu MJ", event);
    const li = $(event.currentTarget).closest(".player");
    const id = li.data("userId");
    console.log("Cabinet | Désigner le personnage de l'utilisateur : ", id);
    const character = game.users.get(id).character;

    if (character) {
      let cabinet = CabinetUtils.cabinet();
      if (!cabinet) {
        return ui.notifications.info(game.i18n.localize("CDM.WARNING.cabinetInexistant"));
      }
      if (!character.system.estDansCabinet) return ui.notifications.info(game.i18n.localize("CDM.WARNING.comedienPasDansCabinet"));
      cabinet.majComedien(character.id);
    }
  }

  /** @override */
  getData(options = {}) {
    let context = super.getData((options = {}));
    context.isGM = game.user.isGM;

    context.users = context.users.map((user) => {
      user.isComedien = false;
      user.isComedien = user.character ? game.actors.get(user.character).system.comedien : false;
      return user;
    });

    return context;
  }
}
