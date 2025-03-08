import { ArbreVieForm } from "../forms/arbre-vie.mjs";
import { PresentationForm } from "../forms/presentation.mjs";

export default function initControlButtons() {
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.cabinet = {
      name: "cabinet_menu",
      title: "Le cabinet des murmures",
      icon: "logo_comportement",
      tools: {
        arbre: {
          name: "arbre",
          title: "Arbre de vie",
          icon: "logo_defaut",
          onChange: (event, active) => {
            const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
            if (!cabinet) {
              return ui.notifications.warn("L'arbre de vie nécessite un cabinet actif !");
            } else {
              if (cabinet) new ArbreVieForm(cabinet).render(true);
            }
          },
          button: true,
        },
        presentation: {
          name: "presentation",
          title: "Présentation du système",
          icon: "fas fa-question",
          button: true,
          onChange: (event, active) => {
            new PresentationForm().render(true);
          },
          button: true,
        },
      },
    };
  });
}
