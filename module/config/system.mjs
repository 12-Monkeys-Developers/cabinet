import * as ESPRIT from "./esprit.mjs";
import * as CORPS from "./corps.mjs"
import * as PNJ from "./pnj.mjs";
import * as ARME from "./arme.mjs";

export const SYSTEM_ID = "cabinet";

/**
 * Les dix sphères
 * @enum {{label: string, qualite: string}}
 */
export const SPHERES = {
  binah: {
    label: "CDM.SPHERE.binah.label",
    qualite: "CDM.SPHERE.binah.qualite",
  },
  chokmah: {
    label: "CDM.SPHERE.chokmah.label",
    qualite: "CDM.SPHERE.chokmah.qualite",
  },
  chesed: {
    label: "CDM.SPHERE.chesed.label",
    qualite: "CDM.SPHERE.chesed.qualite",
  },
  malkuth: {
    label: "CDM.SPHERE.malkuth.label",
    qualite: "CDM.SPHERE.malkuth.qualite",
  }
};

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  id: SYSTEM_ID,
  QUALITES: ESPRIT.QUALITES,
  ASPECTS: ESPRIT.ASPECTS,
  SPHERES,
  ATTRIBUTS: CORPS.ATTRIBUTS,
  SANTE: CORPS.SANTE,
  OPINION: PNJ.OPINION,
  ARME_SOUSTYPES: ARME.SOUSTYPES,
  ARME_CATEGORIES: ARME.CATEGORIES
};
