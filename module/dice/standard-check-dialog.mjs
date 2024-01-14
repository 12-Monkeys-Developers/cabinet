import { SYSTEM } from "../config/system.mjs";
import { CabinetUtils } from "../utils.mjs";

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

    const comedien = data.actorData.comedien;
    const position = data.actorData.positionArbre; // tieferet
    const qualite = data.qualite;
    const sphere = SYSTEM.QUALITES[qualite].sphere;
    const jardin = data.actorData.jardin;
    let rollMode= data.rollMode ?? game.settings.get("core", "rollMode");

    let peutEmbellie = false;
    // Si positionné sur la qualité utilisée : embellie possible
    if (!jardin && position === sphere) peutEmbellie = true;
    data.peutEmbellie = peutEmbellie;
    const optionsEmbellie = Array.from({ length: data.qualiteValeur }, (_, index) => ({ indice: index + 1, label: (index + 1).toString()+"D" }));

    const optionsPerisprit = Array.from({ length: data.actorData.perisprit }, (_, index) => ({ indice: index + 1, label: index + 1 }));

    data.comedien = comedien;

    data.attributs = [];
    data.malus = 0;
    const cabinet = CabinetUtils.cabinet();
    const corpsId = cabinet.system.corps;
    const corps = game.actors.get(corpsId);
    if (corps) {
      // Attribut ?
      if (comedien) {
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
      rollModes: CONFIG.Dice.rollModes,
      difficultes: SYSTEM.DIFFICULTES,
      aspects: SYSTEM.ASPECTS,
      qualites: SYSTEM.QUALITES,
      listeAttributs: SYSTEM.ATTRIBUTS,
      listeAcquis: data.listeAcquis,
      optionsEmbellie: optionsEmbellie,
      optionsPerisprit: optionsPerisprit,
      rollMode:rollMode,
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
    html.find('select[name="rollMode"]').change(this._onChangeAction.bind(this));
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
    const newValue = event.currentTarget.value;
  
    const actionMap = {
      "qualite-change": () => ({ qualite: newValue, qualiteValeur: this.roll.data.actorData.qualites[newValue].valeur }),
      "aspect-change": () => ({ aspect: newValue, aspectValeur: this.roll.data.actorData.aspects[newValue].valeur }),
      "acquis-change": () => newValue !== "" ? { acquis: newValue, acquisValeur: this.roll.data.listeAcquis[newValue].valeur } : { acquis: newValue, acquisValeur: 0 },
      "attribut-change": () => newValue !== "" ? { attribut: newValue, attributValeur: this.roll.data.attributs[newValue].valeur } : { attribut: newValue, attributValeur: 0 },
      "perisprit-change": () => ({ perisprit: newValue }),
      "embellie-change": () => ({ tenterEmbellie: true, embellieValeur: newValue }),
      "bonus-change": () => ({ bonus: newValue }),
      "rollMode-change": () => ({ rollMode: newValue }),
    };
  
    if (actionMap[action]) {
      this.roll.initialize(actionMap[action]());
      this.render(false, { height: "auto" });
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
