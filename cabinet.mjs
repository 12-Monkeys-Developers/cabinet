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
import { CabinetUtils, ComedienUtils, SocketUtils } from "./module/utils.mjs";
import { CdmChat } from "./module/chat.mjs";

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
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-combat.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/corps-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/cabinet-description.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-details.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-combat.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-sante.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/pnj-description.hbs`,
    `systems/${SYSTEM.id}/templates/sheets/partials/tab-notes.hbs`,
    `systems/${SYSTEM.id}/templates/forms/arbre-vie.hbs`,
    `systems/${SYSTEM.id}/templates/chat/searchResult.hbs`,
  ]);

  // Configuration text enrichers
  setupTextEnrichers();

  // menu de gauche
  initControlButtons();

  //configuration Handlebars
  registerHandlebarsHelpers();

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

  // Define socket
  game.socket.on("system.cabinet", (data) => {
    SocketUtils.performSocketMesssage(data);
  });
});

Hooks.once("i18nInit", function () {
  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

Hooks.once("ready", async function () {
  if (game.settings.get("cabinet", "appComedien") !== "aucun") {
    let cabinet = CabinetUtils.cabinet();

    if (cabinet) {
      const comedienApp = new ComedienApp(cabinet);
      comedienApp.render(true);
      console.log("renderApplication - comedienApp", comedienApp);
    }
  }
  console.log("CABINET DES MURMURES | Initialisation du système fini.");
});

Hooks.on("deleteActor", async (document, options, userId) => {
  // Suppression du comédien
  if (document.type === "esprit" && document.system.comedien) {
    ComedienUtils.reset();
  }
  // Mise à jour du cabinet
  const cabinet = game.actors.filter((actor) => actor.type === "cabinet")[0];
  if (cabinet) {
    if (document.type === "corps" && cabinet.system.corps === document.id) await cabinet.update({ "system.corps": null });
    if (document.type === "esprit" && cabinet.system.esprits.includes(document.id)) {
      // Mise à jour des esprits
      let esprits = cabinet.system.esprits.filter((esprit) => esprit !== document.id);
      await cabinet.update({ "system.esprits": esprits });
    }
  }
});

Hooks.on("renderChatMessage", (message, html, data) => {
  console.log("renderChatMessage", message, html, data);

  const typeMessage = data.message.flags.world?.type;
  // Demande comédien
  if (typeMessage === "demandeComedien") {
    const estDestinataire = data.message.flags.world && data.message.flags.world.idComedien === game.user.character?.id;

    // Boutons d'action
    // Si c'est le MJ ou le joueur qui est comédien
    if (game.user.isGM || estDestinataire) {
      html.find("#demander-comedien-accepter").click((event) => {
        CdmChat.demanderComedienAccepter(event, data.message);
      });
      html.find("#demander-comedien-refuser").click((event) => {
        CdmChat.demanderComedienRefuser(event, data.message);
      });
    } else {
      const chatActions = html.find(".comedien-actions");
      chatActions[0].style.display = "none";
    }
  }

  // Réponse comédien
  if (typeMessage === "reponseComedien") {
    const estDestinataire = data.message.flags.world && data.message.flags.world.idComedien === game.user.character?.id;

    // Bouton de discorde
    // Si c'est le MJ, le joueur qui est comédien ou le joueur qui a envoyé le message
    if (estDestinataire || data.message.flags.world.userIdDemandeur === game.user.id) {
      html.find("#demander-comedien-discorde").click((event) => {
        CdmChat.demanderComedienDiscorde(event, data.message);
      });
    } else {
      const chatActions = html.find(".comedien-discorde");
      chatActions[0].style.display = "none";
    }
  }
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
