import StandardCheck from "../dice/standard-check.mjs";

export default class CabinetActor extends Actor {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    if (this.type === "cabinet") {
      Hooks.on("cabinet.changementComedien", async (id) => {
        await this.update({ "system.comedien": id });
      });
    }
  }

  /** @override */
  _onUpdate(data, options, userId) {
    if (this.type === "corps") {
      Hooks.callAll("cabinet.updateCorps", this.id);
    }
    super._onUpdate(data, options, userId);
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  /**
   * @description Tableau des aquis d'un esprit sous la forme [{nom, valeur}}] ou des acquis collectifs du cabinet
   * @param indiceDepart : Indice de départ pour la numérotation
   */
  getlisteAcquis(indiceDepart = 0) {
    if (this.type === "esprit" || this.type === "cabinet") {
      let indice = indiceDepart;
      return this.items
        .filter((i) => i.type === "acquis")
        .map((acquis) => ({
          indice: indice++,
          nom: acquis.name,
          valeur: acquis.system.valeur,
        }));
    }
    return undefined;
  }

  /** @inheritdoc */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    switch (data.type) {
      case "esprit":
        // Création de la liste des actions par défaut
        // Les actions qui ont l'attribut parDefaut a true sont ajoutées à l'esprit
        const actionsParDefaut = game.items.filter((item) => item.type === "action" && item.system.parDefaut);
        let actions = [];
        for (const action of actionsParDefaut) {
          const item = await fromUuid(action.uuid);
          actions.push(item.toObject());
        }
        this.updateSource({ items: actions });
        break;
    }
  }

  /**
   * Roll a skill check for a given skill ID.
   *
   * @param {string} qualiteId      The ID of the skill to roll a check for, for example "courage"
   * @param {number} [diff]         A known difficulty
   * @param {string} [rollMode]   The roll visibility mode to use, default is the current dropdown choice
   * @param {boolean} [dialog]    Display a dialog window to further configure the roll. Default is false.
   * @param {Object} [defaultValues]    Contient les valeurs par défaut, utilisées lors que c'est un item Action qui est à l'origine du jet
   * action : nom de l'action, aspect, aspectAlt, attribut, attributAlt, categorie, controle, formulaHtml, opposition, parDefaut, qualite, qualiteAlt
   * @return {StandardCheck}      The StandardCheck roll instance which was produced.
   */
  async rollSkill(qualiteId, { diff, rollMode, dialog = false, defaultValues = null } = {}) {
    // Acquis de l'acteur et acquis collectifs
    let listeAcquis = this.getlisteAcquis();
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    if (cabinet) {
      const listeAcquisCollectifs = cabinet.getlisteAcquis(listeAcquis.length);
      listeAcquis = listeAcquis.concat(listeAcquisCollectifs);
    }

    // Prepare check data
    let rollData = {
      actorId: this.id,
      actorData: this.system,
      qualite: qualiteId,
      listeAcquis: listeAcquis,
      diff: diff,
      type: "classique",
      rollMode: rollMode,
    };

    if (defaultValues !== null) {
      rollData = foundry.utils.mergeObject(rollData, defaultValues);
    }

    // Create the check roll
    let sc = new StandardCheck(rollData);

    // Prompt the user with a roll dialog
    const flavor = defaultValues === null ? `Jet de ${SYSTEM.QUALITES[qualiteId].label} de ${this.name}` : `Jet de ${defaultValues.action} de ${this.name}`;
    if (dialog) {
      const jet = defaultValues === null ? SYSTEM.QUALITES[qualiteId].label : defaultValues.action;
      const title = game.i18n.format("CDM.DIALOG.titreJet", { nom: this.name, jet: jet });
      const response = await sc.dialog({ title, flavor, rollMode });
      if (response === null) return null;
    }

    // Des points de perisprit ont été dépensés
    if (sc.data.perispritValeur > 0) {
      const valeurActuelle = this.system.perisprit;
      let nouvelleValeur = valeurActuelle - sc.data.perispritValeur;
      this.update({ "system.perisprit": nouvelleValeur });
    }

    sc = await sc.roll();

    // Execute the roll to chat
    await sc.toMessage({
      flavor,
      flags: {
        cabinet: {
          skill: qualiteId,
        },
      },
    });
    return sc;
  }

  /** -------*/
  /* ESPRIT  */
  /** -------*/

  /**
   * déplace l'esprit dans l'arbre ou vers/depuis le jardin secret
   * Cette méthode est la méthode entrante à utiliser pour tout déplacement
   * @param {*} newPosition (sphere ou null pour jardin ou "auto" pour attribution automatique selon la qualité la plus haute)
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   * @returns
   */
  async deplacerPosition(newPosition, forcer = false) {
    if (this.type !== "esprit") return;
    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    if (!cabinet) {
      return ui.notifications.warn("Créez et attribuez d'abord un cabinet.");
    }
    let oldPosition = this.system.positionArbre;
    let destPosition = "";
    let updates;

    //cas déplacement vers jardin
    if (!newPosition) {
      if (!this.system.comedien || forcer) {
        this.update({ "system.positionArbre": "", "system.jardin": true, "system.comedien": false });
        cabinet.deplacerEsprit(this.id, oldPosition, null);
      } else if (this.system.estComedien) {
        return ui.notifications.warn("Le Comédien ne peut pas aller dans son jardin secret.");
      }
      if (this.system.comedien && forcer) cabinet.majComedien(null);
    } else if (newPosition === "auto") {
      //cas déplacement vers meilleure sphere dispo
      destPosition = await this.plusHauteQualiteLibre();
      if (!destPosition) return;
    } else {
      destPosition = newPosition;
    }
    cabinet.deplacerEsprit(this.id, oldPosition, destPosition);
    await this.update({ "system.positionArbre": destPosition, "system.jardin": false });
  }

  /**
   * renvoie la première sphère libre dont la qualité est la plus élevée pour l'esprit
   * @returns
   */
  async plusHauteQualiteLibre() {
    if (this.type !== "esprit") return;
    let qualites = [];
    for (const [key, value] of Object.entries(this.system.qualites)) {
      {
        qualites.push({ nom: key, valeur: this.system.qualites[key].valeur, sphere: this.system.qualites[key].sphere });
      }
    }
    qualites.sort((a, b) => b.valeur - a.valeur);

    const cabinetId = game.settings.get("cabinet", "cabinet");
    const cabinet = game.actors.get(cabinetId);
    let arbre;
    if (cabinet) {
      arbre = cabinet.system.arbre;
    }
    if (!arbre) return;
    for (let qualite of qualites) {
      if (!arbre[qualite.sphere].idEsprit) {
        const position = SYSTEM.QUALITES[qualite.nom].sphere;
        return position;
      }
    }
  }

  /**
   * change le controle pour cet esprit
   * !!! Agit uniquement sur l'objet esprit, ne pas appller directement.
   * Pour eviter desynchro cabinet/esprits appellez uniquement cabinet.majComedien
   * @param {*} valeur    true si prise de controle, false si liberation
   * @returns
   */
  async changeControle(valeur) {
    if (this.type !== "esprit") return;
    await this.update({ "system.comedien": valeur });
  }

  /**  A SUPPRIMER -> deplacerPosition
   * Modifie la valeur du jardin
   * @param {*} valeur    true si l'esprit va dans le jardin, false si l'esprit le quitte
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   */
  async modifierJardin(valeur, forcer) {
    if (this.type !== "esprit") return;
    if (valeur && !this.system.jardin) this.deplacerPosition(null, forcer);
    if (!valeur && this.system.jardin) return this.deplacerPosition("auto", forcer);
  }

  /** --------*/
  /* CABINET  */
  /** --------*/

  /**
   *
   * @param {CabinetActor} esprit  l'item Esprit
   * @returns
   */
  async ajouterEsprit(esprit) {
    if (this.type !== "cabinet") return;

    // Mise à jour du cabinet
    let esprits = this.system.esprits;
    if (esprits.includes(esprit.id)) return false;
    esprits.push(esprit.id);
    await this.update({ "system.esprits": esprits });

    // Mise à jour de l'esprit
    await actor.update({ "system.jardin": true });
    await actor.update({ "system.comedien": false });

    // FIXME si on veut utiliser await esprit.deplacerPosition(null); au lieu des 2 lignes au-dessus
    // ca ne marche pas s'il n'y pas de cabinet de référence
  }

  /**
   * Liste des esprits d'un cabinet
   * id, nom, img, token, estComedien, dansJardin
   */
  get listeEsprits() {
    if (this.type !== "cabinet") return undefined;
    const listeEsprits = this.system.esprits;
    let liste = [];
    if (listeEsprits.length > 0) {
      liste = listeEsprits.map((id) => {
        const esprit = game.actors.get(id);
        return {
          id: id,
          nom: esprit.name,
          img: esprit.img,
          token: esprit.prototypeToken.texture.src,
          estComedien: esprit.system.comedien,
          dansJardin: esprit.system.jardin,
        };
      });
    }
    return liste;
  }

  /**
   * Accès au corps d'un cabinet
   */
  get corps() {
    if (this.type !== "cabinet") return undefined;
    const corpsId = this.system.corps;
    const corps = game.actors.get(corpsId);
    if (corps) return corps;
  }

  /**
   * Deplace un esprit dans l'arbre
   * !!! Agit uniquement sur l'objet cabinet, ne pas appller directement.
   * Pour eviter desynchro cabinet/esprits appellez uniquement esprit.deplacerPosition
   * @param {string}} espritId
   * @param {*} oldPosition  Ancienne position (ou null si jardin)
   * @param {*} oldPosition  nouvelle position (ou null si jardin)
   * @returns
   */
  async deplacerEsprit(espritId, oldPosition, newPosition) {
    if (this.type !== "cabinet") return;
    if (newPosition) await this.update({ [`system.arbre.${newPosition}.idEsprit`]: espritId });
    if (oldPosition) await this.update({ [`system.arbre.${oldPosition}.idEsprit`]: null });
  }

  /**
   * change le comedien
   * Pour eviter desynchro cabinet/esprits appellez uniquement cette methode
   * @param {*} comedienId    l'Id du nouveau comedien, ou null si aucun comedien
   * @returns
   */
  async majComedien(comedienId) {
    if (this.type !== "cabinet") return;
    const newComedien = game.actors.get(comedienId);
    // si l'esprit est dans son jardin, le remettre d'abord dans l'arbre
    if (comedienId) {
      if (!newComedien) return;
      if (newComedien.system.jardin) await newComedien.deplacerPosition("auto", true);
    }
    let oldComedien = await game.actors.get(this.system.comedien);
    if (oldComedien) oldComedien.changeControle(false);
    if (!comedienId) this.update({ "system.comedien": null });
    else if (newComedien) {
      newComedien.changeControle(true);
      this.update({ "system.comedien": comedienId });
    }
  }
}
