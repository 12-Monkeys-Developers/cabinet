export default class CabinetCabinet extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.esprits = new fields.HTMLField();

    // Acquis : Nom, valeur de +1 à +3, description optionnelle, milieu (oui/non)
    schema.acquis = new fields.ArrayField(
      new fields.SchemaField({
        nom: new fields.StringField({ required: true, blank: true, initial: "" }),
        valeur: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 3 }),
        description: new fields.StringField({ required: false, blank: true }),
        milieu: new fields.BooleanField({ initial: false }),
      })
    );

    schema.description = new fields.HTMLField();
    schema.contacts = new fields.HTMLField();
    schema.adversaires = new fields.HTMLField();
    schema.notes = new fields.HTMLField();

    //TODO Embbeded item ou champ texte
    schema.graces = new fields.HTMLField();

    schema.esprits = new fields.HTMLField();
    schema.experience = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    return schema;
  }
}
