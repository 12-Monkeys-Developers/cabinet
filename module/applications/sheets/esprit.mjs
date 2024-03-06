import { CdmChat } from "../../chat.mjs";
import { SYSTEM } from "../../config/system.mjs";
import CabinetActorSheet from "./actor.mjs";
import { CabinetUtils } from "../../utils.mjs";

export default class EspritSheet extends CabinetActorSheet {
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("cabinet.updateCorps", async (corpsId) => this.render());
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }

  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 685,
      height: 630,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "qualites" }],
    });
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "esprit";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.qualites = this.#formatQualites(context.actor.system.qualites);
    context.aspects = this.#formatAspects(context.actor.system.aspects);
    context.actions = this.#formatActions(this.actor.items.filter((i) => i.type === "action"));

    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.acquis.forEach(async (element) => {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
    });

    // Pouvoirs par ordre niveau et mise en forme de la description
    context.pouvoirs = this.actor.items
      .filter((item) => item.type == "pouvoir")
      .sort(function (a, b) {
        return a.system.niveau > b.system.niveau;
      });
    context.pouvoirs.forEach(async (element) => {
      element.system.spherelabel = SYSTEM.SPHERES[element.system.sphere].label;
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
    });

    // corruptions par ordre niveau et mise en forme de la description
    context.corruptions = this.actor.items.filter((item) => item.type == "corruption");
    context.corruptions.forEach(async (element) => {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
    });

    context.adversaireshtml = await TextEditor.enrichHTML(this.actor.system.adversaires, { async: false });
    context.contactshtml = await TextEditor.enrichHTML(this.actor.system.contacts, { async: false });
    context.noteshtml = await TextEditor.enrichHTML(this.actor.system.notes, { async: false });
    context.objetshtml = await TextEditor.enrichHTML(this.actor.system.objets, { async: false });
    context.profilprivatehtml = await TextEditor.enrichHTML(this.actor.system.profil.private, { async: false });
    context.routinehtml = await TextEditor.enrichHTML(this.actor.system.routine, { async: false });

    context.estDansCabinet = this.actor.system.estDansCabinet;
    context.comedien = this.actor.system.comedien;
    context.jardin = this.actor.system.jardin;

    context.backgroundColor = this.actor.system.backgroundColor;

    if (this.actor.system.positionArbre !== "aucune" && this.actor.system.positionArbre !== "jardin") {
      let positionQual = SYSTEM.SPHERES[this.actor.system.positionArbre].qualiteSmall;
      context.comportement = "CDM.SPHERE." + this.actor.system.positionArbre + (this.actor.system.qualites[positionQual].qlipha ? ".defaut" : ".qualite");
    } else context.comportement = "";

    return context;
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await fromUuid(data.uuid);
    if (["arme", "armure", "grace"].includes(item.type)) return false;
    await super._onDropItem(event, data);
    if (item.type === "corruption") Hooks.callAll("cabinet.dropCorruptionOnEsprit", data.uuid);
  }

  /**
   * Formate les qualités pour les afficher sur la fiche
   * @param {object} qualites
   * @return {object[]}
   */
  #formatQualites(qualites) {
    return Object.values(SYSTEM.QUALITES).map((cfg) => {
      const qualite = foundry.utils.deepClone(cfg);
      return qualite;
    });
  }

  /**
   * Formae les aspects por les afficher sur la fiche
   * @param {object} aspects
   * @return {object[]}
   */
  #formatAspects(aspects) {
    return Object.values(SYSTEM.ASPECTS).map((cfg) => {
      const aspect = foundry.utils.deepClone(cfg);
      aspect.label = game.i18n.localize(aspect.label);
      aspect.trad = game.i18n.localize(aspect.trad);
      aspect.valeur = aspects[aspect.id].valeur;
      return aspect;
    });
  }

  /**
   * Formate les actions por les afficher sur la fiche
   * _id, name, formulaHtml, formulaTooltip, circonstances
   * @param {object[]} actions les embedded items de type action
   * @return {object[]}
   */
  #formatActions(actions) {
    let corps;
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (cabinet) {
      const corpsId = cabinet.system.corps;
      corps = game.actors.get(corpsId);
    }

    return actions.map((cfg) => {
      const action = foundry.utils.deepClone(cfg);
      // formulaHtml
      action.formulaHtml = action.system.formulaHtml;
      action.formulaTooltip = action.system.getFormulatTooltip(this.actor.system, corps ? corps.system.attributs : null);
      return action;
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".qualite-group").click(this._onQualiteRoll.bind(this));
    html.find(".logo_action").click(this._onActionRoll.bind(this));

    // Activate context menu
    this._contextCabMenu(html);
  }

  /** @inheritdoc */
  _contextCabMenu(html) {
    ContextMenu.create(this, html, ".cabinet-contextmenu", this._getEntryContextOptions());
  }

  /**
   * Retourne les context options du menu Esprit
   * @returns {object[]}
   * @private
   */
  _getEntryContextOptions() {
    return [
      {
        name: `Aller dans mon Jardin Secret`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        condition: () => {
          if (!this.actor.system.estDansCabinet) return false;
          return !this.actor.system.jardin;
        },
        callback: () => this._onAllerJardin(),
      },
      {
        name: `Revenir dans le cabinet`,
        icon: `<i class="fa-regular fa-loveseat"></i>`,
        condition: () => {
          if (!this.actor.system.estDansCabinet) return false;
          return this.actor.system.jardin;
        },
        callback: () => this._onQuitterJardin(),
      },
      {
        name: `Demander le contrôle`,
        icon: `<i class="fa-solid fa-person-simple"></i>`,
        condition: () => {
          if (!this.actor.system.estDansCabinet) return false;
          return !this.actor.system.comedien;
        },
        callback: () => this._devenirComedien(),
      },
    ];
  }

  /**
   * @description Jet de compétence depuis une qualité dans l'onglet Qualités
   * @param {*} event
   * @returns
   */
  async _onQualiteRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    // Ne pas déclencher de jet si la feuille est déverrouillée
    if (this.actor.isUnlocked) return;

    let element = event.currentTarget;
    let qualite = element.dataset.field;
    if(!CabinetUtils.cabinet()) return ui.notifications.warn(game.i18n.localize("CDM.WARNING.cabinetInexistant"));

    return this.actor.rollSkill(qualite, { dialog: true, title: SYSTEM.QUALITES[qualite].label });
  }

  /**
   * @description Jet de compétence depuis une action dans l'onglet Actions
   * @param {*} event
   * @returns
   */
  async _onActionRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    // Ne pas déclencher de jet si la feuille est déverrouillée
    if (this.actor.isUnlocked) return;
    
    if(!CabinetUtils.cabinet()) return ui.notifications.warn(game.i18n.localize("CDM.WARNING.cabinetInexistant"));

    let element = event.currentTarget;
    console.log("_onActionRoll", element);
    const actionId = element.dataset.field;

    const action = this.actor.items.get(actionId);
    if (!action) return false;

    return await this.actor.rollAction(action);
  }

  /**
   * Menu de l'esprit pour aller dans le jardin
   * Met la position dans l'arbre à null
   */
  async _onAllerJardin() {
    await this.actor.deplacerPosition(null);
    this.render();
  }

  /**
   * Menu de l'esprit pour quitter le jardin
   * Met la position dans l'arbre à auto
   * L'esprit se positionne automatiquement en fonction de ses qualités et de la place disponible
   */
  async _onQuitterJardin() {
    await this.actor.deplacerPosition("auto");
    this.render();
  }

  /**
   * Menu de l'esprit pour demander à devenir comédien
   * S'il n'y a pas de comédien, il devient comédien
   * S'il y a un comédien, il envoie une demande au comédien visible par l'esprit, le comédien et le MJ
   * Le comédien peut accepter ou refuser la demande
   * S'il accepte, l'esprit devient comédien
   * S'il refuse, une proposition de discorde est envoyée à l'esprit et au comédien
   */
  async _devenirComedien() {
    const cabinet = CabinetUtils.cabinet();
    let comedien = game.actors.get(cabinet.system.comedien);

    if (!comedien) {
      await cabinet.majComedien(this.actor.id);
    } else {
      let chatData = {
        actingId: this.actor.id,
        actingCharName: this.actor.name,        
        actingCharImg: this.actor.img,
        idComedien: comedien.id,
        nomComedien: comedien.name,
        introText: game.i18n.format("CDM.COMEDIENCHATMESSAGE.introText", { actingCharName: this.actor.name, comedienName: comedien.name }),
        demande: true,
        accepte: false,
        refuse: false,
        userIdDemandeur: game.user.id
      };

      let chatMessage = await new CdmChat(this.actor).withTemplate("systems/cabinet/templates/chat/demanderComedien.hbs").withData(chatData).withFlags({world: {type: "demandeComedien", idComedien: comedien.id}}).create();
      chatMessage.display();
    }
  }
}
