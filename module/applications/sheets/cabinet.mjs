import CabinetActorSheet from "./actor.mjs"

export default class CabinetSheet extends CabinetActorSheet {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  /** @override */
  constructor(object, options = {}) {
    super(object, options)
    Hooks.on("updateActor", async (document, change, options, userId) => this.render())
  }

  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions
    return Object.assign(options, {
      width: 750,
      height: 800,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }],
    })
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "cabinet"

  /** @override */
  async getData(options) {
    const context = await super.getData(options)
    context.esprits = this.actor.listeEsprits
    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
    context.acquis.forEach(async (element) => {
      element.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(element.system.description, { async: false })
    })
    context.corps = game.actors.get(this.actor.system.corps)
    context.isgm = game.user.isGM

    context.graces = this.actor.items
      .filter((item) => item.type == "grace")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
    context.graces.forEach(async (element) => {
      element.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(element.system.description, { async: false })
    })

    context.adversaireshtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.adversaires, { async: false })
    context.contactshtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.contacts, { async: false })
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.description, { async: false })
    context.noteshtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.notes, { async: false })

    return context
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    // Activate context menu
    this._contextCabMenu(html)
  }

  /** @inheritdoc */
  _contextCabMenu(html) {
    ContextMenu.create(this, html, ".membre-contextmenu", this._getMembreEntryContextOptions())
    ContextMenu.create(this, html, ".corps-contextmenu", this._getCorpsEntryContextOptions())
  }

  /**
   * Retourne les context options du menu Membre
   * @returns {object[]}
   * @private
   */
  _getMembreEntryContextOptions() {
    return [
      {
        name: `Aller dans son Jardin Secret`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        condition: (li) => {
          const actorId = li.data("actorId")
          const actor = game.actors.get(actorId)
          if (!actor) return false
          return !actor.system.jardin
        },
        callback: (li) => {
          const actorId = li.data("actorId")
          this._onAllerJardin(actorId)
        },
      },
      {
        name: `Revenir dans le cabinet`,
        icon: `<i class="fa-regular fa-loveseat"></i>`,
        condition: (li) => {
          const actorId = li.data("actorId")
          const actor = game.actors.get(actorId)
          if (!actor) return false
          return actor.system.jardin
        },
        callback: (li) => {
          const actorId = li.data("actorId")
          this._onQuitterJardin(actorId)
        },
      },
      {
        name: `Nommer comédien`,
        icon: `<i class="fa-solid fa-person-simple"></i>`,
        condition: (li) => {
          const actorId = li.data("actorId")
          const actor = game.actors.get(actorId)
          if (!actor) return false
          return !actor.system.comedien
        },
        callback: (li) => {
          const actorId = li.data("actorId")
          this._onNommerComedien(actorId)
        },
      },
      {
        name: `Enlever`,
        icon: `<i class="fa-solid fa-trash"></i>`,
        condition: true,
        callback: (li) => {
          const actorPosition = li.data("index")
          const actorId = li.data("actorId")
          const actor = game.actors.get(actorId)
          if (!actor) return false
          this._onEnleverMembre(actorId, actorPosition)
        },
      },
    ]
  }

  /**
   * Retourne les context options du menu Corps
   * @returns {object[]}
   * @private
   */
  _getCorpsEntryContextOptions() {
    return [
      {
        name: `Inconscience`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        condition: (li) => {
          return this.actor.system.corps ? true : false
        },
        callback: (li) => {
          this._endormirCorps()
        },
      },
      {
        name: `Enlever`,
        icon: `<i class="fa-solid fa-trash"></i>`,
        condition: true,
        callback: (li) => {
          const actorId = li.data("actorId")
          this._enleverCorps(actorId)
        },
      },
    ]
  }

  /** @override */
  async _onDropActor(event, data) {
    const actor = await fromUuid(data.uuid)
    if (!["esprit", "corps"].includes(actor.type)) return false

    const actorId = actor._id

    // Drop d'esprit
    if (actor.type === "esprit") {
      this.actor.ajouterEsprit(actor)
    }

    // Drop d'un corps
    if (actor.type === "corps") {
      // S'il y a déjà un corps dans le cabinet
      if (this.actor.system.corps) {
        // Récupère le corps déjà dans le cabinet et casse le lien avec le cabinet
        // Récupère le comédien s'il y en a
        const corps = game.actors.get(this.actor.system.corps)
        corps.update({ "system.cabinet": null })
      }
      // Ajout du nouveau corps dans le cabinet
      await this.actor.update({ "system.corps": actorId })
      // Ajout du lien du cabinet dans le corps
      await actor.update({ "system.cabinet": this.actor._id })
    }

    this.render()
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid)
    if (["action", "arme", "armure", "corruption", "pouvoir"].includes(item.type)) return false
    else return super._onDropItem(event, data)
  }

  /**
   * Déplace un membre dans son jardin
   * @param {*} id
   */
  async _onAllerJardin(actorId) {
    const actor = game.actors.get(actorId)
    if (!actor) return
    await actor.deplacerPosition(null, true)
    this.render()
  }

  /**
   * Déplace un membre hors de son jardin avec un déplacement automatique vers la position libre
   * Attribution automatique selon la qualité la plus haute si la sphère est libre
   * @param {*} id
   */
  async _onQuitterJardin(actorId) {
    const actor = game.actors.get(actorId)
    if (!actor) return
    await actor.deplacerPosition("auto", true)
    this.render()
  }

  /**
   * Nomme un des esprits comme comédien
   * @param {*} id
   *
   */
  async _onNommerComedien(actorId) {
    const actor = game.actors.get(actorId)
    if (!actor) return
    await this.actor.majComedien(actorId)
    this.render()
  }

  /**
   * Retire un membre de cabinet
   * @param {*} id
   */
  async _onEnleverMembre(actorId, actorPosition) {
    // Remet d'abord l'esprit dans son jardin pour tout nettoyer
    let esprit = game.actors.get(actorId)
    await esprit.deplacerPosition(null, true)
    // Supprime la position de l'esprit
    await esprit.update({ "system.positionArbre": "aucune" })
    // Puis supprime l'esprit du cabinet
    let esprits = this.actor.system.esprits
    const x = esprits.splice(actorPosition, 1)
    await this.actor.update({ "system.esprits": esprits })
    this.render()
  }

  /**
   * Endort tous les corps du cabinet
   * Renvoie les esprits dans leur jardin
   */
  async _endormirCorps() {
    for (let membreId of this.actor.system.esprits) {
      const membre = game.actors.get(membreId)
      await membre.deplacerPosition(null, true)
    }
    this.render()
  }

  /**
   * Enlève le corps du cabinet
   * Supprime l'id du corps dans le cabinet
   */
  async _enleverCorps(actorId) {
    let corps = game.actors.get(actorId)
    await corps.update({ "system.cabinet": null })
    await this.actor.update({ "system.corps": null })
    this.render()
  }
}
