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
      template: `systems/${SYSTEM.id}/templates/dice/standard-check-dialog.hbs`,
      classes: ["cabinet", "roll"],
      submitOnChange: true,
      closeOnSubmit: false,
    });
  }

  /** @override */
  get title() {
    if (this.options.title) return this.options.title;
    const type = this.roll.data.type;
    //const skill = SYSTEM.SKILLS[type];
    //if ( skill ) return `${skill.name} Skill Check`;
    return "Generic Dice Check";
  }

  /** @override */
  async getData(options = {}) {
    const data = this.roll.data;

    // Si comédien et positionné sur la qualité utilisée
    const comedien = data.actorData.comedien;
    const position = data.actorData.positionArbre; //tieferet
    const qualite = data.qualite;
    const sphere = SYSTEM.QUALITES[qualite].sphere;
    const jardin = data.actorData.jardin;

    let peutEmbellie = false;
    if (comedien && !jardin && position === sphere) peutEmbellie = true;

    data.peutEmbellie = peutEmbellie;

    const optionsEmbellie = Array.from({ length: data.qualiteValeur }, (_, index) => ({ indice: index + 1, label: index + 1 }));
    const optionsPerisprit = Array.from({ length: data.actorData.perisprit }, (_, index) => ({ indice: index + 1, label: index + 1 }));

    return Object.assign({}, data, {
      //dice: this.roll.dice.map(d => `d${d.faces}`),
      //difficulty: this._getDifficulty(data.diff),
      //difficulties: Object.entries(SYSTEM.dice.checkDifficulties).map(d => ({dc: d[0], label: `${d[1]} (DC ${d[0]})`})),
      isGM: game.user.isGM,
      rollMode: this.options.rollMode || game.settings.get("core", "rollMode"),
      rollModes: CONFIG.Dice.rollModes,
      aspects: SYSTEM.ASPECTS,
      qualites: SYSTEM.QUALITES,
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
    html.find('select[name="perisprit"]').change(this._onChangeAction.bind(this));
    html.find('select[name="embellie"]').change(this._onChangeAction.bind(this));
    html.find('input[name="bonus"]').change(this._onChangeAction.bind(this));  
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
        this.roll.initialize({ acquis: newAcquis, acquisValeur: this.roll.data.listeAcquis[newAcquis].valeur });
        return this.render(false, { height: "auto" });
      case "perisprit-change":
        const newPerisprit = event.currentTarget.value;
        this.roll.initialize({ perisprit: newPerisprit });
        return this.render(false, { height: "auto" });
      case "embellie-change":
        const newEmbellie = event.currentTarget.value;
        this.roll.initialize({ embellie: newEmbellie, embellieValeur: newEmbellie});
        return this.render(false, { height: "auto" });
      case "bonus-change":
        const newBonus = event.currentTarget.value;
        this.roll.initialize({ bonus: newBonus});
        return this.render(false, { height: "auto" });
    }
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