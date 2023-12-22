export default class CabinetCorps extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.comedien = new fields.StringField({nullable: true});
    schema.cabinet = new fields.StringField({nullable: true});
    schema.description = new fields.HTMLField({textSearch: true});

    const attributField = (label) =>
      new fields.SchemaField(
        {
          valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
        },
        { label }
      );

    schema.attributs = new fields.SchemaField(
      Object.values(SYSTEM.ATTRIBUTS).reduce((obj, attribut) => {
        obj[attribut.id] = attributField(attribut.label);
        return obj;
      }, {})
    );

    schema.equipement = new fields.HTMLField();
    schema.sequelles = new fields.HTMLField();

    // armes : Embedded items de type arme

    schema.notes = new fields.HTMLField();

    const santeField = (label, reserve, seuil) => {
      const schema = {
        reserve: new fields.NumberField({ ...requiredInteger, initial: reserve, min: reserve, max: reserve }),
        seuil: new fields.NumberField({ ...requiredInteger, initial: seuil, min: seuil, max: seuil }),
        valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: reserve }),
      };
      return new fields.SchemaField(schema, { label });
    };

    schema.sante = new fields.SchemaField(
      Object.values(SYSTEM.SANTE).reduce((obj, sante) => {
        obj[sante.id] = santeField(sante.label, sante.reserve, sante.seuil);
        return obj;
      }, {})
    );

    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    return schema;
  }
}
