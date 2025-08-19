import { CdmChat } from "../../chat.mjs"
import { SYSTEM } from "../../config/system.mjs"
import { PnjUtils } from "../../utils.mjs"
import CabinetActorSheet from "./actor.mjs"

export default class PnjSheet extends CabinetActorSheet {
  // TODO A passer en AppV2 avant Foundry V16
  static _warnedAppV1 = true

  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions
    return Object.assign(options, {
      width: 500,
      height: 610,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }],
    })
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "pnj"

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    html[0].querySelectorAll(".logo_embellie").forEach((el) => el.addEventListener("click", this._onEmbellieRoll.bind(this)))
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid)
    if (["action"].includes(item.type)) return false
    else return super._onDropItem(event, data)
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options)

    context.aspects = this.#formatAspects(context.actor.system.aspects)

    context.attributs = this.#formatAttributs(context.actor.system.attributs)
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.actor.system.description, { async: false })

    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
    context.acquis.forEach(async (element) => {
      element.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(element.system.description, { async: false })
    })
    context.armes = this.actor.items.filter((item) => item.type == "arme")
    context.armes.forEach(async (element) => {
      element.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(element.system.description, { async: false })
    })
    context.armures = this.actor.items.filter((item) => item.type == "armure")
    context.prot = {}
    SYSTEM.MEMBRES.forEach((element) => {
      context.prot[element] = this.actor.getProtection(element)
    })
    context.speciaux = this.actor.items.filter((item) => item.type == "grace" || item.type == "corruption" || item.type == "pouvoir")
    context.speciaux.forEach(async (element) => {
      element.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(element.system.description, { async: false })
    })

    context.combat = this.#formatCombat(context.actor.system.combat)
    context.malus = context.actor.system.malus

    context.opinions = SYSTEM.OPINIONS

    return context
  }

  /**
   * Format les aspects por les afficher sur la fiche
   * @param {object} aspects
   * @return {object[]}
   */
  #formatAspects(aspects) {
    return Object.values(SYSTEM.ASPECTS).map((cfg) => {
      const aspect = foundry.utils.deepClone(cfg)
      aspect.label = game.i18n.localize(aspect.label)
      aspect.trad = game.i18n.localize(aspect.trad)
      aspect.valeur = aspects[aspect.id].valeur
      return aspect
    })
  }

  /**
   * Format les attributs pour les afficher sur la fiche
   * @param {object} attributs
   * @return {object[]}
   */
  #formatAttributs(attributs) {
    return Object.values(SYSTEM.ATTRIBUTS).map((cfg) => {
      const attribut = foundry.utils.deepClone(cfg)
      attribut.label = game.i18n.localize(attribut.label)
      attribut.valeur = attributs[attribut.id].valeur
      return attribut
    })
  }

  /**
   * Format les actions de combat pour les afficher sur la fiche
   * @param {object} combat
   * @return {object[]}
   */
  #formatCombat(combats) {
    return Object.values(SYSTEM.COMBAT).map((cfg) => {
      const combat = foundry.utils.deepClone(cfg)
      combat.label = game.i18n.localize(combat.label)
      combat.valeur = combats[combat.id].valeur
      if (!combats[combat.id].hasLabelComplement || combats[combat.id].labelComplement !== "") {
        combat.afficherAction = true
      } else combat.afficherAction = false
      return combat
    })
  }

  /**
   * Jet d'embellie pour les PNJs spéciaux
   * @param {*} event
   */
  async _onEmbellieRoll(event) {
    event.preventDefault()
    event.stopPropagation()
    const roll = await new Roll("2d6").roll()
    const embellie = PnjUtils.detailsEmbellie(roll)
    const data = {
      actingCharName: this.actor.name,
      actingCharImg: this.actor.img,
      introText: game.i18n.format("CDM.DICECHATMESSAGE.embellie", { actingCharName: this.actor.name }),
      total: embellie.total,
      details: embellie.details,
      explosiveRoll: embellie.explosiveRoll,
      tooltip: embellie.tooltip,
      rollMode: "gmroll",
    }
    const rolls = [roll]
    if (embellie.explosiveRoll != null) rolls.push(embellie.explosiveRoll)
    let message = await new CdmChat(this.actor).withTemplate("systems/cabinet/templates/dice/embellie-pnj.hbs").withData(data).withRolls(rolls).create()
    await message.display()
  }
}
