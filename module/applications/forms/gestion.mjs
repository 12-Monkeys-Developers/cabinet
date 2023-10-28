export class GestionForm extends FormApplication {
  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    Hooks.on("updateActor", async (document, change, options, userId) => this.render());
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Gestion du Cabinet",
      id: "gestionform",
      template: "systems/cabinet/templates/forms/gestion-cabinet.hbs",
      width: 800,
      height: 600,
      resizable: true,
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false,
    });
  }

  /**
   * Lien vers le Cabinet qui est configuré par ce formulaire
   * @type {CabinetCabinet}
   */
  get cabinet() {
    return this.object;
  }

  /** @override */
  async getData(options = {}) {
    return {
      membres: this.cabinet.listeEsprits,
      corps: this.cabinet.corps,
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".membre-enlever").click(this._enleverMembre.bind(this));
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    // Récupère le type et l'uuid
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Actor") return false;

    const actor = await fromUuid(data.uuid);
    if (actor.type !== "esprit" && actor.type !== "corps") return false;

    const actorId = actor._id;

    // Drop d'esprit
    if (actor.type === "esprit") {
      let esprits = this.cabinet.system.esprits;
      if (esprits.includes(actorId)) return false;
      esprits.push(actorId);
      await this.cabinet.update({ "system.esprits": esprits });
      await actor.update({ "system.jardin": true });
    }

    // Drop de corps
    if (actor.type === "corps") {
      await this.cabinet.update({ "system.corps": actorId });
    }

    this.render();
  }

  /* formData est de type {39qxtay7wn2WSIQC.comedien: false, 39qxtay7wn2WSIQC.jardin: true} */
  /** @override */
  async _updateObject(event, formData) {
    console.log("Gestion - _updateObject - formData", formData);
    const results = foundry.utils.expandObject(formData);
    const esprits = Object.entries(results);

    // {id [comedien, jardin]}
    for (const esprit of esprits) {
      let newEsprit = game.actors.get(esprit[0]);
      const positionInitiale = newEsprit.system.positionArbre;
      const jardinInitial = newEsprit.system.jardin;
      
      // Gestion de l'esprit
      await newEsprit.update({ "system.comedien": esprit[1].comedien });
      await newEsprit.modifierJardin(esprit[1].jardin, true);

      // Gestion du cabinet
      // Va au jardin
      if (esprit[1].jardin && !jardinInitial) await this.cabinet.deplacerEspritVersJardin(positionInitiale);
      // TODO Quitte le jardin
      //else await this.cabinet.update({[`system.arbre.${newPosition}.idEsprit`]: actor.id});

      esprit[1].comedien ? await this.cabinet.majComedien(newEsprit.id) : await this.cabinet.majComedien("");    
    }
  }

  /**
   * Retire un membre de cabinet
   * @param {*} event 
   */
  async _enleverMembre(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let indexArray = element.dataset.field;
    let esprits = this.cabinet.system.esprits;
    const x = esprits.splice(indexArray, 1);
    await this.cabinet.update({ "system.esprits": esprits });
    this.render();
  }
}
