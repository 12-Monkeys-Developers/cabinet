import { ArbreVieForm } from "../forms/arbre-vie.mjs";
import { GestionForm } from "../forms/gestion.mjs";

export default function initControlButtons() {
  CONFIG.Canvas.layers.cabinet = { layerClass: ControlsLayer, group: "primary" };

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = [];

    menu.push({
      name: "arbre",
      title: "Arbre de vie",
      icon: "logo_defaut",
      button: true,
      onClick: () => {
          const cabinetId = game.settings.get("cabinet", "cabinet");
          if (foundry.utils.isEmpty(cabinetId)) {
            return ui.notifications.warn("Il faut créer un cabinet et le choisir comme actif !");
          }
          else {
            const cabinet = game.actors.get(cabinetId);
            if (cabinet) new ArbreVieForm(cabinet).render(true);
          }
      },
    });
    if (game.user.isGM) {
      menu.push({
        name: "gestion",
        title: "Gestion du Cabinet",
        icon: "logo_comportement",
        button: true,
        onClick: () => {
          const cabinetId = game.settings.get("cabinet", "cabinet");
          if (foundry.utils.isEmpty(cabinetId)) {
            return ui.notifications.warn("Il faut créer un cabinet et le choisir comme actif !");
          }
          else {
            const cabinet = game.actors.get(cabinetId);
            if (cabinet) new GestionForm(cabinet).render(true);
          }          
        },
      });
    }
    btns.push({
      name: "cabinet_menu",
      title: "Le cabinet des murmures",
      icon: "logo_comportement",
      layer: "cabinet",
      tools: menu,
    });
  });
}
