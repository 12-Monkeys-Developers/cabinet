import * as ESPRIT from "./esprit.mjs";
import * as CORPS from "./corps.mjs"
import * as PNJ from "./pnj.mjs";
import * as ARME from "./arme.mjs";

export const SYSTEM_ID = "cabinet";

/**
 * Les dix sphères
 * @enum {{label: string, qualite: string, qualiteSmall: string}}
 */
export const SPHERES = {
  binah: {
    label: "CDM.SPHERE.binah.label",
    qualite: "CDM.SPHERE.binah.qualite",
    qualiteSmall: "CDM.SPHERE.binah.qualiteSmall",
  },
  chokmah: {
    label: "CDM.SPHERE.chokmah.label",
    qualite: "CDM.SPHERE.chokmah.qualite",
    qualiteSmall: "CDM.SPHERE.chokmah.qualiteSmall",
  },
  chesed: {
    label: "CDM.SPHERE.chesed.label",
    qualite: "CDM.SPHERE.chesed.qualite",
    qualiteSmall: "CDM.SPHERE.chesed.qualiteSmall",
  },
  geburah: {
    label: "CDM.SPHERE.geburah.label",
    qualite: "CDM.SPHERE.geburah.qualite",
    qualiteSmall: "CDM.SPHERE.geburah.qualiteSmall",
  },
  hod: {
    label: "CDM.SPHERE.hod.label",
    qualite: "CDM.SPHERE.hod.qualite",
    qualiteSmall: "CDM.SPHERE.hod.qualiteSmall",
  },
  kether: {
    label: "CDM.SPHERE.kether.label",
    qualite: "CDM.SPHERE.kether.qualite",
    qualiteSmall: "CDM.SPHERE.kether.qualiteSmall",
  },
  malkuth: {
    label: "CDM.SPHERE.malkuth.label",
    qualite: "CDM.SPHERE.malkuth.qualite",
    qualiteSmall: "CDM.SPHERE.malkuth.qualiteSmall",
  },
  netzach: {
    label: "CDM.SPHERE.netzach.label",
    qualite: "CDM.SPHERE.netzach.qualite",
    qualiteSmall: "CDM.SPHERE.netzach.qualiteSmall",
  },
  tiferet: {
    label: "CDM.SPHERE.tiferet.label",
    qualite: "CDM.SPHERE.tiferet.qualite",
    qualiteSmall: "CDM.SPHERE.tiferet.qualiteSmall",
  },
  yesod: {
    label: "CDM.SPHERE.yesod.label",
    qualite: "CDM.SPHERE.yesod.qualite",
    qualiteSmall: "CDM.SPHERE.yesod.qualiteSmall",
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
