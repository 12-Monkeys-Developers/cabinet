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

  get hasActor() {
    return this.parent.actor !== null;
  }

  get actor() {
    if (this.hasActor) return this.parent.actor;
    return undefined;
  }

  /**
   * Retourne la formule HTML de l'action
   */
  get formulaHtml() {
    const qualite = SYSTEM.QUALITES[this.qualite].label;
    const qualiteAlt = (this.qualiteAlt && SYSTEM.QUALITES[this.qualiteAlt]?.label) || "";

    const aspect = SYSTEM.ASPECTS[this.aspect].label;
    const aspectAlt = (this.aspectAlt && SYSTEM.ASPECTS[this.aspectAlt]?.label) || "";

    let formulaHtml =
      `<span class="resolution">
        <span class="qualite">
          <span class="qualite_first">${qualite.charAt(0).toUpperCase()}
          </span>
          ${qualite.slice(1).toUpperCase()}
        </span>` +
      (qualiteAlt !== ""
        ? ` / 
      <span class="qualite">
        <span class="qualite_first">${qualiteAlt.charAt(0).toUpperCase()}</span>${qualiteAlt.slice(1).toUpperCase()}
      </span> `
        : " ") +
      `+ 
    <span class="qualite">
      <em>
        <span class="qualite_first">${aspect.charAt(0).toUpperCase()}</span>${aspect.slice(1).toUpperCase()}
      </em>
    </span>` +
      (aspectAlt !== ""
        ? ` ou 
      <span class="qualite">
        <em>
          <span class="qualite_first">${aspectAlt.charAt(0).toUpperCase()}</span>${aspectAlt.slice(1).toUpperCase()}
        </em>
      </span> `
        : " ");

    const attribut = (this.attribut && SYSTEM.ATTRIBUTS[this.attribut]?.label) || "";
    const attributAlt = (this.attributAlt && SYSTEM.ATTRIBUTS[this.attributAlt]?.label) || "";

    let attributHtml = attribut ? `<span class="qualite"><span class="qualite_first">${attribut.charAt(0).toUpperCase()}</span>${attribut.slice(1).toUpperCase()}</span>` : "";

    let attributAltHtml = attributAlt
      ? `<span class="qualite"><span class="qualite_first">${attributAlt.charAt(0).toUpperCase()}</span>${attributAlt.slice(1).toUpperCase()}</span>`
      : "";

    formulaHtml += attribut && attributAlt ? ` ( + ${attributHtml} ou ${attributAltHtml} )` : attribut ? ` ( + ${attributHtml} )` : attributAlt ? ` ( + ${attributAltHtml} )` : "";

    if (this.opposition) {
      const aspect = SYSTEM.ASPECTS[this.oppositionAspect].label;

      formulaHtml += ` contre
  <span class="qualite">
    <em>
      <span class="qualite_first">${aspect.charAt(0).toUpperCase()}</span>${aspect.slice(1).toUpperCase()}
    </em>
  </span>`;

      const attributOp = (this.oppositionAttribut && SYSTEM.ATTRIBUTS[this.oppositionAttribut]?.label) || "";

      formulaHtml +=
        attributOp !== ""
          ? ` + (
            <span class="qualite">
              <span class="qualite_first">${attributOp.charAt(0).toUpperCase()}</span>${attributOp.slice(1).toUpperCase()}
            </span>
          ) `
          : "";
    }
    formulaHtml += "</span>";
    return formulaHtml;
  }

  /**
   * Retourne le tooltip de la formule de l'action
   * @param {CabinetEsprit} l'esprit
   * @param {*} attributs les attributs du corps
   */
  getFormulatTooltip(espritSystem, attributs) {
    let formulaTooltip = `${espritSystem.qualites[this.qualite].valeur}`;
    if (this.qualiteAlt !== undefined && this.qualiteAlt !== null && this.qualiteAlt !== "") {
      formulaTooltip += ` / ${espritSystem.qualites[this.qualiteAlt].valeur}`;
    }

    formulaTooltip += ` D6 + ${espritSystem.aspects[this.aspect].valeur}`;

    if (this.attribut !== undefined && this.attribut !== null && this.attribut !== "") {
      formulaTooltip += ` (+ ${attributs ? attributs[this.attribut].valeur : 'x'}`;
      if (this.attributAlt !== undefined && this.attributAlt !== null && this.attributAlt !== "") {
        formulaTooltip += ` OU ${attributs ? attributs[this.attributAlt].valeur : 'x'}`;
      }
      formulaTooltip += " )";
    }
  
    return formulaTooltip;
  }
  
}
