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
    // console.debug("StandardCheck - constructor", data);
  }

  /**
   * Define the default data attributes for this type of Roll
   * @type {object}
   */
  static defaultData = {
    activitelbl: null,
    actorId: null,
    actorData: null,
    actingCharImg: null,
    actingCharName: null,
    action: null,
    qualite: undefined,
    qualiteValeur: 0,
    deQualite: null,
    difficultes: [],
    difficulte: undefined,
    difficulteValeur: undefined,
    introText: "",
    type: "classique",
    aspect: "neshama",
    aspectValeur: 0,
    listeAcquis: [],
    acquis: undefined,
    acquisValeur: 0,
    listeAttributs: [],
    attributs: undefined,
    attribut: undefined,
    attributValeur: 0,
    perisprit: 0,
    bonus: 0,
    malus: 0,
    peutEmbellie: false, // propose une embellie dans le dialog
    estEmbellie: false, // le jet réussi est une embellie
    tenterEmbellie: false, // tentative d'embellie
    embellieValeur: "", // nombre de dés d'embellie
    totalEmbellie: null, // somme des dés retenus si embellie
    reRollEmbellie: null, // roll en cas de jet explosif sur embellie
    estDesastre: false, // le jet est un désastre
    rollMode: undefined,
    attaque: false,
    arme: undefined,
    armeId: null,
    corpsId: null,
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
    if (this.data.difficulteValeur === undefined) return undefined;
    return this.total >= this.data.difficulteValeur;
  }

  get isDesastre() {
    if (!this._evaluated) return undefined;
    return this.data.estDesastre;
  }

  get isEmblellie() {
    if (!this._evaluated) return undefined;
    return this.data.estEmbellie;
  }

  /* -------------------------------------------- */
  /*  Roll Configuration                          */
  /* -------------------------------------------- */

  /** @override */
  _prepareData(data = {}) {
    //console.debug("StandardCheck - _prepareData", data);
    const current = this.data || foundry.utils.deepClone(this.constructor.defaultData);
    for (let [k, v] of Object.entries(data)) {
      if (v === undefined) delete data[k];
    }
    data = foundry.utils.mergeObject(current, data, { insertKeys: false });
    StandardCheck.#configureData(data);
    //console.debug("StandardCheck - _prepareData - data", data);
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

    data.perispritValeur = data.perisprit !== "" ? parseInt(data.perisprit) : 0;

    if (data.aspect) data.aspectValeur = data.actorData.aspects[data.aspect].valeur;
    if (data.difficulte) data.difficulteValeur = SYSTEM.DIFFICULTES[data.difficulte].seuil;

    // Attribut pour le comédien
    if (data.actorData.comedien && data.attribut) data.attributValeur = data.attributs[data.attribut].valeur;

    const actingChar = game.actors.get(data.actorId);
    data.actingCharImg = actingChar.img;
    data.actingCharName = actingChar.name;
    data.activitelbl = data.action ? data.action + " (" + SYSTEM.QUALITES[data.qualite].label + ")" : SYSTEM.QUALITES[data.qualite].label;

    data.introText = game.i18n.format("CDM.DICECHATMESSAGE.introText", { actingCharName: actingChar.name, activite: data.activitelbl });

    if (data.arme) {
      data.attaque = true;
      data.attaqueNom = data.arme.nom;
    }
  }

  /** @override */
  static parse(_, data) {
    // Construct the formula
    let dices;
    let terms;
    // Avec embellie
    if (data.tenterEmbellie) {
      dices = `${data.embellieValeur}d6`;
    } else {
      // Sans embellie
      dices = `${data.qualiteValeur}d6k`;
    }

    terms = [dices].concat([data.aspectValeur]);
    if (data.acquisValeur > 0) terms.push(data.acquisValeur);
    if (data.attributValeur > 0) terms.push(data.attributValeur);
    if (data.perispritValeur > 0) terms.push(data.perispritValeur);
    if (data.bonus > 0) terms.push(data.bonus);

    let formula = terms.join(" + ");
    if (data.malus > 0) formula = formula + " - " + data.malus;
    // console.debug("formula", formula);

    return super.parse(formula, data);
  }

  /* -------------------------------------------- */

  /** @override */
  async render(chatOptions = {}) {
    if (chatOptions.isPrivate) return "";
    this.data.diceTooltip = await this.getTooltip();
    return foundry.applications.handlebars.renderTemplate(this.constructor.htmlTemplate, this._getChatCardData());
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
      difficulty: this.data.difficulteValeur,
      resultText: "",
      isGM: game.user.isGM,
      formula: this.formula,
      total: this.total,
      images: SYSTEM.IMAGES,
    };

    // Successes and Failures
    if (this.data.difficulteValeur != undefined) {
      if (this.isSuccess) {
        cardData.resultText = "Succès";
        cardData.css.push("succes");
      } else {
        cardData.resultText = "Echec";
        cardData.css.push("echec");
      }
    }

    if (this.isDesastre) {
      cardData.resultText = "Désastre";
      cardData.css.push("desastre");
    }

    if (this.isEmblellie) {
      cardData.resultText = "Embellie";  
      cardData.css.push("embellie");
    }

    cardData.cssClass = cardData.css.join(" ");

    return cardData;
  }

  /**
   * Used to re-initialize the pool with different data
   * @param {object} data
   */
  initialize(data) {
   // console.debug("StandardCheck - initialize", data);
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
    const options = { title, rollMode, roll: this };
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
    let resChatMessage = await super.toMessage(messageData, options);
    if (this.data.reRollEmbellie) {
      const blind = resChatMessage.blind;
      const whisper = resChatMessage.whisper;
      this.data.reRollEmbellie.dice[0].options.rollOrder = 2;
      await game.dice3d.showForRoll(this.data.reRollEmbellie, game.user, true, whisper, blind);
    }
    return resChatMessage;
  }

  /** @override */
  async evaluate({ minimize = false, maximize = false} = {}) {
    /*
     * Jet d'embellie
     * Chaque 6 annule un 1
     * S'il reste un 1 : désastre
     * S'il ne reste plus d'autres dés : résultat = 0
     * S'il reste des dés compris entre 2 et 5 : prendre le meilleur des résultats
     * Si le meilleur dé restant est un 6 : Embelle ! Ajouter le meilleur dé suivant autre qu'un 6. S'il n'y en a pas. Lancer un dé explosif
     */
    if (this.data.peutEmbellie && this.data.tenterEmbellie) {
      console.debug("Standard Roll - Evaluate : Tentative Embellie !");

      let deConserveQualite;
      let desEmbellie;

      await super.evaluate({ minimize, maximize });

      // Difficulte
      if (this.data.difficulte) this.data.difficulteValeur = SYSTEM.DIFFICULTES[this.data.difficulte].seuil;

      const des = this.terms[0].results.map((r) => r.result);
      const desUn = des.filter((d) => d === 1);
      const desSix = des.filter((d) => d === 6);
      const autreDes = des.filter((d) => d !== 1 && d !== 6);

      const nbDeUn = desUn.length;
      const nbDeSix = desSix.length;
      const nbAutresDes = autreDes.length;

      console.debug("Evaluate - des : ", des);

      if (nbDeUn > nbDeSix) {
        console.debug("Evaluate - desastre");
        deConserveQualite = 1;
        this.data.estDesastre = true;
      } else if (nbDeSix > 0 && nbDeSix === nbDeUn) {
        console.debug("Evaluate - egalite");
        if (nbAutresDes === 0) deConserveQualite = 0;
        else {
          deConserveQualite = Math.max(...autreDes);
        }
      } else if (nbDeSix > nbDeUn) {
        console.debug("Evaluate - embellie !");
        this.data.estEmbellie = true;
        deConserveQualite = 6;
        // Addition des 6 restants
        let sixRestant = (nbDeSix - 1 - nbDeUn) * 6;

        // Ajouter le meilleur des dés restants
        if (nbAutresDes > 0) desEmbellie = sixRestant + Math.max(...autreDes);
        // Si pas d'autres dés, jet explosif
        else {
          this.data.reRollEmbellie = await new Roll("1d6x").roll();
          console.debug("Evaluate - reRollEmbellie", this.data.reRollEmbellie);
          desEmbellie = sixRestant + this.data.reRollEmbellie.total;
        }
      }
      // Il n'y a ni 1 ni 6
      else {
        deConserveQualite = Math.max(...autreDes);
      }
      this.data.deQualite = deConserveQualite;
      this.data.totalEmbellie = desEmbellie;

      // Calculer le résultat
      this._total = this._evaluateTotalEmbellie();
      return this;
    } else {
      await super.evaluate({ minimize: false, maximize: false });
      console.debug("Evaluate - Jet normal", this);
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
    const total =
      this.data.deQualite +
      (this.data.totalEmbellie != null ? this.data.totalEmbellie : 0) +
      this.data.aspectValeur +
      this.data.acquisValeur +
      this.data.attributValeur +
      this.data.perispritValeur +
      this.data.bonus -
      this.data.malus;
    return total;
  }
}
