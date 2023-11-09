import CabinetActor from "../documents/actor.mjs";
export default class ComedienApp extends Application {
  constructor(comedien, options = {}) {
    super(options);
    // Pour suivre le mouvement de la sidebar
    Hooks.on("collapseSidebar", async (sidebar, collapsed) => this.setPosition());
    // Pour détecter un changement de comédien
    Hooks.on("cabinet.majComedien", async (comedien) => {
      this.comedien = comedien;
      this.render(true);
    });
    // Pour détecter quand une corruption est retirée d'un esprit
    Hooks.on("cabinet.deleteCorruptionOnEsprit", async (uuid) => this.render());
    // Pour détecter quand une corruption est ajoutée à un esprit
    Hooks.on("cabinet.dropCorruptionOnEsprit", async (uuid) => this.render());

    this.comedien = comedien;
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

  /**
   * Positionnement de la fenêtre en fonction du paramètrage et de l'état de la sidebar
   * @returns {int, int} top et left en pixels
   */
  _getCoord() {
    // Top
    let top = 0;
    if (game.settings.get("cabinet", "appComedien") === "bas") {
      const hauteur = document.body.scrollHeight;
      top = hauteur - (250 + 20 * this.infos.nbCorruptions);
    }

    // Left
    const sidebar = document.getElementById("sidebar");
    const sidebarBounding = sidebar.getBoundingClientRect();
    let left = sidebarBounding.left - 160;
    return { top, left };
  }

  /** @inheritdoc */
  async getData(options = {}) {
    let context = {};

    context.comedienDefini = this.comedien === null ? false : true;
    context.corruptions = context.comedienDefini ? this.infos.corruptions : [];
    context.comedien = context.comedienDefini ? this.comedien : null;

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

  /**
   * Nombre de corruptions et tableau des corruptions du comédien
   * @returns {Object} {nbCorruptions, corruptions}
   */
  get infos() {
    if (this.comedien) {
      let corruptions = this.comedien.items.filter((i) => i.type === "corruption");
      return { nbCorruptions: corruptions.length, corruptions };
    } else return null;
  }
}
