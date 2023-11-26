import { SYSTEM } from "./module/config/system.mjs";
import setupTextEnrichers from "./module/config/text-enrichers.mjs";
import initControlButtons from "./module/applications/sidebar/control-buttons.mjs";
import ComedienApp from "./module/canvas/comedien.mjs";

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
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/tab-notes.hbs`,
    `systems/${SYSTEM.id}/templates/forms/arbre-vie.hbs`,
  ]);

  // Configuration text enrichers
  setupTextEnrichers();

  // menu de gauche
  initControlButtons();

  //configuration Handlebars
  Handlebars.registerHelper("getQualiteProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.${prop}`);
  });

  Handlebars.registerHelper("getDefautProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.defaut.${prop}`);
  });

  Handlebars.registerHelper("getAttributProperty", function (actor, attribut, prop) {
    return actor.system.attributs[attribut.id][prop];
  });

  Handlebars.registerHelper("positionArbre", function (actor, qualite) {
    if (actor.system.positionArbre === SYSTEM.QUALITES[qualite].sphere) return "position-arbre";
    else return "";
  });

  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
      // Pass the index to the block with block.fn
      accum += block.fn(i, { data: { index: i } });
    }
    return accum;
  });
  
  Handlebars.registerHelper("nbCasesSante", function (actor, zone) {
    return actor.system.sante[zone].reserve + 1;
  });

  Handlebars.registerHelper("seuilSante", function (actor, zone, index) {
    return index === (actor.system.sante[zone].seuil - 1);
  });

  Handlebars.registerHelper("estCocheeSante", function (actor, zone, index) {
    const valeur = actor.system.sante[zone].valeur;
    if (valeur < actor.system.sante[zone].seuil) return index <= (valeur - 1);
    else return index <= valeur;    
  });

  /*
  Handlebars.registerHelper('eq', function (value1, value2) {
    return value1 === value2;
  });
  */
  
  game.settings.register("cabinet", "cabinet", {
    name: "Cabinet",
    hint: "Id du cabinet.",
    scope: "world",
    config: true,
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
    const cabinetId = game.settings.get("cabinet", "cabinet");
    let cabinet = null;
    let comedien = null;
    
    if (cabinetId) {
      cabinet = await game.actors.get(cabinetId);
    }
    
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
  localizeConfigObject(SYSTEM.ARME_SOUSTYPES, ["label"]);
  localizeConfigObject(SYSTEM.ARME_CATEGORIES, ["label"]);
}
