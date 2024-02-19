import { SYSTEM } from "./module/config/system.mjs";
import setupTextEnrichers from "./module/config/text-enrichers.mjs";
import initControlButtons from "./module/applications/sidebar/control-buttons.mjs";
import ComedienApp from "./module/canvas/comedien.mjs";
import { registerHandlebarsHelpers } from "./module/helpers.mjs";
import { SearchChat } from "./module/applications/search/research.mjs";

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
    default: "haut",
  });

  game.settings.register("cabinet", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("cabinet", "visibiliteJetsPNJ", {
    name: "Visibilité des jets de dés des PNJs",
    hint: "Détermine si les jets de dés du MJ sont visibles par les joueurs : toujours, jamais, ou selon le paramétrage du chat du MJ.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      private: "Toujours privés : seul le MJ les voit",
      public: "Toujours publics : tout le monde les voit",      
      depends: "Selon le réglage dans le chat",
    },
    default: "private",
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

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey");
    if (worldKey == undefined || worldKey == "") {
      worldKey = randomID(32);
      game.settings.set(registerKey, "worldKey", worldKey);
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    };

    let apiURL = "https://worlds.qawstats.info/worlds-counter";
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    });
  }
}

Hooks.once("ready", async function () {
  if (game.settings.get("cabinet", "appComedien") !== "aucun") {
    let cabinet = CabinetUtils.cabinet();

    if (cabinet) {
      const comedienApp = new ComedienApp(cabinet);
      comedienApp.render(true);
      console.debug("renderApplication - comedienApp", comedienApp);
    }
  }
  registerWorldCount("cabinet");

  console.log("CABINET DES MURMURES | Initialisation du système fini.");
});

Hooks.on("deleteActor", async (document, options, userId) => {
  // Mise à jour du cabinet
  const cabinet = CabinetUtils.cabinet();
  if (cabinet) {
    if (document.type === "corps" && cabinet.system.corps === document.id) await cabinet.update({ "system.corps": null });
    if (document.type === "esprit" && cabinet.system.esprits.includes(document.id)) {
      // Mise à jour des esprits
      let esprits = cabinet.system.esprits.filter((esprit) => esprit !== document.id);
      await cabinet.update({ "system.esprits": esprits });
      // Suppression de l'esprit de l'arbre du cabinet s'il était dans l'arbre de vie
      const positionArbre = document.system.positionArbre;
      if (positionArbre !== "aucune" && positionArbre !== "jardin") {
        const arbre = cabinet.system.arbre;
        arbre[positionArbre].idEsprit = null;
        await cabinet.update({ "system.arbre": arbre });
      }
      // Suppression du comédien
      if (document.system.comedien) {
        await cabinet.update({ "system.comedien": null });
      }
    }
  }
});

Hooks.on("createActor", async (document, options, userId) => {
  if (document.type === "cabinet") {
    if (game.settings.get("cabinet", "appComedien") !== "aucun") {
      const comedienApp = new ComedienApp(document);
      comedienApp.render(true);
      console.debug("renderApplication - comedienApp", comedienApp);
    }
  }
});

Hooks.on("renderChatMessage", (message, html, data) => {
  console.debug("renderChatMessage", message, html, data);

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
  // ******  CODE FOR SEARCH 
  if (typeMessage === "searchPage") {
    html.find("#ouvrirpage").click((event) => SearchChat.onOpenJournalPage(event, data.message.flags.world?.searchPattern));
  }
  // ******  END OF CODE FOR SEARCH 
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
