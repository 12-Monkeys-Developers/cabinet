export default class CabinetArmure extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    return {
      description: new fields.HTMLField({ required: true, blank: true, textSearch: true }),
      tete: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      brasDroit: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      brasGauche: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      torse: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      jambeDroite: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      jambeGauche: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      equipee: new fields.BooleanField({ initial: true }),
    };
  }

  /**
   * Les caractéristiques de l'armure
   * @type {string}
   * @readonly
   */
  get details() {
    let details = "";
    if (this.tete) {
      details += `Tê.: ${this.tete} `;
    }
    if (this.brasDroit) {
      details += `Br. dr.: ${this.brasDroit} `;
    }
    if (this.brasGauche) {
      details += `Br. ga.: ${this.brasGauche} `;
    }
    if (this.torse) {
      details += `Tor.: ${this.torse} `;
    }
    if (this.jambeDroite) {
      details += `Ja. dr.: ${this.jambeDroite} `;
    }
    if (this.jambeGauche) {
      details += `Ja. ga.: ${this.jambeGauche} `;
    }
    return details;
  }
}
