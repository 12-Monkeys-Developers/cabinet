export { ComedienUtils, CabinetUtils, SocketUtils };

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
        ui.notifications.info(game.i18n.localize("CDM.WARNING.comedienInexistant"));
        this.reset();
        return null;
      }
      // Vérifier que l'acteur est un esprit
      if (comedien.type !== "esprit") {
        ui.notifications.info(game.i18n.localize("CDM.WARNING.comedienPasEsprit"));
        this.reset();
        return null;
      }
      // Vérifier que l'esprit est dans le cabinet
      const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
      if (cabinet) {
        if (!cabinet.system.esprits.includes(comedienId)) {
          ui.notifications.info(game.i18n.localize("CDM.WARNING.comedienPasDansCabinet"));
          this.reset();
          return null;
        }
      }
      // Vérifier que l'esprit n'est pas dans le jardin
      if (comedien.jardin) {
        ui.notifications.info(game.i18n.localize("CDM.WARNING.comedienJardin"));
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
        const message = game.messages.get(messageId);
        message.update({ content: newContent });
      }
    }
  }
}
