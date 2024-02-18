export { ComedienUtils, CabinetUtils, SocketUtils, PnjUtils};

class ComedienUtils {
  /**
   * Retourne l'esprit comédien
   * @returns {Esprit} l'esprit comédien ou null si pas de comédien
   */
  static actuel() {
    const cabinet = CabinetUtils.cabinet();
    if (!cabinet) return null;

    const comedienId = cabinet.system.comedien;

    if (comedienId) {
      // Vérifier que l'acteur existe
      const comedien = game.actors.get(comedienId);
      if (!comedien) {
        ui.notifications.info("CABINET DES MURMURES | " + game.i18n.localize("CDM.WARNING.comedienInexistant"));
        this.reset();
        return null;
      }
      // Vérifier que l'acteur est un esprit
      if (comedien.type !== "esprit") {
        ui.notifications.info("CABINET DES MURMURES | " + game.i18n.localize("CDM.WARNING.comedienPasEsprit"));
        this.reset();
        return null;
      }
      // Vérifier que l'esprit est dans le cabinet
      const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
      if (cabinet) {
        if (!cabinet.system.esprits.includes(comedienId)) {
          ui.notifications.info("CABINET DES MURMURES | " + game.i18n.localize("CDM.WARNING.comedienPasDansCabinet"));
          this.reset();
          return null;
        }
      }
      // Vérifier que l'esprit n'est pas dans le jardin
      if (comedien.jardin) {
        ui.notifications.info("CABINET DES MURMURES | " + game.i18n.localize("CDM.WARNING.comedienJardin"));
        this.reset();
        return null;
      }

      return comedien;
    }

    return null;
  }

  /**
   * Supprime l'esprit comédien
   */
  static async reset() {
    const cabinet = CabinetUtils.cabinet();
    if (!cabinet) return;
    await cabinet.majComedien(null);
  }

  /**
   * Définit l'esprit comédien
   * @param {Esprit} comedien ou null
   */
  static async set(comedien) {
    const cabinet = CabinetUtils.cabinet();
    if (!cabinet) return;
    if (comedien) await cabinet.majComedien(comedien.id);
    else await cabinet.majComedien(null);
  }
}

class CabinetUtils {
  /**
   * Retourne le cabinet
   * @returns {Cabinet} le cabinet ou null si pas de cabinet
   */
  static cabinet() {
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (!cabinet) {
      return null;
    } else return cabinet;
  }
}

class SocketUtils {
  static performSocketMesssage(socketMsg) {
    console.log("SocketUtils | performSocketMesssage", socketMsg);

    if (socketMsg.msg === "updateChatMessage") {
      if (game.user.isGM) {
        console.log("SocketUtils | updateChatMessage by GM", socketMsg);
        const messageId = socketMsg.data.messageId;
        const newContent = socketMsg.data.content;
        const newFlags = socketMsg.data.flags;
        const message = game.messages.get(messageId);
        message.update({ content: newContent, flags: newFlags });
      }
    }
  }
}

class PnjUtils {
  static detailsEmbellie(roll) {
    console.log("PnjUtiles | detailsEmbellie", roll);
    let des = roll.terms[0].results.map((r) => r.result);
    const desUn = des.filter((d) => d === 1);
    const desSix = des.filter((d) => d === 6);
    const autreDes = des.filter((d) => d !== 1 && d !== 6);

    const nbDeUn = desUn.length;
    const nbDeSix = desSix.length;
    const nbAutresDes = autreDes.length;

    let total = 0;
    let details = "";
    let explosiveRoll = null;
    // Ni de 1 ni de 6, on garde le meilleur résultat
    if (nbDeUn === 0 && nbDeSix === 0) {
      total = Math.max(...autreDes);
    }
    // Un 1 et un 6, total = 0
    else if (nbDeUn === 1 && nbDeSix === 1) {
      total = 0;
    }
    // Un 6 et un autre résultat, on additionne les deux résultats
    else if (nbDeUn === 0 && nbDeSix === 1) {
      total = Math.min(...autreDes) + 6;
    }
    // Un 1 et un autre résultat, au choix désastre ou juste l'autre résultat
    else if (nbDeUn === 1 && nbDeSix === 0) {
      total = Math.max(...autreDes);
      details = "Déclencher un déasastre pour le PNJ ou utiliser le résultat";
    }
    // Deux 1 : l'action est remportée par l'esprit. 
    else if (nbDeUn === 2 && nbDeSix === 0) {
      total = 0;
      details = "L'esprit remporte l'action. Vous pouvez ajouter un effet désastreux pour le PNJ.";
    }
    // Deux 6 : additionner les deux, relancer un 1d6 explosif
    else if (nbDeUn === 0 && nbDeSix === 2) {
      total = 12;
      const newRoll = new Roll("1d6x").roll();
      explosiveRoll = newRoll;
      total += newRoll.total;

      const desExplosifs = newRoll.terms[0].results.map((r) => r.result);
      des.concat(desExplosifs);
    }

    let tooltip = " Dés : " + des.join(" ");
    
    return { total: total, details: details, explosiveRoll: explosiveRoll, tooltip: tooltip};
  }
}

