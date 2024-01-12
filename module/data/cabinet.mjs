export default class CabinetCabinet extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // Acquis : Embedded items de type acquis
    // Graces : Embedded items de type grace

    schema.description = new fields.HTMLField();
    schema.contacts = new fields.HTMLField();
    schema.adversaires = new fields.HTMLField();
    schema.notes = new fields.HTMLField();

    schema.esprits = new fields.ArrayField(new fields.StringField({ nullable: true }));

    // Représentation de l'arbre de vie et des sphères : {sphere: {idEsprit: x, idQlipha: y}}
    const arbreField = (label) =>
      new fields.SchemaField({
        idEsprit: new fields.StringField({ nullable: true }),
        idQlipha: new fields.StringField({ nullable: true }),
      });
    schema.arbre = new fields.SchemaField(
      Object.values(SYSTEM.SPHERES).reduce((obj, sphere) => {
        obj[sphere.id] = arbreField(sphere.label);
        return obj;
      }, {})
    );

    // Id du Corps
    schema.corps = new fields.StringField({ nullable: true });
    // Id du Comédien
    schema.comedien = new fields.StringField({ nullable: true });

    schema.experience = new fields.SchemaField({
      actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });

    return schema;
  }

  /**
   * Retourne true si l'id du corps est défini (différent de null, undefined ou "")
   */
  get hasCorps() {
    return !!this.corps;
  }

  /**
   * Retourne true si l'id du comedien est défini (différent de null, undefined ou "")
   */
  get hasComedien() {
    return !!this.comedien;
  }
}
