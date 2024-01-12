export { ComedienUtils, CabinetUtils };

class ComedienUtils {
  /**
   * Retourne l'esprit comédien
   * @returns {Esprit} l'esprit comédien ou null si pas de comédien
   */
  static actuel() {
    const cabinet = CabinetUtils.actuel();
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
    const cabinet = CabinetUtils.actuel();
    if (!cabinet) return;
    await cabinet.update({ "system.comedien": null });
  }

  /**
   * Définit l'esprit comédien
   * @param {Esprit} comedien ou null
   */
  static async set(comedien) {
    const cabinet = CabinetUtils.actuel();
    if (!cabinet) return;

    if (comedien) {
      // Si l'esprit est dans son jardin, le remettre d'abord dans l'arbre
      if (comedien.system.jardin) await comedien.deplacerPosition("auto", true);

      await cabinet.update({ "system.comedien": comedien.id });
      let autresEsprits = cabinet.system.esprits.filter((esprit) => esprit !== comedien.id);
      for (const espritId of autresEsprits) {
        const esprit = game.actors.get(espritId);
        await esprit.update({ "system.comedien": false });
      }
      await comedien.update({ "system.comedien": true });
      await cabinet.update({ "system.comedien": comedien.id });
    } else this.reset();
    console.log("Cabinet | Comédien défini : ", comedien);
    Hooks.callAll("cabinet.majComedien", comedien);
  }
}

class CabinetUtils {
  /**
   * Retourne le cabinet
   * @returns {Cabinet} le cabinet ou null si pas de cabinet
   */
  static actuel() {
    const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
    if (!cabinet) {
      return null;
    } else return cabinet;
  }
}
