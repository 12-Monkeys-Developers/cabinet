import { SYSTEM } from "./module/config/system.mjs";
import setupTextEnrichers from "./module/config/text-enrichers.mjs";
import initControlButtons from "./module/applications/sidebar/control-buttons.mjs";

globalThis.SYSTEM = SYSTEM;

// Import modules
import * as applications from "./module/applications/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/data/_module.mjs";

Hooks.once("init", async function () {
  console.log(`Initialisation du système Cabinet des murmures...`);
  game.system.CONST = SYSTEM;
  if(!game.system.CABINET_MENU){
    game.system.CABINET_MENU
  }

  CONFIG.ui.players = applications.PlayersList;

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
  Actors.registerSheet(SYSTEM.id, applications.CorpsSheet, { types: ["corps"], makeDefault: true });
  Actors.registerSheet(SYSTEM.id, applications.CabinetSheet, { types: ["cabinet"], makeDefault: true });
  Actors.registerSheet(SYSTEM.id, applications.PnjSheet, { types: ["pnj"], makeDefault: true });

  // Configuration document Item
  CONFIG.Item.documentClass = documents.CabinetItem;

  CONFIG.Item.dataModels = {
    acquis: models.CabinetAcquis,
    arme: models.CabinetArme,
    armure: models.CabinetArmure,
    corruption: models.CabinetCorruption,
    grace: models.CabinetGrace,
    pouvoir: models.CabinetPouvoir,
    action: models.CabinetAction,
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
    `systems/${SYSTEM.id}/templates/sheets/partials/esprit-perisprit.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-description.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-sante.hbs`,
    `systems/${SYSTEM.id}/templates/forms/arbre-vie.hbs`,
    `systems/${SYSTEM.id}/templates/forms/gestion-cabinet.hbs`
  ]);

  // Configuration text enrichers
  setupTextEnrichers();

  // formulaires
  // registerForms();

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
    return foundry.utils.getProperty(actor.system.attributs, `${attribut}.${prop}`);
  });

  Handlebars.registerHelper("positionArbre", function (actor, qualite) {
    if(actor.system.positionArbre === SYSTEM.QUALITES[qualite].sphere) return "position-arbre";
    else return "";
  });

  Handlebars.registerHelper("getBackgroundImage", function (actor) {
    if (actor.system.comedien && !actor.system.jardin) return "esprit-header-comedien.webp";
    if (!actor.system.comedien && actor.system.jardin) return "esprit-header-jardin.webp";
    return "esprit-header.webp";
  });

  Handlebars.registerHelper("testlog", function (data) {
    return console.log("Handlebars log : ", data);
  });

  // Register settings
  /*game.settings.register("cabinet", "comedien", {
    name: "Comédien",
    hint: "Id de l'esprit qui a le contrôle du corps.",
    scope: "world",
    config: true,
    type: String
  });*/

  /*game.settings.register("cabinet", "corps", {
    name: "Corps",
    hint: "Id du corps.",
    scope: "world",
    config: true,
    type: String
  });  */

  game.settings.register("cabinet", "cabinet", {
    name: "Cabinet",
    hint: "Id du cabinet.",
    scope: "world",
    config: true,
    type: String
  });

});

Hooks.once("i18nInit", function () {
  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

Hooks.once("ready", async function () {
  console.log("Initialisation du système fini");
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
