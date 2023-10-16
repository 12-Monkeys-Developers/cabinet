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
      return this.items.filter(i => i.type === "acquis").map(acquis=> ({
        indice: indice++,
        nom: acquis.name,
        valeur: acquis.system.valeur
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
        //const pack = game.packs.get('world.actions');
        //if (!pack) return;
        //const index = await pack.getIndex();
        const actionsParDefaut = game.items.filter(item => item.type === "action" && item.system.parDefaut);
        let actions = [];
        for (const action of actionsParDefaut) {
          const item = await fromUuid(action.uuid);
          actions.push(item.toObject());
        }
        this.updateSource({items: actions});
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
   *
   * @return {StandardCheck}      The StandardCheck roll instance which was produced.
   */
    async rollSkill(qualiteId, {diff, rollMode, dialog=false}={}) {
 
      // Prepare check data
      const rollData = {
        actorId: this.id,
        actorData: this.system,
        qualite: qualiteId,
        listeAcquis: this.listeAcquis,
        diff: diff,
        type: 'classique',
        rollMode: rollMode,
      };
        
      // Create the check roll
      let sc = new StandardCheck(rollData);
  
      // Prompt the user with a roll dialog
      //const flavor = game.i18n.format("SKILL.RollFlavor", {name: this.name, skill: SYSTEM.SKILLS[qualiteId].name});
      const flavor = "Flavor";
      if ( dialog ){
        //const title = game.i18n.format("SKILL.RollTitle", {name: this.name, skill: SYSTEM.SKILLS[qualiteId].name});
        const title = "Title";
        const response = await sc.dialog({title, flavor, rollMode});
        if ( response === null ) return null;
      }

      // Des points de perisprit ont été dépensés
      if (sc.data.perispritValeur > 0) {
        const valeurActuelle = this.system.perisprit;
        let nouvelleValeur = valeurActuelle - sc.data.perispritValeur;
        this.update({"system.perisprit": nouvelleValeur});
      }
  
      sc = await sc.roll();
      
      // Execute the roll to chat
      await sc.toMessage({
        flavor,
        flags: {
          cabinet: {
            skill: qualiteId
          }
        }
      });
      return sc;
    }
}
