import { SYSTEM } from "../config/system.mjs";

/**
 * Prompt the user to perform a Standard Check.
 * @extends {Dialog}
 */
export default class StandardCheckDialog extends Dialog {
  /**
   * A StandardCheck dice instance which organizes the data for this dialog
   * @type {StandardCheck}
   */
  roll = this.options.roll;

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 280,
      classes: ["cabinet", "roll"],
      template: `systems/${SYSTEM.id}/templates/dice/standard-check-dialog.hbs`,
      submitOnChange: true,
      closeOnSubmit: false,
    });
  }

  /** @override */
  async getData(options = {}) {
    const data = this.roll.data;

    const estComedien = data.actorData.comedien;
    const position = data.actorData.positionArbre; // tieferet
    const qualite = data.qualite;
    const sphere = SYSTEM.QUALITES[qualite].sphere;
    const jardin = data.actorData.jardin;

    let peutEmbellie = false;
    // Si comédien et positionné sur la qualité utilisée : embellie possible
    if (estComedien && !jardin && position === sphere) peutEmbellie = true;
    data.peutEmbellie = peutEmbellie;
    const optionsEmbellie = Array.from({ length: data.qualiteValeur }, (_, index) => ({ indice: index + 1, label: (index + 1).toString()+"D" }));

    const optionsPerisprit = Array.from({ length: data.actorData.perisprit }, (_, index) => ({ indice: index + 1, label: index + 1 }));

    data.estComedien = estComedien;

    data.attributs = [];
    data.malus = 0;
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    const corpsId = cabinet.system.corps;
    const corps = game.actors.get(corpsId);
    if (corps) {
      // Attribut ?
      if (estComedien) {
        data.attributs = corps.system.attributs;
        data.malus = corps.system.malus;
      } else {
      }
    }

    return Object.assign({}, data, {
      //dice: this.roll.dice.map(d => `d${d.faces}`),
      //difficulty: this._getDifficulty(data.diff),
      //difficulties: Object.entries(SYSTEM.dice.checkDifficulties).map(d => ({dc: d[0], label: `${d[1]} (DC ${d[0]})`})),
      isGM: game.user.isGM,
      rollMode: this.options.rollMode || game.settings.get("core", "rollMode"),
      rollModes: CONFIG.Dice.rollModes,
      difficultes: SYSTEM.DIFFICULTES,
      aspects: SYSTEM.ASPECTS,
      qualites: SYSTEM.QUALITES,
      listeAttributs: SYSTEM.ATTRIBUTS,
      listeAcquis: data.listeAcquis,
      optionsEmbellie: optionsEmbellie,
      optionsPerisprit: optionsPerisprit,
    });
  }

  /**
   * Get the text label for a dice roll diff
   * @param {number} diff    The difficulty check for the test
   * @return {{dc: number, label: string, tier: number}}
   * @private
   */
  /*
    _getDifficulty(diff) {
      let label = "";
      let tier = 0;
      for ( let [d, l] of Object.entries(SYSTEM.dice.checkDifficulties) ) {
        if ( diff >= d ) {
          tier = d;
          label = `${l} (DC ${d})`;
        }
        else break;
      }
      return {dc: diff, label, tier};
    }
    */

  /** @override */
  activateListeners(html) {
    html.find('select[name="qualite"]').change(this._onChangeAction.bind(this));
    html.find('select[name="aspect"]').change(this._onChangeAction.bind(this));
    html.find('select[name="acquis"]').change(this._onChangeAction.bind(this));
    html.find('select[name="attribut"]').change(this._onChangeAction.bind(this));
    html.find('select[name="perisprit"]').change(this._onChangeAction.bind(this));
    html.find('select[name="embellie"]').change(this._onChangeAction.bind(this));
    html.find('input[name="bonus"]').change(this._onChangeAction.bind(this));
    html.find('select[name="difficulte"]').change(this._onChangeDifficulte.bind(this));
    super.activateListeners(html);
  }

  /**
   * Handle execution of one of the dialog roll actions
   * @private
   */
  _onChangeAction(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    switch (action) {
      case "qualite-change":
        const newQualite = event.currentTarget.value;
        this.roll.initialize({ qualite: newQualite, qualiteValeur: this.roll.data.actorData.qualites[newQualite].valeur });
        return this.render(false, { height: "auto" });
      case "aspect-change":
        const newAspect = event.currentTarget.value;
        this.roll.initialize({ aspect: newAspect, aspectValeur: this.roll.data.actorData.aspects[newAspect].valeur });
        return this.render(false, { height: "auto" });
      case "acquis-change":
        const newAcquis = event.currentTarget.value;
        if (newAcquis !== "") this.roll.initialize({ acquis: newAcquis, acquisValeur: this.roll.data.listeAcquis[newAcquis].valeur });
        else this.roll.initialize({ acquis: newAcquis, acquisValeur: 0 });
        return this.render(false, { height: "auto" });
      case "attribut-change":
        const newAttribut = event.currentTarget.value;
        if (newAttribut !== "") this.roll.initialize({ attribut: newAttribut, attributValeur: this.roll.data.attributs[newAttribut].valeur });
        else this.roll.initialize({ attribut: newAttribut, attributValeur: 0 });
        return this.render(false, { height: "auto" });
      case "perisprit-change":
        const newPerisprit = event.currentTarget.value;
        this.roll.initialize({ perisprit: newPerisprit });
        return this.render(false, { height: "auto" });
      case "embellie-change":
        const newEmbellie = event.currentTarget.value;
        this.roll.initialize({ embellie: newEmbellie, embellieValeur: newEmbellie });
        return this.render(false, { height: "auto" });
      case "bonus-change":
        const newBonus = event.currentTarget.value;
        this.roll.initialize({ bonus: newBonus });
        return this.render(false, { height: "auto" });
    }
  }

  /**
   * Handle changes to the difficulty select input
   * @param {Event} event           The event which triggers on select change
   * @private
   */
  _onChangeDifficulte(event) {
    event.preventDefault();
    event.stopPropagation();
    const newDifficulte = event.currentTarget.value;
    this.roll.initialize({ difficulte: newDifficulte });
    return this.render(false, { height: "auto" });
  }

  /*  Factory Methods                             */

  /** @inheritdoc */
  static async prompt(config = {}) {
    config.callback = this.prototype._onSubmit;
    config.options.jQuery = false;
    config.rejectClose = false;
    return super.prompt(config);
  }

  /**
   * Return dialog submission data as a form data object
   * @param {HTMLElement} html    The rendered dialog HTML
   * @returns {StandardCheck}     The processed StandardCheck instance
   * @private
   */
  _onSubmit(html) {
    const form = html.querySelector("form");
    const fd = new FormDataExtended(form);
    this.roll.initialize(fd.object);
    return this.roll;
  }
}
