export default class CabinetArme extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredNullableInteger = { required: true, nullable: true, integer: true, initial: null };
    const schema = {};

    schema.description = new fields.HTMLField({ required: true, blank: true, textSearch: true });
    schema.precision = new fields.NumberField({ ...requiredNullableInteger, min: 0, max: 3 });
    schema.portee = new fields.NumberField({ ...requiredNullableInteger });
    schema.munitions = new fields.NumberField({ ...requiredNullableInteger });
    schema.degats = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.puissance = new fields.BooleanField({ initial: false });
    schema.cadence = new fields.NumberField({ ...requiredNullableInteger });

    return schema;
  }

  /**
   * La description de l'arme
   * @type {string}
   * @readonly
   */
  get details() {
    let details = "";
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

  get estCorpsACorps() {
    return this.portee === null;
  }

  get estDistance() {
    return this.portee !== null;
  }
}
