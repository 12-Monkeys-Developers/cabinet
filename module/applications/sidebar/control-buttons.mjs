import { ArbreVieForm } from "../forms/arbre-vie.mjs";
import { PresentationForm } from "../forms/presentation.mjs";
import { SearchDialog } from "../search/search.mjs";

export default function initControlButtons() {
  CONFIG.Canvas.layers.cabinet = { layerClass: ControlsLayer, group: "primary" };

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = [];

    menu.push(
      {
        name: "arbre",
        title: "Arbre de vie",
        icon: "logo_defaut",
        button: true,
        onClick: () => {
          const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
          if (!cabinet) {
            return ui.notifications.warn("L'arbre de vie nécessite un cabinet actif !");
          } else {
            if (cabinet) new ArbreVieForm(cabinet).render(true);
          }
        },
      },
      {
        name: "presentation",
        title: "Présentation du système",
        icon: "fas fa-question",
        button: true,
        onClick: () => {
          new PresentationForm().render(true);
        },
      },
      {
        name: "search",
        title: "Recherche",
        icon: "fas fa-magnifying-glass",
        button: true,
        onClick: () => {
          new SearchDialog().render(true);
        },
      }
    );
    btns.push({
      name: "cabinet_menu",
      title: "Le cabinet des murmures",
      icon: "logo_comportement",
      layer: "cabinet",
      tools: menu,
    });
  });
}
