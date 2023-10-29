import CabinetActorSheet from "./actor.mjs";

export default class CabinetSheet extends CabinetActorSheet {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 900,
      height: 800,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }],
    });
  }

  /**
   * Le type d'Actor qu'affiche cette Sheet
   * @type {string}
   */
  static actorType = "cabinet";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.esprits = this.actor.listeEsprits;
    // Acquis par ordre alpha et mise en forme de la description
    context.acquis = this.actor.items
      .filter((item) => item.type == "acquis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.acquis.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    context.isgm=game.user.isGM;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".select-cabinet").click(this._onSelectCabinet.bind(this));
   
    // Activate context menu
    this._contextMenu(html);
  }


  /** @inheritdoc */
  _contextMenu(html) {
    ContextMenu.create(this, html, ".membre-contextmenu", this._getEntryContextOptions());
  }

  /**
   * Retourne les context options du menu 
   * @returns {object[]}   
   * @private
   */
  _getEntryContextOptions() {
    return [
      {
        name: `Aller dans son Jardin Secret`,
        icon: `<i class="fa-regular fa-face-clouds"></i>`,
        condition: li => {
          const actorId=li.data("actorId");
          const actor=game.actors.get(actorId);
          if(!actor)return false;
          return !actor.system.jardin;
        },
        callback: li => {
          const actorId=li.data("actorId");
          this._onAllerJardin(actorId);
        }
      },
      {
        name: `Revenir dans le cabinet`,
        icon: `<i class="fa-regular fa-loveseat"></i>`,
        condition: li => {
          const actorId=li.data("actorId");
          const actor=game.actors.get(actorId);
          if(!actor)return false;
          return actor.system.jardin;
        },
        callback: li => {
          const actorId=li.data("actorId");
          this._onQuitterJardin(actorId);
        }
      },
      {
        name: `Nommer comedien`,
        icon: `<i class="fa-solid fa-person-simple"></i>`,
        condition: li => {
          const actorId=li.data("actorId");
          const actor=game.actors.get(actorId);
          if(!actor)return false;
          return !actor.system.comedien;
        },
        callback: li => {
          const actorId=li.data("actorId");
          this._onNommerComedien(actorId);
        }
      },
      {
        name: `Enlever`,
        icon: `<i class="fa-solid fa-trash"></i>`,
        condition: true,
        callback: li => {
          const actorPosition=li.data("index");
          const actorId=li.data("actorId");
          this._enleverMembre(actorId, actorPosition);
        }
      },
    ];
  }

  /**
   * @description Sélectionne le cabinet comme actif
   * - Met à jour le settings du monde
   * - Donner les droits sur le cabinet à tous les joueurs par défaut
   * @param {*} event
   * @returns
   */
  async _onSelectCabinet(event) {
    event.preventDefault();
    event.stopPropagation();

    let cabinetId = event.currentTarget.dataset.actorId;
    await game.settings.set("cabinet", "cabinet", cabinetId);
    await this.actor.update({ "ownership.default": 3 });
  }

  async _onAllerJardin(actorId) {
    const actor=game.actors.get(actorId);
    if(!actor)return;
    await actor.deplacerPosition(null, true);
    this.render();
  }

  async _onQuitterJardin(actorId) {
    const actor=game.actors.get(actorId);
    if(!actor)return;
    await actor.deplacerPosition("auto", true);
    this.render();
  }

  async _onNommerComedien(actorId) {
    const actor=game.actors.get(actorId);
    if(!actor)return;
    await this.actor.majComedien(actorId);
    this.render();
  }

  /**
   * Retire un membre de cabinet
   * @param {*} id 
   */
  async _enleverMembre(actorId, actorPosition) {
    //remet d'abord l'esprit dans son jardin pour tout nettoyer
    let esprit=game.actors.get(actorId);
    await esprit.deplacerPosition(null, true);
    //puis supprime l'esprit du cabinet
    let esprits = this.actor.system.esprits;
    const x = esprits.splice(actorPosition, 1);
    await this.actor.update({ "system.esprits": esprits });
    this.render();
  }
  
  /** @override */
  async _onDropActor(event, data) {
    const actor = await fromUuid(data.uuid);
    if (actor.type !== "esprit" && actor.type !== "corps") return false;

    const actorId = actor._id;

    // Drop d'esprit
    if (actor.type === "esprit") {
      let esprits = this.actor.system.esprits;
      if (esprits.includes(actorId)) return false;
      esprits.push(actorId);
      await this.actor.update({ "system.esprits": esprits });
      await actor.update({ "system.jardin": true });
      await actor.update({ "system.comedien": false });
    }

    // Drop de corps
    if (actor.type === "corps") {
      await this.actor.update({ "system.corps": actorId });
    }

    this.render();
  }
}
