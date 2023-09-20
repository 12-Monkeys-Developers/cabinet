import { SYSTEM } from "./module/config/system.mjs";
import setupTextEnrichers from "./module/config/textenrichers.mjs";
globalThis.SYSTEM = SYSTEM;

// Import modules
import * as applications from "./module/applications/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/data/_module.mjs";

Hooks.once("init", async function () {
  console.log(`Initialisation du système Cabinet des murmures...`);
  game.system.CONST = SYSTEM;

  // Configuration document Actor
  CONFIG.Actor.documentClass = documents.CabinetActor;

  CONFIG.Actor.dataModels = {
    esprit: models.CabinetEsprit,
    corps: models.CabinetCorps,
    cabinet: models.CabinetCabinet,
    pnj: models.CabinetPnj,
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM.id, applications.EspritSheet, { types: ["esprit"], makeDefault: true });
  console.log("actors  ", Actors);

  // Configuration document Item
  CONFIG.Item.documentClass = documents.CabinetItem;

  CONFIG.Item.dataModels = {
    acquis: models.CabinetAcquis,
    arme: models.CabinetArme,
    armure: models.CabinetArmure,
    corruption: models.CabinetCorruption,
    pouvoir: models.CabinetPouvoir,
  };

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM.id, applications.AcquisSheet, { types: ["acquis"], makeDefault: true });
  Items.registerSheet(SYSTEM.id, applications.PouvoirSheet, { types: ["pouvoir"], makeDefault: true });

  loadTemplates(["systems/cabinet/templates/partials/actor/qualites.hbs", "systems/cabinet/templates/partials/actor/qualite-group.hbs"]);

  // Configuration text enrichers
  setupTextEnrichers();

  //configuration Handlebars
  Handlebars.registerHelper("getQualiteProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.${prop}`);
  });

  Handlebars.registerHelper("getDefautProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.defaut.${prop}`);
  });
});

Hooks.once("i18nInit", function () {
  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

Hooks.once("ready", async function () {
  console.debug("Initialisation du système fini");
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
}
