import { SYSTEM } from "../config/system.mjs";
export default class CabinetAction extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.categorie = new fields.StringField({ required: false, choices: SYSTEM.ACTION_CATEGORIES, initial: undefined });
    schema.qualite = new fields.StringField({ required: true, choices: SYSTEM.QUALITES, initial: "courage"});
    schema.qualiteAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.QUALITES, initial: undefined});
    schema.aspect = new fields.StringField({ required: true, choices: SYSTEM.ASPECTS, initial: "nefesh" });
    schema.aspectAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ASPECTS, initial: undefined });
    schema.attribut = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS});
    schema.attributAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS});

    schema.circonstances = new fields.HTMLField({ required: true, blank: true });
    schema.controle = new fields.BooleanField({ initial: true });

    schema.opposition = new fields.BooleanField({ initial: false });
    schema.oppositionAspect = new fields.StringField({ required: false, choices: SYSTEM.ASPECTS, initial: undefined });
    schema.oppositionAttribut = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS, initial: undefined });

    return schema;
  }

  labels;

  prepareBaseData() {
    // Action
    // Qualité (/ Qualité alternative) + Aspect OU Aspect alternatif (+ Attribut du corps OU Attribut alternatif) contre Aspect (+ Attribut)
    const qualite = SYSTEM.QUALITES[this.qualite].label;
    const qualiteAlt = this.qualiteAlt && SYSTEM.QUALITES[this.qualiteAlt]?.label || "";

    const aspect = SYSTEM.ASPECTS[this.aspect].label;
    const aspectAlt = this.aspectAlt && SYSTEM.ASPECTS[this.aspectAlt]?.label || "";

    const comedien = this.parent.actor.system.comedien;
    let attribut = this.attribut && SYSTEM.ATTRIBUTS[this.attribut]?.label || "";
    let attributAlt = this.attributAlt && SYSTEM.ATTRIBUTS[this.attributAlt]?.label || "";
        
    let formula = "";
    formula = qualite + (qualiteAlt !== "" ? " / " + qualiteAlt + " ": " ") + " + " + aspect + (aspectAlt ? " OU " + aspectAlt + " ": " ");
    const attributFormula = attribut && attributAlt ? `(${attribut} OU ${attributAlt})` : attribut || attributAlt;
    formula += attributFormula ? ` ( + ${attributFormula})` : "";

    if (this.opposition) {
      const aspect = SYSTEM.ASPECTS[this.oppositionAspect].label;
      formula += " CONTRE " + aspect;
      const attribut = this.oppositionAttribut && SYSTEM.ATTRIBUTS[this.oppositionAttribut]?.label || "";
      formula += attribut !== "" ? "+ (" + attribut + (attributAlt ? " OU " + attributAlt + " ": "") + ") " : "";
    }

    this.formula = formula;

    let formulaTooltip = "";
    if (this.hasActor) {
      formulaTooltip = this.parent.actor.system.qualites[this.qualite].valeur + (this.qualiteAlt ? " / " + this.qualiteAlt + " ": "");
      formulaTooltip += "D6 + ";
      formulaTooltip += this.parent.actor.system.aspects[this.aspect].valeur;
      if (comedien) {
        formulaTooltip += attribut !== "" ? " (" + this.parent.actor.system.attributs[this.attribut].valeur + (this.attributAlt ? " OU " + this.attributAlt + " ": "") + ") " : "";
      }
    }
    this.formulaTooltip = formulaTooltip;
  }

  get hasActor(){
    return this.parent.actor !== null;
  }

  get actor(){
    if (this.hasActor) return this.parent.actor;
    return undefined;
  }
}
