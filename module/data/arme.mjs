export default class CabinetArme extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredNullableInteger = { required: true, nullable: true, integer: true, initial: null };
    const schema = {};

    schema.description = new fields.HTMLField({ required: true, blank: true });
    schema.precision = new fields.NumberField({ ...requiredNullableInteger, min: 1, max: 3 });
    schema.portee = new fields.NumberField({ ...requiredNullableInteger });
    schema.munitions = new fields.NumberField({ ...requiredNullableInteger });
    schema.degats = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.puissance = new fields.BooleanField({ initial: false });
    schema.cadence = new fields.NumberField({ ...requiredNullableInteger });
    schema.sousType = new fields.StringField({ required: true, choices: SYSTEM.ARME_SOUSTYPES, initial: "naturelle" });
    schema.categorie = new fields.StringField({ required: true, choices: SYSTEM.ARME_CATEGORIES, initial: "poing" });

    return schema;
  }
}
