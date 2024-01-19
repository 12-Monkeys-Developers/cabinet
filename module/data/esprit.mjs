import { CabinetUtils } from "../utils.mjs";

/**
 * Qualités, Aspects, Acquis, Profil, Périsprit, Contacts, Routine, Adversaires, Pouvoirs, Objets, Corruption et expérience
 */
export default class CabinetEsprit extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // Qualités : Nom, valeur de +1 à +5, un défaut (avec label et value)
    const qualiteField = (label, defaut, sphere) => {
      const schema = {
        valeur: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 5 }),
        label: new fields.StringField({ required: true, initial: game.i18n.localize(label), blank: false }),
        defaut: new fields.SchemaField({
          label: new fields.StringField({ required: true, initial: game.i18n.localize(defaut), blank: false }),
          valeur: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
        }),
        sphere: new fields.StringField({ required: true, initial: sphere, blank: false }),
        qlipha: new fields.BooleanField({ initial: false }),
      };
      return new fields.SchemaField(schema, { label });
    };

    schema.qualites = new fields.SchemaField(
      Object.values(SYSTEM.QUALITES).reduce((obj, qualite) => {
        obj[qualite.id] = qualiteField(qualite.label, qualite.defaut, qualite.sphere);
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

    // Acquis : Embedded items de type acquis

    // Position sur l'Arbre de Vie : la sphère ou null si l'esprit n'est pas positionné
    schema.positionArbre = new fields.StringField({ required: false, blank: true, choices: SYSTEM.SPHERES, initial: undefined });

    schema.perisprit = new fields.NumberField({ ...requiredInteger, initial: 9, min: 0, max: 9 });
    schema.routine = new fields.HTMLField({ textSearch: true });

    schema.contacts = new fields.HTMLField({ textSearch: true });
    schema.adversaires = new fields.HTMLField({ textSearch: true });

    schema.notes = new fields.HTMLField();

    // pouvoirs : Embedded items de type pouvoir
    schema.pouvoirs = new fields.SchemaField({
      niveau1: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
      niveau2: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
      niveau3: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
    });

    schema.objets = new fields.HTMLField();

    // corruptions : Embedded items de type corruption

    schema.experience = new fields.SchemaField({
      actuelle: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      totale: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });

    // schema.comedien = new fields.BooleanField({ initial: false });

    return schema;
  }

  /** @override */
  prepareBaseData() {
    for (const qualite of Object.values(this.qualites)) {
      qualite.qlipha = qualite.defaut.valeur >= qualite.valeur ? true : false;
    }
  }

  /**
   * Retourne true si l'esprit est le comédien
   */
  get comedien() {
    const cabinet = CabinetUtils.cabinet();
    if (cabinet && cabinet.system.comedien === this.parent.id) return true;
    return false;
  }

  /*
   * Retourne true si l'esprit est dans le jardin
   */
  get jardin() {
    return !this.estDansLesSpheres;
  }

  /**
   * Retourne true si l'esprit est dans une sphère
   */
  get estDansLesSpheres() {
    return Object.values(SYSTEM.SPHERES).some((sphere) => sphere.id === this.positionArbre);
  }

  /**
   * Retourne true si l'esprit est dans le cabinet
   */
  get estDansCabinet() {
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (!cabinet) {
      return false;
    } else {
      if (cabinet.system.esprits.includes(this.parent.id)) {
        return true;
      } else return false;
    }
  }

  /**
   * Retourne la couleur de fond du header de l'esprit
   */
  get backgroundColor() {
    if (this.comedien) return "var(--background_esprit_header_comedien)";
    // Pour un esprit nouvellement créé, la positionArbre n'est pas encore définie
    if (this.positionArbre === undefined || this.positionArbre === "") return "var(--background_esprit_header)";
    if (this.jardin) return "var(--background_esprit_header_jardin)";
    return "var(--background_esprit_header)";
  }

  async resetPositionArbre() {
    await this.parent.update({ 'system.positionArbre': '' });
  }
}
