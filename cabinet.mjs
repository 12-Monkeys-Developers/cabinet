import { SYSTEM } from "./module/config/system.mjs";
import setupTextEnrichers from "./module/config/text-enrichers.mjs";
import initControlButtons from "./module/applications/sidebar/control-buttons.mjs";
import ComedienApp from "./module/canvas/comedien.mjs";
import { registerHandlebarsHelpers } from "./module/helpers.mjs";

globalThis.SYSTEM = SYSTEM;

// Import modules
import * as applications from "./module/applications/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/data/_module.mjs";

Hooks.once("init", async function () {
  console.log(`CABINET DES MURMURES | Initialisation du système...`);
  game.system.CONST = SYSTEM;
  if (!game.system.CABINET_MENU) {
    game.system.CABINET_MENU;
  }

  //CONFIG.debug.hooks = true;

  CONFIG.ui.players = applications.PlayersList;

  // Configuration document Actor
  CONFIG.Actor.documentClass = documents.CabinetActor;

  CONFIG.Actor.dataModels = {
    cabinet: models.CabinetCabinet,
    corps: models.CabinetCorps,
    esprit: models.CabinetEsprit,
    pnj: models.CabinetPnj,
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM.id, applications.EspritSheet, { types: ["esprit"], makeDefault: true });
  Actors.registerSheet(SYSTEM.id, applications.CorpsSheet, { types: ["corps"], makeDefault: true });
  Actors.registerSheet(SYSTEM.id, applications.CabinetSheet, { types: ["cabinet"], makeDefault: true });
  Actors.registerSheet(SYSTEM.id, applications.PnjSheet, { types: ["pnj"], makeDefault: true });

  // Configuration document Item
  CONFIG.Item.documentClass = documents.CabinetItem;

  CONFIG.Item.dataModels = {
    acquis: models.CabinetAcquis,
    action: models.CabinetAction,
    arme: models.CabinetArme,
    armure: models.CabinetArmure,
    corruption: models.CabinetCorruption,
    grace: models.CabinetGrace,
    pouvoir: models.CabinetPouvoir,
  };

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM.id, applications.AcquisSheet, { types: ["acquis"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.ActionSheet, { types: ["action"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.ArmeSheet, { types: ["arme"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.ArmureSheet, { types: ["armure"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.CorruptionSheet, { types: ["corruption"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.GraceSheet, { types: ["grace"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.PouvoirSheet, { types: ["pouvoir"], makeDefault: true });

  // Dice system configuration
  CONFIG.Dice.rolls.push(dice.StandardCheck);

  loadTemplates([
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-qualites.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-qualite-group.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-actions.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-actions-group.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-concept.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-pouvoirs.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-description.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-combat.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-description.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/tab-notes.hbs`,
    `systems/${SYSTEM.id}/templates/forms/arbre-vie.hbs`,
    `systems/${SYSTEM.id}/templates/chat/searchResult.hbs`
  ]);

  // Configuration text enrichers
  setupTextEnrichers();

  // menu de gauche
  initControlButtons();

  //configuration Handlebars
  registerHandlebarsHelpers();
  
  game.settings.register("cabinet", "cabinet", {
    name: "Cabinet",
    hint: "Id du cabinet.",
    scope: "world",
    config: false,
    type: String,
  });

  game.settings.register("cabinet", "appComedien", {
    name: "Comédien",
    hint: "Utilisation du médaillon Comédien",
    scope: "world",
    config: true,
    type: String,
    choices: {
      aucun: "CDM.SETTINGS.appComedien.aucun",
      haut: "CDM.SETTINGS.appComedien.haut",
      bas: "CDM.SETTINGS.appComedien.bas",
    },
    requiresReload: true,
  });
});

Hooks.once("i18nInit", function () {
  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

Hooks.once("ready", async function () {
  if (game.settings.get("cabinet", "appComedien") !== "aucun") {
    let comedien = null;
    let cabinet = await game.actors.filter((actor) => actor.type === "cabinet")[0];
    
    if (cabinet) {
      const comedienId = cabinet.system.comedien;
      
      if (comedienId) {
        comedien = await game.actors.get(comedienId);
      }
    }
      const comedienApp = new ComedienApp(comedien);
      comedienApp.render(true);
      console.log("renderApplication - comedienApp", comedienApp);
  }

  console.log("CABINET DES MURMURES | Initialisation du système fini.");
});



function preLocalizeConfig() {
  const localizeConfigObject = (obj, keys) => {
    for (let o of Object.values(obj)) {
      for (let k of keys) {
        o[k] = game.i18n.localize(o[k]);
      }
    }
  };

  localizeConfigObject(SYSTEM.SPHERES, ["label"]);
  localizeConfigObject(SYSTEM.QUALITES, ["label"]);
  localizeConfigObject(SYSTEM.ASPECTS, ["label"]);
  localizeConfigObject(SYSTEM.ATTRIBUTS, ["label"]);
  localizeConfigObject(SYSTEM.ACTION_CATEGORIES, ["label"]);
  localizeConfigObject(SYSTEM.DIFFICULTES, ["label"]);
}
