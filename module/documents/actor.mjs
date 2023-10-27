import StandardCheck from "../dice/standard-check.mjs";

export default class CabinetActor extends Actor {
  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  /**
   * @description Tableau des aquis d'un esprit sous la forme [{nom, valeur}}]
   */
  get listeAcquis() {
    if (this.type === "esprit") {
      let indice = 0;
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
   * @return {StandardCheck}      The StandardCheck roll instance which was produced.
   */
  async rollSkill(qualiteId, { diff, rollMode, dialog = false, defaultValues = null } = {}) {
    // Prepare check data
    let rollData = {
      actorId: this.id,
      actorData: this.system,
      qualite: qualiteId,
      listeAcquis: this.listeAcquis,
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
    //const flavor = game.i18n.format("SKILL.RollFlavor", {name: this.name, skill: SYSTEM.SKILLS[qualiteId].name});
    const flavor = "Flavor";
    if (dialog) {
      //const title = game.i18n.format("SKILL.RollTitle", {name: this.name, skill: SYSTEM.SKILLS[qualiteId].name});
      const title = "Title";
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
   * Modifie la valeur du jardin
   * @param {*} valeur    true si l'esprit va dans le jardin, false si l'esprit le quitte
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   */
  async modifierJardin(valeur, forcer) {
    if (this.type !== "esprit") return;
    if (valeur && !this.system.jardin) this.allerJardin(forcer);
    if (!valeur && this.system.jardin) this.quitterJardin(forcer);
  }

  /**
   * Envoie un esprit du cabinet vers son jardin
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   * @returns
   */
  async allerJardin(forcer) {
    let updates = { "system.positionArbre": "", "system.jardin": true };

    if (this.system.estComedien) {
      if (!forcer) return ui.notifications.warn("Le Comédien ne peut pas aller dans son jardin secret.");
      else foundry.utils.mergeObject(updates, {"system.comedien": false});
    }
    await this.update(updates);
  }

  /**
   * Envoie un esprit du jardin vers le cabinet
   * Il va dans la première sphère libre dont la qualité est la plus élevée pour l'esprit
   * @param {*} forcer    true si c'est le MJ qui force le déplacement
   * @returns
   */
  async quitterJardin(forcer) {
    // Pouvoir par ordre niveau et mise en forme de la description
    let qualites = [];
    for (const [key, value] of Object.entries(this.system.qualites)) {
      {
        qualites.push({ nom: key, valeur: this.system.qualites[key].valeur });
      }
      qualites.sort(function (a, b) {
        return a.valeur < b.valeur;
      });
    }
    // FIX ME
    /*
    const contenuArbre = await remplirArbre();
    for (let qualite of qualites) {
      if (!contenuArbre[SYSTEM.QUALITES[qualite.nom].sphere].id) {
        await this.update({ "system.positionArbre": SYSTEM.QUALITES[qualite.nom].sphere, "system.jardin": false });
        return;
      }
    }*/
    await this.update({ "system.jardin": true });
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
   * Remet à 0 une sphère de l'arbre
   * @param {*} positionArbre 
   * @returns 
   */
  deplacerEspritVersJardin(positionArbre) {
    if (this.type !== "cabinet") return;
    this.update({[`system.arbre.${positionArbre}.idEsprit`]: null})
  }
}
