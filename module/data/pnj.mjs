export default class CabinetPnj extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.opinion = new fields.StringField({choices: SYSTEM.OPINION, initial: "neutre"});

    // Aspects : Valeur de +1 à +9, un PNJ surnaturel peut dépasser 9
    const aspectField = (label) =>
      new fields.SchemaField(
        {
          valeur: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        },
        { label }
      );

    schema.aspects = new fields.SchemaField(
      Object.values(SYSTEM.ASPECTS).reduce((obj, aspect) => {
        obj[aspect.id] = aspectField(aspect.label);
        return obj;
      }, {})
    );

    // Attributs : +1 à +3, un PNJ surnaturel peut dépasser 3
    const attributField = (label) =>
      new fields.SchemaField(
        {
          valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        },
        { label }
      );

    schema.attributs = new fields.SchemaField(
      Object.values(SYSTEM.ATTRIBUTS).reduce((obj, attribut) => {
        obj[attribut.id] = attributField(attribut.label);
        return obj;
      }, {})
    );

    // Acquis : Nom, valeur de +1 à +3, description optionnelle, milieu (oui/non)
    schema.acquis = new fields.ArrayField(
      new fields.SchemaField({
        nom: new fields.StringField({ required: true, blank: true, initial: "" }),
        valeur: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 3 }),
        description: new fields.StringField({ required: false, blank: true }),
        milieu: new fields.BooleanField({ initial: false }),
      })
    );

    schema.energie = new fields.SchemaField({
        actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
      });
        
    schema.perisprit = new fields.NumberField({ ...requiredInteger, initial: 9, min: 0, max: 9 });

    const santeField = (label, reserve, seuil) => {
      const schema = {
        reserve: new fields.NumberField({ ...requiredInteger, initial: reserve, min: reserve, max: reserve }),
        seuil: new fields.NumberField({ ...requiredInteger, initial: seuil, min: seuil, max: seuil }),
        valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: reserve }),
        protection: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
      };
      return new fields.SchemaField(schema, { label });
    };

    schema.sante = new fields.SchemaField(
      Object.values(SYSTEM.SANTE).reduce((obj, sante) => {
        obj[sante.id] = santeField(sante.label, sante.reserve, sante.seuil);
        return obj;
      }, {})
    );

    // pouvoirs : Embedded items de type pouvoir
    // corruptions : Embedded items de type corruption
    // armes : Embedded items de type arme

    // Combat : dans preparedData

    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.notes = new fields.HTMLField();

    return schema;
  }
}
