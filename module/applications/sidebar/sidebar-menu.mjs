const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;
import { ArbreVieForm } from "../forms/arbre-vie.mjs";

export default class CabinetSidebarMenu extends HandlebarsApplicationMixin(AbstractSidebarTab) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      title: "CDM.sidebar.title",
    },
    actions: {
      openForm: this._onOpenForm,
      openJournal: this._onOpenJournal,
      openArbre: this._onOpenArbre,
    },
  };

  /** @override */
  static tabName = "cabinet";

  /** @override */
  static PARTS = {
    cabinet: {
      template: "systems/cabinet/templates/sidebar-menu.hbs",
      root: true, // Permet d'avoir plusieurs sections dans le hbs
    },
  };

  static async _onOpenForm(event) {
    let calledForm = await game.settings.get("cabinet", event.target.dataset.setting);
    calledForm.render(true);
  }

  static async _onOpenJournal(event) {
    let journal = game.journal.get(event.target.dataset.journal);
    if (journal) journal.sheet.render(true, { pageId: event.target.dataset.page, sheetMode: "text" });
  }

  static async _onOpenArbre(event) {
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (!cabinet) {
      return ui.notifications.warn("L'arbre de vie nécessite un cabinet actif !");
    } else {
      if (cabinet) new ArbreVieForm(cabinet).render(true);
    }
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    return Object.assign(context, {
      version: "Version " + game.system.version,
      sidebarActions: SYSTEM.SIDEBAR_ACTIONS,
    });
  }
}
