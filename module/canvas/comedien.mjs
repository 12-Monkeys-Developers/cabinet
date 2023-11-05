export default class ComedienApp extends Application {
  constructor(options = {}) {
    super(options);
    Hooks.on("collapseSidebar", async (sidebar, collapsed) => this.setPosition());
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
    //Hooks.on("dropActorSheetData", async (actor, sheet, data) => this.render());
    Hooks.on("cabinet.dropCorruptionOnEsprit", async (item) => this.render(true));    
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "comedien",
      template: `systems/${SYSTEM.id}/templates/canvas/comedien.hbs`,
      popOut: true,
      minimizable: false,
      classes: ["app-comedien"],
      title: "Comédien",
    });
  }

  _getCoord() {
    const sidebar = document.getElementById("sidebar");
    const sidebarRect = sidebar.getBoundingClientRect();

    let top = 0;
    if (game.settings.get("cabinet", "appComedien") === "bas") {
      top = 1000;
    }

    let left = sidebarRect.left - 172;
    return { top, left };
  }

  /** @inheritdoc */
  async getData(options = {}) {
    let context = {};

    let comedienId;
    let comedien;

    const cabinetId = game.settings.get("cabinet", "cabinet");
    let cabinet;
    if (cabinetId) cabinet = game.actors.get(cabinetId);
    if (cabinet) {
      comedienId = cabinet.system.comedien;
    }
    if (comedienId) comedien = await game.actors.get(comedienId);
    if (comedien) {
      context.comedienDefini = true;
      context.comedien = comedien;
      //context.corruptions = comedien.corruptions;
      context.corruptions = comedien.items.filter(i => i.type === "corruption")
    }
    else context.comedienDefini = false;

    return context;
  }

  /** @override */
  _getHeaderButtons() {
    // Suppression du bouton Close
    const buttons = [];
    for (let cls of this.constructor._getInheritanceChain()) {
      Hooks.call(`get${cls.name}HeaderButtons`, this, buttons);
    }
    return buttons;
  }

  /** @override */
  setPosition({ left, top } = {}) {
    const position = {
      left: this._getCoord().left,
      top: this._getCoord().top,
    };
    this.element.css(position);
  }
}
