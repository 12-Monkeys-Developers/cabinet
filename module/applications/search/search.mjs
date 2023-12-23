import { SYSTEM } from "../../config/system.mjs";

/**
 * Prompt the user to perform a search.
 * @extends {Dialog}
 */
export class SearchDialog extends Dialog {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 400,
      height: 230,
      template: `systems/${SYSTEM.id}/templates/search/search-dialog.hbs`,
    });
  };
  data={
    title: game.i18n.localize("CDM.SEARCHTOOL.window_title"),
    buttons: {
      chercher: {
        label: game.i18n.localize("CDM.SEARCHTOOL.button_search"),
        callback: (html) => {
          this.patternSearch(html);
        },
        icon: `<i class="fas fa-magnifying-glass"></i>`,
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CDM.SEARCHTOOL.button_cancel"),
        callback: () => {},
      },
    },
    default: "chercher",
    close: () => {},
  };
  
  async patternSearch(html) {
    let searchPattern = html.find("[name=searchtext]")[0].value;
    console.log(searchPattern);
    let resultCollection = [];
    game.journal.forEach((doc) => {
      resultCollection.push(...doc.pages.search({ query: searchPattern }));
    });
    let itemResultCollection = game.items.search({ query: searchPattern });
    let actorResultCollection = game.actors.search({ query: searchPattern });

    const htmlChat = await renderTemplate("systems/cabinet/templates/chat/searchResult.hbs", {
      resultCollection: resultCollection,
      itemResultCollection: itemResultCollection,
      actorResultCollection: actorResultCollection,
      pattern: searchPattern,
    });
    const chatData = {
      content: htmlChat,
      whisper: [game.user],
    };
    ChatMessage.create(chatData);
    return;
  }
}
