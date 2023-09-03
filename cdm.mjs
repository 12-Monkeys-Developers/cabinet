import { SYSTEM } from "./module/config/system.mjs";
globalThis.SYSTEM = SYSTEM;

// Import modules
import * as applications from "./module/applications/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/data/_module.mjs";

Hooks.once("init", async function () {

    console.log(`Initialisation du système Cabinet des murmures...`);
    game.system.CONST = SYSTEM;

    CONFIG.Actor.documentClass = documents.CabinetActor;

    CONFIG.Actor.dataModels = {
        esprit: models.CabinetEsprit
    }
   
    Items.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(SYSTEM.id, applications.EspritSheet, {types: ["esprit"], makeDefault: true});

});


Hooks.once("ready", async function () {   
    console.debug("Initialisation du système fini");
});