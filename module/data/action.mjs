import { SYSTEM } from "../config/system.mjs";
/**
 * @description Modèle de données d'un item de type Action
 * @property {string} categorie               La catégorie dans SYSTEM.ACTION_CATEGORIES : Communiquer, Percevoir, Agir, Savoir, Attaque au Corps-à-Corps, Attaque à distance, Se défendre, Se protéger
 * @property {string} qualite
 * @property {string} qualiteAlt
 * @property {string} aspect
 * @property {string} aspectAlt
 * @property {string} attribut
 * @property {string} attributAlt
 * @property {string} circonstances
 * @property {string} desastre              Description du désastre éventuel
 * @property {boolean} controle
 * @property {boolean} opposition
 * @property {string} oppositionAspect
 * @property {string} oppositionAttribut
 */
export default class CabinetAction extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.parDefaut = new fields.BooleanField({ initial: false });
    schema.categorie = new fields.StringField({ required: false, choices: SYSTEM.ACTION_CATEGORIES, initial: undefined });
    schema.qualite = new fields.StringField({ required: true, choices: SYSTEM.QUALITES, initial: "courage" });
    schema.qualiteAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.QUALITES, initial: undefined });
    schema.aspect = new fields.StringField({ required: true, choices: SYSTEM.ASPECTS, initial: "neshama" });
    schema.aspectAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ASPECTS, initial: undefined });
    schema.attribut = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS });
    schema.attributAlt = new fields.StringField({ required: false, blank: true, choices: SYSTEM.ATTRIBUTS });

    schema.circonstances = new fields.HTMLField({ required: true, blank: true });
    schema.desastre = new fields.HTMLField({ required: false, blank: true });

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
    const qualiteAlt = (this.qualiteAlt && SYSTEM.QUALITES[this.qualiteAlt]?.label) || "";

    const aspect = SYSTEM.ASPECTS[this.aspect].label;
    const aspectAlt = (this.aspectAlt && SYSTEM.ASPECTS[this.aspectAlt]?.label) || "";

    // this.parent peut être un item ou un actor
    const comedien = this.parent.actor?.system.comedien;
    let attribut = (this.attribut && SYSTEM.ATTRIBUTS[this.attribut]?.label) || "";
    let attributAlt = (this.attributAlt && SYSTEM.ATTRIBUTS[this.attributAlt]?.label) || "";

    let formula = "";
    formula = qualite + (qualiteAlt !== "" ? " / " + qualiteAlt + " " : " ") + " + " + aspect + (aspectAlt ? " OU " + aspectAlt + " " : " ");
    let formulaHtml =
      '<span class="resolution"><span class="qualite"><span class="qualite_first">' +
      qualite.slice(0, 1).toUpperCase() +
      "</span>" +
      qualite.slice(1).toUpperCase() +
      "</span>" +
      (qualiteAlt !== ""
        ? ' / <span class="qualite"><span class="qualite_first">' + qualiteAlt.slice(0, 1).toUpperCase() + "</span>" + qualiteAlt.slice(1).toUpperCase() + "</span> "
        : " ") +
      '+ <span class="qualite"><em><span class="qualite_first">' +
      aspect.slice(0, 1).toUpperCase() +
      "</span>" +
      aspect.slice(1).toUpperCase() +
      "</em></span>" +
      (aspectAlt !== ""
        ? ' ou <span class="qualite"><em><span class="qualite_first">' + aspectAlt.slice(0, 1).toUpperCase() + "</span>" + aspectAlt.slice(1).toUpperCase() + "</em></span> "
        : " ");

    let attributHtml = attribut
      ? '<span class="qualite"><span class="qualite_first">' + attribut.slice(0, 1).toUpperCase() + "</span>" + attribut.slice(1).toUpperCase() + "</span>"
      : "";
    let attributAltHtml = attributAlt
      ? '<span class="qualite"><span class="qualite_first">' + attributAlt.slice(0, 1).toUpperCase() + "</span>" + attributAlt.slice(1).toUpperCase() + "</span>"
      : "";

    if (attribut && attributAlt) formulaHtml += " ( + " + attributHtml + " ou " + attributAltHtml + " )";
    else if (attribut) formulaHtml += " ( + " + attributHtml + " )";
    else if (attributAlt) formulaHtml += " ( + " + attributAltHtml + " )";

    const attributFormula = attribut && attributAlt ? `(${attribut} OU ${attributAlt})` : attribut || attributAlt;
    formula += attributFormula ? ` ( + ${attributFormula})` : "";

    if (this.opposition) {
      const aspect = SYSTEM.ASPECTS[this.oppositionAspect].label;
      formula += " CONTRE " + aspect;
      formulaHtml +=
        ' contre <span class="qualite"><em><span class="qualite_first">' + aspect.slice(0, 1).toUpperCase() + "</span>" + aspect.slice(1).toUpperCase() + "</em></span>";

      const attributOp = (this.oppositionAttribut && SYSTEM.ATTRIBUTS[this.oppositionAttribut]?.label) || "";
      formula += attributOp !== "" ? "+ (" + attribut + ") " : "";
      formulaHtml +=
        attributOp !== ""
          ? ' + ( <span class="qualite"><span class="qualite_first">' + attributOp.slice(0, 1).toUpperCase() + "</span>" + attributOp.slice(1).toUpperCase() + "</span> ) "
          : "";
    }

    this.formula = formula;
    this.formulaHtml = formulaHtml + "</span>";

    let formulaTooltip = "";
    if (this.hasActor) {
      formulaTooltip = this.parent.actor.system.qualites[this.qualite].valeur + (this.qualiteAlt ? " / " + this.qualiteAlt + " " : "");
      formulaTooltip += "D6 + ";
      formulaTooltip += this.parent.actor.system.aspects[this.aspect].valeur;

      const cabinetId = game.settings.get("cabinet", "cabinet");
      const cabinet = game.actors.get(cabinetId);
      if (cabinet) {
        const corpsId = cabinet.system.corps;
        const corps = game.actors.get(corpsId);
        if (corps) {
          formulaTooltip += attribut !== "" ? " (+ " + corps.system.attributs[this.attribut].valeur : "";
          formulaTooltip += attributAlt !== "" ? " OU " + corps.system.attributs[this.attributAlt].valeur : "";
          formulaTooltip += attribut !== "" ? " )" : "";
        }
      }
    }
    this.formulaTooltip = formulaTooltip;
  }

  get hasActor() {
    return this.parent.actor !== null;
  }

  get actor() {
    if (this.hasActor) return this.parent.actor;
    return undefined;
  }
}
