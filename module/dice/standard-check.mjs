import StandardCheckDialog from "./standard-check-dialog.mjs";

/**
 * @typedef {Object} DiceCheckBonuses
 * @property {number} [aspectValeur=0]
 * @property {number} [acquisValeur=0]
 * @property {number} [attributValeur=0]
 * @property {number} [perisprit=0]
 * @property {number} [bonus=0]
 * @property {number} [malus=0]
 * @property {boolean} [embellie=false]
 * @property {string} [rollMode]
 */

/**
 * @typedef {DiceCheckBonuses} StandardCheckData
 * @property {string} actorId                         L'ID de l'acteur a l'origine du jet
 * @property {Object} actorData                       Le contenu de system de l'acteur, de type
 * @property {string} qualite                         L'ID de la qualité, par exemple courage
 * @property {{name, valeur}[]} listeAcquis           Les acquis de l'esprit et les acquis collectifs du cabinet
 * @property {number} diff                            The target difficulty of the check
 * @property {string} type                            The type of check being performed : classique, opposition, libre
 */

/**
 * The standard (qualite)d6 dice pool check used by the system.
 *
 * @param {string|StandardCheckData} formula  This parameter is ignored
 * @param {StandardCheckData} [data]          An object of roll data, containing the following optional fields
 */
export default class StandardCheck extends Roll {
  constructor(formula, data) {
    if (typeof formula === "object") {
      data = formula;
      formula = "";
    }
    super(formula, data);    
  }

  /**
   * Define the default data attributes for this type of Roll
   * @type {object}
   */
  static defaultData = {
    actorId: null,
    actorData: null,
    qualite: undefined,
    qualiteValeur: 0,
    deQualite: null,    
    diff: 6,
    type: "classique",
    aspect: undefined,
    aspectValeur: 0,
    listeAcquis: [],
    acquis: undefined,
    acquisValeur: 0,
    attribut: undefined,
    attributValeur: 0,
    perisprit: 0,
    bonus: 0,
    malus: 0,
    peutEmbellie: false,
    estEmbellie: false,
    embellie: undefined,
    embellieValeur: 0,
    totalEmbellie: null,
    desastre: false,
    rollMode: undefined,
  };

  /**
   * Which Dialog subclass should display a prompt for this Roll type?
   * @type {StandardCheckDialog}
   */
  static dialogClass = StandardCheckDialog;

  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static htmlTemplate = "systems/cabinet/templates/dice/standard-check-roll.hbs";

  /**
   * Did this check result in a success?
   * @returns {boolean}
   */
  get isSuccess() {
    if (!this._evaluated) return undefined;
    return this.total >= this.data.diff;
  }

  get isDesastre() {
    if (!this._evaluated) return undefined;
    return this.data.desastre;
  }

  /* -------------------------------------------- */
  /*  Roll Configuration                          */
  /* -------------------------------------------- */

  /** @override */
  _prepareData(data = {}) {
    const current = this.data || foundry.utils.deepClone(this.constructor.defaultData);
    for (let [k, v] of Object.entries(data)) {
      if (v === undefined) delete data[k];
    }
    data = foundry.utils.mergeObject(current, data, { insertKeys: false });
    StandardCheck.#configureData(data);
    return data;
  }

  /**
   * Configure the provided data used to customize this type of Roll
   * @param {object} data     The initially provided data object
   * @returns {object}        The configured data object
   */
  static #configureData(data) {
    const qualite = data.actorData.qualites[data.qualite];
    data.qualiteValeur = qualite.valeur;

    if (data.perisprit !== "") data.perispritValeur = parseInt(data.perisprit);
    data.estEmbellie = data.peutEmbellie && data.embellie !== undefined && data.embellie !== "";

    //TODO Ajouter aspectValeur si aspect est != undefined (pour une action par défaut)

