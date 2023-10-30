import { ArbreVieForm } from "../forms/arbre-vie.mjs";

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
        if (!cabinetId) {
          return ui.notifications.warn("L'arbre de vie nécessite un cabinet actif !");
        } else {
          const cabinet = game.actors.get(cabinetId);
          if (cabinet) new ArbreVieForm(cabinet).render(true);
        }
      },
    });
    btns.push({
      name: "cabinet_menu",
      title: "Le cabinet des murmures",
      icon: "logo_comportement",
      layer: "cabinet",
      tools: menu,
    });
  });
}
