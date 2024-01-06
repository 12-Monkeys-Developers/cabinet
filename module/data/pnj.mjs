export default class CabinetPnj extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.opinion = new fields.StringField({ choices: SYSTEM.OPINION, initial: "neutre" });

    // Précise si le PnJ a accès aux embellies
    schema.peutEmbellie = new fields.BooleanField({ initial: false });

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

    schema.energie = new fields.SchemaField({
      actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });

    schema.perisprit = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 9 });

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

    // pouvoirs : Embedded items de type pouvoir
    // corruptions : Embedded items de type corruption
    // armes : Embedded items de type arme

    // Combat : dans preparedData
    const combatField = (label, hasLabelComplement, aspect, attribut) =>
      new fields.SchemaField(
        {
          valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          defaut: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          label: new fields.StringField({ required: true, initial: game.i18n.localize(label), blank: false }),
          hasLabelComplement: new fields.BooleanField({ initial: hasLabelComplement }),
          labelComplement: new fields.StringField({ required: false, blank: true }),
          aspect: new fields.StringField({ required: true, blank: false, choices: SYSTEM.ASPECTS, initial: aspect }),
          attribut: new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS, initial: attribut }),
          acquis: new fields.StringField({ required: false, blank: true, initial: undefined }),
        },
        { label }
      );

    schema.combat = new fields.SchemaField(
      Object.values(SYSTEM.COMBAT).reduce((obj, combat) => {
        obj[combat.id] = combatField(combat.label, combat.hasLabelComplement, combat.aspect, combat.attribut);
        return obj;
      }, {})
    );

    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.description = new fields.HTMLField({ textSearch: true });
    schema.notes = new fields.HTMLField({ textSearch: true });

    return schema;
  }

  prepareBaseData() {
    // Malus total : pour chaque partie du corps, lorque la blessure est supérieure au seuil
    // le malus est égal à la blessure - le seuil + 1
    let malusTotal = 0;
    for (const partie of Object.values(this.sante)) {
      if (partie.valeur >= partie.seuil) {
        malusTotal += partie.valeur - partie.seuil + 1;
      }
    }
    this.malus = malusTotal;
  }
}
