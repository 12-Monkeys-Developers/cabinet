import CabinetActorSheet from "./actor.mjs";

export default class EspritSheet extends CabinetActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 1000,
      height: 770,
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
    context.actions = this.actor.items.filter((i) => i.type === "action");

    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.acquis.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    // Pouvoir par ordre niveau et mise en forme de la description
    context.pouvoirs = this.actor.items
      .filter((item) => item.type == "pouvoir")
      .sort(function (a, b) {
        return a.system.niveau > b.system.niveau;
      });
    context.pouvoirs.forEach((element) => {
      element.system.shperelabel = SYSTEM.SPHERES[element.system.sphere].label;
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    context.profilprivatehtml = TextEditor.enrichHTML(this.actor.system.profil.private, { async: false });
    context.routinehtml = TextEditor.enrichHTML(this.actor.system.routine, { async: false });
    context.contactshtml = TextEditor.enrichHTML(this.actor.system.contacts, { async: false });
    context.adversaireshtml = TextEditor.enrichHTML(this.actor.system.adversaires, { async: false });
    context.objetshtml = TextEditor.enrichHTML(this.actor.system.objets, { async: false });

    context.backgroundColor = this.actor.system.backgroundColor;

    context.comedien = this.actor.system.comedien;
    context.jardin = this.actor.system.jardin;

    return context;
  }

  /**
   * Format les qualités pour les afficher sur la fiche
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
   * Format les aspects por les afficher sur la fiche
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

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".qualite-group").click(this._onQualiteRoll.bind(this));
    html.find(".logo_action").click(this._onActionRoll.bind(this));

    // menu clic droit
    const cabinetContextMenu = [
      {
        name: `Aller dans mon Jardin Secret`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        isVisible: !this.actor.system.jardin,
        callback: () => this._onAllerJardin(),
      },
      {
        name: `Revenir dans le cabinet`,
        icon: `<i class="fa-regular fa-loveseat"></i>`,
        isVisible: this.actor.system.jardin,
        callback: () => this._onQuitterJardin(),
      },
      {
        name: `Demander le contrôle`,
        icon: `<i class="fa-solid fa-person-simple"></i>`,
        isVisible: !this.actor.system.comedien,
        callback: () => this._devenirComedien(),
      },
    ];
    class CMPowerMenu extends ContextMenu {
      constructor(html, selector, menuItems, { eventName = "contextmenu", onOpen, onClose, parent } = {}) {
        super(html, selector, menuItems, {
          eventName: eventName,
          onOpen: onOpen,
          onClose: onClose,
        });
        this.myParent = parent;
        this.originalMenuItems = [...menuItems];
      }

      activateListeners(html) {
        super.activateListeners(html);
        this.menu.css("top", "50px");
        this.menu.css("left", "100px");
      }
      render(...args) {
          this.menuItems = this.originalMenuItems.filter((elem) => {
            return elem.isVisible;
          });
        super.render(...args);
        // console.log($(args).find('nav#context-menu'));
      }
    }
    new CMPowerMenu(html, ".cabinet-contextmenu", cabinetContextMenu, {
      parent: this,
    });
  }

  /**
   *
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
    //console.log("jet de ", qualite);

    return this.actor.rollSkill(qualite, { dialog: true });
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  async _onActionRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    // Ne pas déclencher de jet si la feuille est déverrouillée
    if (this.actor.isUnlocked) return;

    let element = event.currentTarget;
    console.log("_onActionRoll", element);
    const actionId = element.dataset.field;
    const action = this.actor.items.get(actionId);
    //let qualite = element.dataset.field;
    console.log("jet de ", action.name);

    const actionSystem = action.system;
    let qualite = actionSystem.qualite;
    /*let defaultValues = {
      aspect: actionSystem.aspect
    };*/
    const keysToIgnore = ["formula", "formulaTooltip", "circonstances"];
    const defaultValues = Object.fromEntries(Object.entries(actionSystem).filter(([key, value]) => value !== undefined && !keysToIgnore.includes(key)));

    return this.actor.rollSkill(qualite, { dialog: true, defaultValues: defaultValues });
  }

  async _onAllerJardin() {
    if (this.actor.system.estComedien) {
      return ui.notifications.warn("Le Comédien ne peut pas aller dans son jardin secret.");
    }
    await this.actor.update({ "system.positionArbre": "", "system.jardin": true  });
    this.render();
  }
  async _onQuitterJardin() {
    await this.actor.quitterJardin();
    this.render();
  }
  /**
   *
   */
  async _devenirComedien() {
    let comedienId = game.settings.get("cabinet", "comedien");
    let comedien = game.actors.get(comedienId);
    //inform the GM
    const html = await renderTemplate("systems/cabinet/templates/chat/demanderComedienButton.hbs", {
      nomEsprit: this.actor.name,
      nomComedien: comedien.name,
    });
    const chatData = {
      speaker: ChatMessage.getSpeaker({
        alias: game.user.name,
        actor: this.actor.id,
      }),
      content: html,
    };
    ChatMessage.create(chatData);
    //send data message to the player session

    const emitData = {
      espritDemandeur: this.actor.id,
    };
    game.cabinet.emit({
      type: "demandeComedien",
      data: emitData,
    });
  }
}
