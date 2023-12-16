import { SYSTEM } from "./config/system.mjs";

export const registerHandlebarsHelpers = function () {
  Handlebars.registerHelper("getQualiteProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.${prop}`);
  });

  Handlebars.registerHelper("getDefautProperty", function (actor, qualite, prop) {
    return foundry.utils.getProperty(actor.system.qualites, `${qualite}.defaut.${prop}`);
  });

  Handlebars.registerHelper("getAttributProperty", function (actor, attribut, prop) {
    return actor.system.attributs[attribut.id][prop];
  });

  Handlebars.registerHelper("getCombatProperty", function (actor, combat, prop) {
    return actor.system.combat[combat.id][prop];
  });

  Handlebars.registerHelper("positionArbre", function (actor, qualite) {
    if (actor.system.positionArbre === SYSTEM.QUALITES[qualite].sphere) return "position-arbre";
    else return "";
  });

  Handlebars.registerHelper("getBackgroundCss", function (actor) {
    if (actor.system.comedien) return "var(--background_esprit_header_comedien)";
    if (actor.system.jardin) return "var(--background_esprit_header_jardin)";
    return "var(--background_esprit_header)";
  });

  Handlebars.registerHelper("testlog", function (data) {
    return console.log("Handlebars log : ", data);
  });

  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (var i = 0; i < n; ++i) {
      // Pass the index to the block with block.fn
      accum += block.fn(i, { data: { index: i } });
    }
    return accum;
  });

  Handlebars.registerHelper("nbCasesSante", function (actor, zone) {
    return actor.system.sante[zone].reserve + 1;
  });

  Handlebars.registerHelper("seuilSante", function (actor, zone, index) {
    return index === actor.system.sante[zone].seuil - 1;
  });

  Handlebars.registerHelper("estCocheeSante", function (actor, zone, index) {
    const valeur = actor.system.sante[zone].valeur;
    if (valeur < actor.system.sante[zone].seuil) return index <= valeur - 1;
    else return index <= valeur;
  });

};
