import { SYSTEM } from "../config/system.mjs";
export default class CabinetAction extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.qualite = new fields.StringField({ required: true, choices: SYSTEM.QUALITES, initial: "courage"});
    schema.aspect = new fields.StringField({ required: true, choices: SYSTEM.ASPECTS, initial: "neshama" });
    schema.attribut = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS});

    schema.circonstances = new fields.HTMLField({ required: true, blank: true });
    schema.controle = new fields.BooleanField({ initial: true });

    schema.opposition = new fields.BooleanField({ initial: false });
    schema.oppositionAspect = new fields.StringField({ required: false, choices: SYSTEM.ASPECTS, initial: undefined });
    schema.oppositionAttribut = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS, initial: undefined });

    return schema;
  }

  labels;

  prepareBaseData() {
    const qualite = SYSTEM.QUALITES[this.qualite].label;
    const aspect = SYSTEM.ASPECTS[this.aspect].label;
    const attribut = this.attribut !== "" ? SYSTEM.ATTRIBUTS[this.attribut].label : "";

    let base = "";
    if (this.hasActor) {
      base = base.concat(this.parent.actor.system.qualites[this.qualite].valeur, "D6 + ", this.parent.actor.system.aspects[this.aspect].valeur);
    }

    this.labels = {qualite, aspect, attribut, base};
  }

  get hasAttribut(){
    return this.attribut !== "";
  }

  get hasActor(){
    return this.parent.actor !== null;
  }

  get actor(){
    if (this.hasActor) return this.parent.actor;
    return undefined;
  }
}
