export default class CabinetArmure extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    return {
      description: new fields.HTMLField({ required: true, blank: true }),
      tete: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      brasDroit: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      brasGauche: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      torse: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      jambeDroite: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      jambeGauche: new fields.NumberField({ ...requiredInteger, initial: 0 })
    };
  }
}
