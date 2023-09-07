import { SYSTEM } from "./module/config/system.mjs";
globalThis.SYSTEM = SYSTEM;

// Import modules
import * as applications from "./module/applications/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/data/_module.mjs";

Hooks.once("init", async function () {

    console.log(`Initialisation du système Cabinet des murmures...`);
    game.system.CONST = SYSTEM;

    // Actor document configuration
    CONFIG.Actor.documentClass = documents.CabinetActor;

    CONFIG.Actor.dataModels = {
        esprit: models.CabinetEsprit,
        corps: models.CabinetCorps
    };
   
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(SYSTEM.id, applications.EspritSheet, {types: ["esprit"], makeDefault: true});

    // Item document configuration
    CONFIG.Item.documentClass = documents.CabinetItem;

    CONFIG.Item.dataModels = {
        pouvoir: models.CabinetPouvoir
    }

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(SYSTEM.id, applications.PouvoirSheet, {types: ["pouvoir"], makeDefault: true});
});

Hooks.once("i18nInit", function() {

  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

Hooks.once("ready", async function () {   
    console.debug("Initialisation du système fini");
});

function preLocalizeConfig() {
    const localizeConfigObject = (obj, keys) => {
      for ( let o of Object.values(obj) ) {
        for ( let k of keys ) {
          o[k] = game.i18n.localize(o[k]);
        }
      }
    }
  
    localizeConfigObject(SYSTEM.SPHERES, ["label"]);
}