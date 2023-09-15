
export default function setupTextEnrichers() {

  console.log('=============================== Setting up enrichers ===============================')
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      pattern: /\@awesomefont\[(.+?)\]/gm,
      enricher: async (match, options) => {
        const awdoc = document.createElement("span");
        awdoc.className = "no-indent";
        awdoc.innerHTML = `<i class="fa ${match[1]}"></i>`;
        return awdoc;
      }
    },
    {
      pattern: /\@csslogo\[(.+?)\]/gm,
      enricher: async (match, options) => {
        const logodoc = document.createElement("span");
        logodoc.className = "no-indent";
        logodoc.innerHTML = `<i class="${match[1]}"></i>`;
        return logodoc;
      }
    },
    {
      pattern: /\@journallinkcdm\[(.+?)\]/gm,
      enricher: async (match, options) => {
        const logodoc = document.createElement("span");
        logodoc.className = "no-indent";
        logodoc.innerHTML = `<a class="content-link" data-hash="${match[2]}" data-uuid="${match[1]}" data-id="e0i63rT70ABXllKT" data-type="JournalEntryPage" data-tooltip="Texte Page"><i class="fas fa-file-lines"></i>discorde</a>`;
        return logodoc;
      }
    }
  ]);
}
