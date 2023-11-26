import * as ESPRIT from "./esprit.mjs";
import * as CORPS from "./corps.mjs";
import * as PNJ from "./pnj.mjs";
import * as ARME from "./arme.mjs";
import * as ACTION from "./action.mjs";

export const SYSTEM_ID = "cabinet";

/**
 * Les dix sphères
 * @enum {{label: string, qualite: string, qualiteSmall: string, logo: string}}
 */
export const SPHERES = {
  binah: {
    id: "binah",
    label: "CDM.SPHERE.binah.label",
    qualite: "CDM.SPHERE.binah.qualite",
    qualiteSmall: "CDM.SPHERE.binah.qualiteSmall",
  },
  chokmah: {
    id: "chokmah",
    label: "CDM.SPHERE.chokmah.label",
    qualite: "CDM.SPHERE.chokmah.qualite",
    qualiteSmall: "CDM.SPHERE.chokmah.qualiteSmall",
  },
  chesed: {
    id: "chesed",
    label: "CDM.SPHERE.chesed.label",
    qualite: "CDM.SPHERE.chesed.qualite",
    qualiteSmall: "CDM.SPHERE.chesed.qualiteSmall",
  },
  geburah: {
    id: "geburah",
    label: "CDM.SPHERE.geburah.label",
    qualite: "CDM.SPHERE.geburah.qualite",
    qualiteSmall: "CDM.SPHERE.geburah.qualiteSmall",
  },
  hod: {
    id: "hod",
    label: "CDM.SPHERE.hod.label",
    qualite: "CDM.SPHERE.hod.qualite",
    qualiteSmall: "CDM.SPHERE.hod.qualiteSmall",
  },
  kether: {
    id: "kether",
    label: "CDM.SPHERE.kether.label",
    qualite: "CDM.SPHERE.kether.qualite",
    qualiteSmall: "CDM.SPHERE.kether.qualiteSmall",
  },
  malkuth: {
    id: "malkuth",
    label: "CDM.SPHERE.malkuth.label",
    qualite: "CDM.SPHERE.malkuth.qualite",
    qualiteSmall: "CDM.SPHERE.malkuth.qualiteSmall",
  },
  netzach: {
    id: "netzach",
    label: "CDM.SPHERE.netzach.label",
    qualite: "CDM.SPHERE.netzach.qualite",
    qualiteSmall: "CDM.SPHERE.netzach.qualiteSmall",
  },
  tiferet: {
    id: "tiferet",
    label: "CDM.SPHERE.tiferet.label",
    qualite: "CDM.SPHERE.tiferet.qualite",
    qualiteSmall: "CDM.SPHERE.tiferet.qualiteSmall",
  },
  yesod: {
    id: "yesod",
    label: "CDM.SPHERE.yesod.label",
    qualite: "CDM.SPHERE.yesod.qualite",
    qualiteSmall: "CDM.SPHERE.yesod.qualiteSmall",
  },
};

/**
 * Les difficultés
 * @enum {{id: string, label: string, qualite: string, seuil: number}}
 */
export const DIFFICULTES = {
  aisee: {
    id: "aisee",
    label: "CDM.DIFFICULTE.aisee",  
    seuil: 3  
  },
  moyenne: {
    id: "moyenne",
    label: "CDM.DIFFICULTE.moyenne",  
    seuil: 6
  },
  ardue: {
    id: "ardue",
    label: "CDM.DIFFICULTE.ardue",  
    seuil: 10
  },
  extreme: {
    id: "extreme",
    label: "CDM.DIFFICULTE.extreme",  
    seuil: 15 
  },
  echec: {
    id: "impossible",
    label: "CDM.DIFFICULTE.impossible",  
    seuil: 21 
  },
}
export const IMAGES= {
  ICONE_JARDIN: "icons/environment/wilderness/tomb-entrance.webp",
  ICONE_CABINET: "icons/environment/settlement/wagon-black.webp",
  ICONE_COMEDIEN: "icons/magic/control/control-influence-puppet.webp",
  ICONE_CORPS: "icons/magic/control/control-influence-puppet.webp",
  binah_logo: "",
  chokmah_logo: "",
  chesed_logo: "",
  geburah_logo: "",
  hod_logo: "",
  kether_logo: "",
  malkuth_logo: "",
  netzach_logo: "",
  tiferet_logo: "",
  yesod_logo: "",
  ornement_feuille:"systems/cabinet/assets/images/sheets/ornement_dore_feuille.webp",
  trait_separation: "systems/cabinet/assets/images/sheets/trait_separation.webp"
}

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
  ARME_CATEGORIES: ARME.CATEGORIES,
  ACTION_CATEGORIES: ACTION.ACTION_CATEGORIES,
  DIFFICULTES,
  IMAGES
};

