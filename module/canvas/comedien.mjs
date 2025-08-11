import { ComedienUtils } from "../utils.mjs"

export default class ComedienApp extends FormApplication {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  constructor(cabinet, options = {}) {
    super(cabinet, options)
    // Pour suivre le mouvement de la sidebar
    Hooks.on("collapseSidebar", async (sidebar, collapsed) => this.setPosition())

    // Pour détecter quand une corruption est retirée d'un esprit
    Hooks.on("cabinet.deleteCorruptionOnEsprit", async (uuid) => this.render())

    // Pour détecter quand une corruption est ajoutée à un esprit
    Hooks.on("cabinet.dropCorruptionOnEsprit", async (uuid) => this.render())
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
    })
  }

  /**
   * Positionnement de la fenêtre en fonction du paramètrage et de l'état de la sidebar
   * @returns {int, int} top et left en pixels
   */
  _getCoord() {
    // Top
    let top = 0
    if (game.settings.get("cabinet", "appComedien") === "bas") {
      const hauteur = document.body.scrollHeight
      const nbCorruptions = this.infos !== null ? this.infos.nbCorruptions : 0
      top = hauteur - (250 + 20 * nbCorruptions)
    }

    // Left
    const sidebar = document.getElementById("sidebar")
    const sidebarBounding = sidebar.getBoundingClientRect()
    let left = sidebarBounding.left - 160
    return { top, left }
  }

  /** @inheritdoc */
  async getData(options = {}) {
    let context = {}

    context.comedienDefini = this.object.system.hasComedien

    const infos = this.infos
    context.corruptions = context.comedienDefini ? infos?.corruptions : []
    context.nom = context.comedienDefini ? infos?.nom : null
    context.image = context.comedienDefini ? infos?.image : null

    return context
  }

  /** @override */
  _getHeaderButtons() {
    // Suppression du bouton Close
    const buttons = []
    return buttons
  }

  /** @override */
  setPosition({ left, top } = {}) {
    const position = {
      left: this._getCoord().left,
      top: this._getCoord().top,
    }
    this.element.css(position)
  }

  /**
   * Nombre de corruptions et tableau des corruptions du comédien
   * @returns {Object} {nbCorruptions, corruptions}
   */
  get infos() {
    if (this.object) {
      const comedien = ComedienUtils.actuel()
      if (comedien) {
        let corruptions = comedien.items.filter((i) => i.type === "corruption")
        return { nbCorruptions: corruptions.length, corruptions, image: comedien.img, nom: comedien.name }
      }
    }
    return null
  }

  /** @inheritdoc */
  render(force = false, options = {}) {
    // Register the active OrgDevEditor with the referenced Documents
    this.object.apps[this.appId] = this
    return super.render(force, options)
  }
}
