import CabinetEsprit from "./esprit.mjs";

export default class CabinetCabinet extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // Acquis : Embedded items de type acquis

    schema.description = new fields.HTMLField();
    schema.contacts = new fields.HTMLField();
    schema.adversaires = new fields.HTMLField();
    schema.notes = new fields.HTMLField();

    // TODO Graces : Embedded items de type grace : crééer l'objet avec Nom et Description
    schema.graces = new fields.HTMLField();

    schema.esprits = new fields.ArrayField(new fields.StringField({nullable: true}));

    const arbreField = label => new fields.SchemaField({
      idEsprit: new fields.StringField({nullable: true}),
      idQlipha: new fields.StringField({nullable: true})
    })
    // {sphere: {idEsprit: x, idQlipha: y}}
    schema.arbre = new fields.SchemaField(Object.values(SYSTEM.SPHERES).reduce((obj, sphere) => {
      obj[sphere.id] = arbreField(sphere.label);
      return obj;
    }, {}));

    schema.corps = new fields.StringField({nullable: true});
    schema.comedien = new fields.StringField({nullable: true});
    schema.experience = new fields.SchemaField({
      actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });

    return schema;
  }

}
