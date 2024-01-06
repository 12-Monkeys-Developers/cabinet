import StandardCheck from "../dice/standard-check.mjs";

export default class CabinetActor extends Actor {
  constructor(data, context) {
    super(data, context);
    if (this.type === "corps") {
      // Pour détecter un changement de comédien
      Hooks.on("cabinet.majComedien", async (comedien) => {
        const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
        if (this.system.cabinet === cabinet.id) {
          this.update({ "system.comedien": comedien.id });
        }
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
    //empeche la création d'un second cabinet dans le monde
    if (this.type === "cabinet") {
      if (game.actors.filter((actor) => actor.type === "cabinet").length) {
        ui.notifications.warn("Il est interdit de créer un second Cabinet dans le monde. Supprimez d’abord le premier.");
        return false;
      }
    }
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

        // La position dans l'arbre est null (par défaut l'esprit est dans le jardin)
        // L'esprit n'est pas le comédien
        this.updateSource({ items: actions, "system.positionArbre": null, "system.comedien": false });
        break;
    }
  }

  /**
   * Jet d'action
   * @param {*} actionId 
   * @param {*} armeId 
   * @returns 
   */
  async rollAction(actionId, armeId = null) {
    const action = this.items.get(actionId);
    const actionSystem = action.system;

    // Si l'action n'est possible que pour le comédien et que l'esprit n'est pas le comédien, message d'avertissement
    if (actionSystem.controle && !this.system.comedien) return ui.notifications.warn(game.i18n.localize("CDM.WARNING.actionReserveeComedien"));

    let qualite = actionSystem.qualite;
    const keysToIgnore = ["formula", "formulaTooltip", "circonstances"];
    // On ne garde que les valeurs définies
    const defaultValues = Object.fromEntries(Object.entries(actionSystem).filter(([key, value]) => value !== undefined && !keysToIgnore.includes(key)));

    defaultValues.action = action.name;

    let corps = null;
    // Information du corps si l'esprit est le comédien
    if (this.system.comedien) {
      const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
      if (cabinet) {
        const corpsId = cabinet.system.corps;
        corps = game.actors.get(corpsId);
        const attributs = corps.system.attributs;
        defaultValues.attributs = attributs;
      }
    }

    console.log("rollAction defaultValues", defaultValues);

    // Si l'action est une arme, on récupère les valeurs de l'arme
    if (armeId) {
      const armeNom = corps.items.get(armeId).name;
      const arme = {"id": armeId, "nom": armeNom};
      return this.rollSkill(qualite, { dialog: true, defaultValues: defaultValues, arme: arme });
    }
    else return this.rollSkill(qualite, { dialog: true, defaultValues: defaultValues });
  }

  /**
   * Roll an action for a given action ID.
   * @param {string} armeId      The ID of the action to roll a check for, for example "courage"
   * @param {string} nomAction   The name of the action
   * @return {StandardCheck}      The StandardCheck roll instance which was produced.
   * 
   */
  async utiliserArme(armeId, nomAction) {
    console.log("utiliserArme", armeId, nomAction);

    // Si c'est le corps qui utilise l'arme
    if (this.type === "corps") {
      const cabinetId = this.system.cabinet;
      if (!cabinetId) return ui.notifications.warn("Il faut d'abord attribuer le corps à un cabinet.");
      const comedienId = this.system.comedien;
      if (!comedienId) return ui.notifications.warn("Il faut d'abord choisir un comédien.");
      const comedien = game.actors.get(comedienId);
      const action = comedien.items.find((item) => item.type === "action" && item.name === nomAction);
      if (!action) return ui.notifications.warn(`L'action ${nomAction} n'a pas été trouvée dans les actions du comédien.`);      
      return await comedien.rollAction(action.id, armeId);
    } 
  }

  async lancerDegats(armeId) {
    if (this.type === "corps" || this.type === "pnj") {
      const arme = this.items.get(armeId);
      if (!arme) return ui.notifications.warn("L'arme n'a pas été trouvée.");
      const degats = await arme.system.lancerDegats();
      console.log("lanceDegats", armeId, degats);
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
  async rollSkill(qualiteId, { diff, rollMode, dialog = false, defaultValues = null, arme = null } = {}) {
    // Acquis de l'acteur et acquis collectifs
    let listeAcquis = this.getlisteAcquis();
    const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
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
      arme: arme
    };

    if (defaultValues !== null) {
      rollData = await foundry.utils.mergeObject(rollData, defaultValues);
    }

    // Create the check roll
    let sc = new StandardCheck(rollData);

    // Prompt the user with a roll dialog
    const flavor = `Jet de ${rollData.activitelbl} de ${this.name}`;
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

    // Send the roll to chat
    await sc.toMessage({
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
   * Retourne tous les objets de type corruption d'un esprit
   */
  get corruptions() {
    if (this.type !== "esprit") return undefined;
    return this.items.filter((i) => i.type === "corruption");
  }

  /**
   * Déplace l'esprit dans l'arbre ou vers/depuis le jardin secret
   * Cette méthode est la méthode entrante à utiliser pour tout déplacement
   * @param {*} newPosition (sphere ou null pour jardin ou "auto" pour attribution automatique selon la qualité la plus haute)
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   * @returns
   */
  async deplacerPosition(newPosition, forcer = false) {
    if (this.type !== "esprit") return;
    const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (!cabinet) {
      return ui.notifications.warn("Créez et attribuez d'abord un cabinet.");
    }
    let oldPosition = this.system.positionArbre;
    let destPosition = "";
    let updates;

    // Déplacement vers le jardin
    if (!newPosition) {
      if (!this.system.comedien || forcer) {
        this.update({ "system.positionArbre": null, "system.comedien": false });
        cabinet.deplacerEsprit(this.id, oldPosition, null);
      } else if (this.system.estComedien) {
        return ui.notifications.warn("Le Comédien ne peut pas aller dans son jardin secret.");
      }
      // Le MJ peut forcer depuis le cabinet
      if (this.system.comedien && forcer) {
        cabinet.majComedien(null);
        Hooks.callAll("cabinet.majComedien", null);
      }
    } else if (newPosition === "auto") {
      //cas déplacement vers meilleure sphere dispo
      destPosition = await this.plusHauteQualiteLibre();
      if (!destPosition) return;
    } else {
      destPosition = newPosition;
    }
    cabinet.deplacerEsprit(this.id, oldPosition, destPosition);
    await this.update({ "system.positionArbre": destPosition });
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

    const cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
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
   * !!! Agit uniquement sur l'objet esprit, ne pas appllquer directement.
   * Pour eviter desynchro cabinet/esprits appellez uniquement cabinet.majComedien
   * @param {*} valeur    true si prise de controle, false si liberation
   * @returns
   */
  async changeControle(valeur) {
    if (this.type !== "esprit") return;
    await this.update({ "system.comedien": valeur });
  }

  /** --------*/
  /* CABINET  */
  /** --------*/

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
          sphere: esprit.system.positionArbre,
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
   * Retourne les sphères occupées par un esprit
   * @returns un Set des sphères occupées
   */
  get spheresOccupees() {
    if (this.type !== "cabinet") return;
    const result = new Set();

    for (const sphere in this.system.arbre) {
      if (this.system.arbre[sphere].idEsprit !== null && this.system.arbre[sphere].idEsprit !== undefined) {
        result.add(sphere);
      }
    }
    return result;
  }

  /**
   * Ajoute un esprit au cabinet
   * @param {CabinetActor} esprit l'actor Esprit
   * @returns
   */
  async ajouterEsprit(esprit) {
    if (this.type !== "cabinet") return;

    // L'esprit est déjà dans le cabinet
    let esprits = this.system.esprits;
    if (esprits.includes(esprit.id)) return false;

    // Mise à jour de la liste des esprits du cabinet
    esprits.push(esprit.id);
    await this.update({ "system.esprits": esprits });

    // Mise à jour de l'esprit
    await esprit.update({ "system.positionArbre": null });
    await esprit.update({ "system.comedien": false });
  }

  /**
   * Déplace un esprit dans l'arbre
   * !!! Agit uniquement sur l'objet cabinet, ne pas appeler directement.
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
   * Change le comedien
   * Pour éviter desynchro cabinet/esprits appeller uniquement cette méthode
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
    let oldComedien = game.actors.get(this.system.comedien);
    if (oldComedien) oldComedien.changeControle(false);
    if (!comedienId) await this.update({ "system.comedien": null });
    else if (newComedien) {
      newComedien.changeControle(true);
      await this.update({ "system.comedien": comedienId });
    }
    Hooks.callAll("cabinet.majComedien", newComedien);
  }

  /**
   * Retourne les sphères non accessibles pour un esprit, à cause des Qliphoth
   * @returns un Set des sphères non accessibles
   */
  getSpheresReservees(idEsprit) {
    if (this.type !== "cabinet") return;
    const result = new Set();
    for (const sphere in this.system.arbre) {
      if (this.system.arbre[sphere].idQlipha !== undefined && this.system.arbre[sphere].idQlipha !== null && this.system.arbre[sphere].idQlipha !== idEsprit) {
        result.add(sphere);
      }
    }
    return result;
  }

  /** retourne la valeur de protection du membre demmandé */
  getProtection(membre) {
    if (this.type !== "pnj" && this.type !== "corps") return;
    let armures = this.items.filter((item) => item.type == "armure");
    let protTotal = 0;
    for (const armure of armures) {
      if (armure.system.equipee) protTotal += armure.system[membre];
    }
    return protTotal;
  }
}