    //TODO Idem attributValeur
  }

  /** @override */
  static parse(_, data) {
    // Construct the formula
    let dices;
    let terms;

    // Sams embellie
    if (!data.estEmbellie) {
      dices = `${data.qualiteValeur}d6k`;
    }

    // Avec embellie
    if (data.estEmbellie) {
      dices = `${data.embellieValeur}d6`;
    }

    terms = [dices].concat([data.aspectValeur]);
    if (data.acquisValeur > 0) terms.push(data.acquisValeur);
    if (data.attributValeur > 0) terms.push(data.attributValeur);
    if (data.perispritValeur > 0) terms.push(data.perispritValeur);
    if (data.bonus > 0) terms.push(data.bonus);

    let formula = terms.join(" + ");
    if (data.malus > 0) formula = formula + " - " + data.malus;

    return super.parse(formula, data);
  }

  /* -------------------------------------------- */

  /** @override */
  async render(chatOptions = {}) {
    if (chatOptions.isPrivate) return "";
    return renderTemplate(this.constructor.htmlTemplate, this._getChatCardData());
  }

  /**
   * Prepare the data object used to render the StandardCheck object to an HTML template
   * @returns {object}      A prepared context object that is used to render the HTML template
   * @private
   */
  _getChatCardData() {
    const cardData = {
      css: [SYSTEM.id, "standard-check"],
      data: this.data,
      difficulty: this.data.diff,
      isGM: game.user.isGM,
      formula: this.formula,
      total: this.total
    };

    // Successes and Failures
    if (this.data.diff) {
      if (this.isSuccess) {
        cardData.outcome = "Success";
        cardData.css.push("success");
      } else {
        cardData.outcome = "Failure";
        cardData.css.push("failure");
      }
    }

    if (this.isDesastre) {
        cardData.outcome = "Failure";
        cardData.css.push("failure");
    }

    cardData.cssClass = cardData.css.join(" ");
    return cardData;
  }

  /**
   * Used to re-initialize the pool with different data
   * @param {object} data
   */
  initialize(data) {
    this.data = this._prepareData(data);
    this.terms = this.constructor.parse("", this.data);
  }

  /**
   * Present a Dialog instance for this pool
   * @param {string} title      The title of the roll request
   * @param {string} flavor     Any flavor text attached to the roll
   * @param {string} rollMode   The requested roll mode
   * @returns {Promise<StandardCheck|null>}   The resolved check, or null if the dialog was closed
   */
  async dialog({ title, flavor, rollMode } = {}) {
    const options = { title, flavor, rollMode, roll: this };
    return this.constructor.dialogClass.prompt({ title, options });
  }

  /** @inheritdoc */
  toJSON() {
    const data = super.toJSON();
    data.data = foundry.utils.deepClone(this.data);
    return data;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async toMessage(messageData, options = {}) {
    options.rollMode = options.rollMode || this.data.rollMode;
    messageData.content ||= "";
    return super.toMessage(messageData, options);
  }

  /** @override */
  async evaluate({ minimize = false, maximize = false, async = true } = {}) {
    // Jet d'embellie
    if (this.data.peutEmbellie && this.data.embellie !== "") {
      let deConserveQualite;
      let desEmbellie;
      console.log("Standard Roll - Evaluate : Embellie !");
      await super.evaluate({ minimize, maximize, async });

      const des = this.terms[0].results.map((r) => r.result);
      const nbDeUn = des.filter((d) => d === 1).length;
      const nbDeSix = des.filter((d) => d === 6).length;
      
      console.log("Evaluate - des : ", des);

      if (nbDeSix === nbDeUn) {
        console.log("egalite");
        const tableau = des.filter((d) => d !== 1 && d !== 6);
        if (tableau.length === 0) deConserveQualite = 0;
        else {
          deConserveQualite = Math.max(...tableau);
        }
      } else if (nbDeSix > nbDeUn) {
        console.log("embellie possible");
        // Suppression des 1
        let tableau = des.filter((d) => d !== 1);
        // Supprimer autant de "6" que d'éléments "1" supprimés
        for (let i = 0; i < nbDeUn; i++) {
          const index = tableau.indexOf(6);
          if (index !== -1) {
            tableau.splice(index, 1);
          }
        }
        const max = Math.max(...tableau);
        deConserveQualite = max;
        if (max === 6) {
          const newRoll = await new Roll("1d6x").roll();
          console.log("Evaluate - newRoll", newRoll);
          desEmbellie = newRoll.total;
        }
      } else {
        console.log("desastre");
        this.data.desastre = true;
      }
      console.log("Evaluate - deConserveQualite : ", deConserveQualite);
      console.log("Evaluate - desEmbellie : ", desEmbellie);
      this.data.deQualite = deConserveQualite;
      this.data.totalEmbellie = desEmbellie;

      // Calculer le résultat
      this._total = this._evaluateTotalEmbellie();
      return this;
    } else {
        console.log("Evaluate - Jet normal");
        await super.evaluate({minimize: false, maximize: false,async: true });
        console.log("Evaluate - Jet normal", this);
        this.data.deQualite = this.dice[0].total;
        return this;
    }
  }

   /**
   * Safely evaluate the final total result for the Roll using its component terms.
   * @returns {number}    The evaluated total
   * @private
   */
    _evaluateTotalEmbellie() {
      const total = this.data.deQualite + (this.data.totalEmbellie != null ? this.data.totalEmbellie : 0) + this.data.aspectValeur + this.data.acquisValeur + this.data.attributValeur + this.data.perispritValeur + this.data.bonus - this.data.malus;
      return total;
    }
}
