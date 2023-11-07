export default class ComedienApp extends Application {
  constructor(options = {}) {
    super(options);
    // Pour suivre le mouvement de la sidebar
    Hooks.on("collapseSidebar", async (sidebar, collapsed) => this.setPosition());
    // Pour détecter un changement de comédien
    Hooks.on("cabinet.majComedien", async (comedienId) => this.render());
    // Pour détecter quand une corruption est retirée d'un esprit    
    Hooks.on("cabinet.deleteCorruptionOnEsprit", async (uuid) => this.render());
    // Pour détecter quand une corruption est ajoutée à un esprit
    Hooks.on("cabinet.dropCorruptionOnEsprit", async (uuid) => this.render());
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "comedien",
      baseApplication: "ComedienApp",
      template: `systems/${SYSTEM.id}/templates/canvas/comedien.hbs`,
      popOut: true,
      minimizable: false,
      classes: ["app-comedien"],
      title: "Comédien",
    });
  }

  _getCoord() {
    const sidebar = document.getElementById("sidebar");
    const sidebarBounding= sidebar.getBoundingClientRect();
    
    let top = 0;
    if (game.settings.get("cabinet", "appComedien") === "bas") {
      const hauteur = document.body.scrollHeight;
      top = hauteur - 200;
    }

    let left = sidebarBounding.left - 150;
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
      context.corruptions = comedien.items.filter((i) => i.type === "corruption");
    } else context.comedienDefini = false;

    return context;
  }

  /** @override */
  _getHeaderButtons() {
    // Suppression du bouton Close
    const buttons = [];
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
