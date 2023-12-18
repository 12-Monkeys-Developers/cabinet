export const OPINIONS = Object.freeze({
  positive: {
    id: "positive",
    label: "CDM.OPINION.positive",
  },
  neutre: {
    id: "neutre",
    label: "CDM.OPINION.neutre",
  },
  negative: {
    id: "negative",
    label: "CDM.OPINION.negative",
  },
});

export const COMBAT = Object.freeze({
  initiative: {
    id: "initiative",
    label: "CDM.COMBAT.initiative",
    hasLabelComplement: false,
    aspect: "nefesh",
    attribut: "agilite",
  },
  immobiliser: {
    id: "immobiliser",
    label: "CDM.COMBAT.immobiliser",
    hasLabelComplement: false,
    aspect: "nefesh",
    attribut: "puissance",
  },
  sedefendre: {
    id: "sedefendre",
    label: "CDM.COMBAT.sedefendre",
    hasLabelComplement: false,
    aspect: "nefesh",
    attribut: "agilite",
  },
  attaque1: {
    id: "attaque1",
    label: "CDM.COMBAT.attaquer",
    hasLabelComplement: true,
    aspect: "nefesh",
    attribut: undefined,
  },
  attaque2: {
    id: "attaque2",
    label: "CDM.COMBAT.attaquer",
    hasLabelComplement: true,
    aspect: "nefesh",
    attribut: undefined,
  },
  attaque3: {
    id: "attaque3",
    label: "CDM.COMBAT.attaquer",
    hasLabelComplement: true,
    aspect: "nefesh",
    attribut: undefined,
  },
});
