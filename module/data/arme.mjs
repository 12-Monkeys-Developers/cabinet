export default class CabinetArme extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredNullableInteger = { required: true, nullable: true, integer: true, initial: null };
    const schema = {};

    schema.description = new fields.HTMLField({ required: true, blank: true, textSearch: true });
    schema.precision = new fields.NumberField({ ...requiredNullableInteger });
    schema.portee = new fields.NumberField({ ...requiredNullableInteger });
    schema.munitions = new fields.NumberField({ ...requiredNullableInteger });
    schema.degats = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.puissance = new fields.BooleanField({ initial: false });
    schema.cadence = new fields.NumberField({ ...requiredNullableInteger });

    return schema;
  }

  /**
   * Les caractéristiques de l'arme
   * @type {string}
   * @readonly
   */
  get details() {
    let details = "";
    if (this.precision < 0) {
      details += `Pré.: -${Math.abs(this.precision)} `;
    }
    if (this.precision > 0) {
      details += `Pré.: +${this.precision} `;
    }
    if (this.portee) {
      details += `Po.: ${this.portee}m `;
    }
    if (this.degats) {
      details += `Dgts.: ${this.formuleDegats} `;
    }
    if (this.munitions) {
      details += `Mun.: ${this.munitions} `;
    }
    if (this.cadence) {
      details += `Cad.: ${this.cadence} `;
    }
    return details;
  }

  /**
   * Le tooltip de l'arme
   * @type {string}
   * @readonly
   */
  get degatsToolTip() {
    let tooltip = "";
    if (this.degats) {
      tooltip += `Dgts.: ${this.degats} `;
    }
    if (this.puissance) {
      tooltip += `+ Puissance(${this.parent.actor.system.attributs.puissance.valeur})`;
    }
    return tooltip;
  }

  /**
   * La formule de dégâts de l'arme
   * @type {string}
   * @readonly
   */
  get formuleDegats() {
    let termes = this.degats.split("+");
    let formule = termes[0];

    if (termes.length == 1) {
      if (this.puissance) {
        const bonus = parseInt(this.parent.actor.system.attributs.puissance.valeur);
        formule += `+${bonus}`;
      }
    }

    if (termes.length == 2) {
      if (this.puissance) {
        const bonus = parseInt(termes[1]) + parseInt(this.parent.actor.system.attributs.puissance.valeur);
        formule += `+${bonus}`;
      } else {
        formule += `+${termes[1]}`;
      }
    }
    return formule;
  }

  /**
   * L'arme est-elle une arme de corps à corps ?
   * En fait, une arme de corps à corps est une arme qui n'a pas de portée
   * @readonly
   * @return {boolean}
   */
  get estCorpsACorps() {
    return this.portee === null;
  }

  /**
   * L'arme est-elle une arme à distance ?
   * En fait, une arme à distance est une arme qui a une portée
   * @readonly
   * @return {boolean}
   */
  get estDistance() {
    return this.portee !== null;
  }

  /**
   * Launches the damage calculation and determines the body part affected.
   * @returns {Promise<{ degats: Roll, localisation: Roll, partieCorps: string }>} The damage roll, localization roll, and affected body part.
   */
  async lancerDegats() {
    const formule = this.formuleDegats;
    const rollDegats = await new Roll(formule).roll();
    const formuleLocalisation = "2d6[red]";
    const rollLocalisation = await new Roll(formuleLocalisation).roll();

    // Mapper les résultats du dé aux parties du corps
    const mapPartieDuCorps = {
      2: "Tête",
      3: "Bras droit",
      4: "Bras droit",
      5: "Bras droit",
      6: "Bras gauche",
      7: "Bras gauche",
      8: "Bras gauche",
      9: "Torse",
      10: "Torse",
      11: "Jambe droite",
      12: "Jambe gauche",
    };

    // Obtenir la partie du corps touchée
    let partieDuCorps = mapPartieDuCorps[rollLocalisation.total];

    const localisationToolTip = `2d6 (${rollLocalisation.result})`;
    const degatsToolTip = `${rollDegats.formula} (${rollDegats.result})`;

    return { rollDegats: rollDegats, degatsToolTip: degatsToolTip, rollLocalisation: rollLocalisation, localisationToolTip: localisationToolTip, partieDuCorps: partieDuCorps };
  }
}
