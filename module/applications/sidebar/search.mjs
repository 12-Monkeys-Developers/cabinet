export function searchDialog() {
  let htmlTemplate = `<div style="width:100%; text-align:center">
<h3>Recherche de texte dans les journaux</h3>
</div>
<div>
<label for="searchtext">Collez ici le texte à rechercher</label>
<input name="searchtext" type="text" />
</div>`;
  new Dialog(
    {
      title: "Recherche",
      content: htmlTemplate,
      buttons: {
        chercher: {
          label: "Rechercher",
          callback: (html) => {
            patternSearch(html);
          },
          icon: `<i class="fas fa-magnifying-glass"></i>`,
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annuler",
          callback: () => {},
        },
      },
      default: "Rechercher",
      close: () => {},
    },
    {
      width: 400,
      height: 200,
    }
  ).render(true);
}

async function patternSearch(html) {
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
  };
  ChatMessage.create(chatData);
  return;
}
