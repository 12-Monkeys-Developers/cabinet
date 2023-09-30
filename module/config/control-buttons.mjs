export default function initControlButtons() {
  CONFIG.Canvas.layers.cabinet = { layerClass: ControlsLayer, group: "primary" };

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = [];

    menu.push(
      {
        name: "aides",
        title: "Règles",
        icon: "fas fa-book-reader",
        button: true,
        onClick: () => {
          let journal = game.journal.get("ffffffffffff");
          if (journal) journal.sheet.render(true, { pageId: "ffffffffffff", sheetMode: "text" });
        },
      },
      {
        name: "arbre",
        title: "Arbre de vie",
        icon: "logo_defaut",
        button: true,
        onClick: () => {
          let calledForm = game.settings.get("cabinet", "arbreform");
          calledForm.render(true);
        },
      },
      {
        name: "gestion",
        title: "Gestion du Cabinet",
        icon: "logo_comportement",
        button: true,
        onClick: () => {
          let calledForm = game.settings.get("cabinet", "gestionform");
          calledForm.render(true);
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
