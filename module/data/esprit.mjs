/**
 * Qualités, Aspects, Acquis, Profil, Périsprit, Contacts, Routine, Adversaires, Pouvoirs, Objets, Corruption et expérience
 */
export default class CabinetEsprit extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // Qualités : Nom, valeur de +1 à +5, un défaut (avec label et value)
    const qualiteField = (label, defaut) => {
      const schema = {
        valeur: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 5 }),
        label: new fields.StringField({ required: true, initial: game.i18n.localize(label), blank: false }),
        defaut: new fields.SchemaField({
          label: new fields.StringField({ required: true, initial: game.i18n.localize(defaut), blank: false }),
          valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
        }),
      };
      return new fields.SchemaField(schema, { label });
    };

    schema.qualites = new fields.SchemaField(
      Object.values(SYSTEM.QUALITES).reduce((obj, qualite) => {
        obj[qualite.id] = qualiteField(qualite.label, qualite.defaut);
        return obj;
      }, {})
    );

    // Profil et Concept
    schema.profil = new fields.SchemaField({
      public: new fields.HTMLField(),
      private: new fields.HTMLField(),
    });

    // Aspects : Nom hébreux, nom français, valeur de +1 à +3
    const aspectField = (label) =>
      new fields.SchemaField(
        {
          valeur: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 3 }),
        },
        { label }
      );

    schema.aspects = new fields.SchemaField(
      Object.values(SYSTEM.ASPECTS).reduce((obj, aspect) => {
        obj[aspect.id] = aspectField(aspect.label);
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

    schema.perisprit = new fields.NumberField({ ...requiredInteger, initial: 9, min: 0, max: 9 });
    schema.routine = new fields.HTMLField();

    schema.contacts = new fields.HTMLField();
    schema.adversaires = new fields.HTMLField();

    // pouvoirs : Embedded items de type pouvoir

    schema.objets = new fields.HTMLField();

    // corruptions : Embedded items de type corruption

    schema.experience = new fields.SchemaField({
      actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });

    return schema;
  }
}
