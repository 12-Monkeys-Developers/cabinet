import { ComedienUtils } from "./utils.mjs";

export class CdmChat {
  /**
   * Constructor.
   * @param actor The emiter of the chat message.
   */
  constructor(actor) {
    this.actor = actor;
    this.chat = null;
    this.content = null;
    this.template = null;
    this.data = null;     // data to provide to the template
    this.chatData = null; // data to create the chat message to display
    this.flags = null;
    this.rolls = null;
  }

  /**
   * Sets the specified message content.
   * @param content The content to set.
   * @returns the instance.
   */
  withContent(content) {
    this.content = content;
    return this;
  }

  /**
   * Sets the specified template used to create the message content.
   * @param template The path of the file template to set.
   * @returns the instance.
   */
  withTemplate(template) {
    this.template = template;
    return this;
  }

  /**
   * Sets the specified data used to create the message content.
   * @param data The data of the file template to set.
   * @returns the instance.
   */
  withData(data) {
    this.data = data;
    return this;
  }

  /**
   * Sets the flags parameter.
   * @param flags The flags parameter to set.
   * @returns the instance.
   */
  withFlags(flags) {
    this.flags = flags;
    return this;
  }

  /**
   * Indicates if the chat is a roll.
   * @param rolls array of Roll instances
   * @returns the instance.
   */
  withRolls(rolls) {
    this.rolls = rolls;
    return this;
  }

  /**
   * Creates the chat message.
   * @return this instance.
   */
  async create() {
    // Retrieve the message content
    if (!this.content && this.template && this.data) {
      this.content = await this._createContent();
    }

    // Exit if message content can't be created
    if (!this.content) {
      return null;
    }

    // Create the chat data
    const data = {
      user: game.user.id,
      speaker: {
        actor: this.actor.id,
        alias: this.actor.name,
        scene: null,
        token: null,
      },
      content: this.content,
    };

    // Set the roll parameter if necessary
    if (this.rolls) {
      data.rollMode = this.data.rollMode;
      data.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
      const pool = PoolTerm.fromRolls(this.rolls);
      data.roll = Roll.fromTerms([pool]);
    }

    // Set the flags parameter if necessary
    if (this.flags) {
      data.flags = this.flags;
    }

    let visibilityMode = this.data.rollMode ?? game.settings.get("core", "rollMode");

    // Jet des PNJs
    if (this.actor.type === "pnj" && game.user.isGM) visibilityMode = "gmroll";

    // Le joueur a choisi de chuchoter au MJ
    if (this.data.isWhisper) visibilityMode = "gmroll";

    ChatMessage.applyRollMode(data, visibilityMode);

    // Create the chat
    this.chatData = data;
    console.log("chat create", this);
    return this;
  }

  /**
   * Create the message content from the registered template.
   * @returns the message content or null if an error occurs.
   */
  async _createContent() {
    // Update the data to provide to the template
    const data = duplicate(this.data);
    //TODO owner pour faire quoi ?
    data.owner = this.actor.id;

    // Call the template renderer.
    return await renderTemplate(this.template, data);
  }

  /**
   * @description Displays the chat message
   * @returns this instance
   */
  async display() {
    // Create the chat
    this.chat = await ChatMessage.create(this.chatData);
    return this;
  }


  /*** Fonctions utilisées dans le chat ***/

  /**
   * Accepter la demande de comédien 
   * @param {*} event 
   * @param {*} message 
   */
  static async demanderComedienAccepter(event, message) {
    event.preventDefault();
    console.log("demanderComedienAccepter", event, message);
    const element = event.currentTarget;

    const idEsprit = element.dataset.idEsprit;    
    const esprit = game.actors.get(idEsprit);

    const idComedien = element.dataset.idComedien;
    const comedien = game.actors.get(idComedien);

    await ComedienUtils.set(esprit);

    // Get the message
    const messageId = message._id;    

    let chatData = {
      actingCharName: esprit.name,        
      actingCharImg: esprit.img,
      idComedien: comedien.id,
      introText: game.i18n.format("CDM.COMEDIENCHATMESSAGE.introText", { actingCharName: esprit.name, comedienName: comedien.name }),
      nomComedien: game.user.isGM ? "Le MJ ": comedien.name,
      demande: false,
      accepte: true,
      refuse: false,
    };

    let newChatMessage = await new CdmChat(esprit).withTemplate("systems/cabinet/templates/chat/demanderComedien.hbs").withData(chatData).create();

    if (game.user.isGM) { 
      const message = game.messages.get(messageId);
      message.update({ content: newChatMessage.content });
    }
    else game.socket.emit("system.cabinet", {msg: "updateChatMessage", data: {messageId: messageId, content: newChatMessage.content}});
   
  }

  /**
   * Refuser la demande de comédien
   * Remplace le message initial par un message de refus et un bouton de discorde
   * @param {*} event 
   * @param {*} message 
   */
  static async demanderComedienRefuser(event, message) {
    event.preventDefault();
    console.log("demanderComedienRefuser", event, message);
    const element = event.currentTarget;

    const idEsprit = element.dataset.idEsprit;    
    const esprit = game.actors.get(idEsprit);

    const idComedien = element.dataset.idComedien;
    const comedien = game.actors.get(idComedien);

    // Get the message
    const messageId = message._id;
    const userIdDemandeur = element.dataset.idUserDemandeur; 

    let chatData = {
      actingCharName: esprit.name,        
      actingCharImg: esprit.img,
      idComedien: comedien.id,
      nomComedien: game.user.isGM ? "Le MJ ": comedien.name,
      introText: game.i18n.format("CDM.COMEDIENCHATMESSAGE.introText", { actingCharName: esprit.name, comedienName: comedien.name }),      
      demande: false,
      accepte: false,
      refuse: true,
      userIdDemandeur: userIdDemandeur
    };

    let newChatMessage = await new CdmChat(esprit).withTemplate("systems/cabinet/templates/chat/demanderComedien.hbs").withData(chatData).withFlags({world: {type: "reponseComedien", userIdDemandeur: userIdDemandeur}}).create();

    if (game.user.isGM) { 
      const message = game.messages.get(messageId);
      message.update({ content: newChatMessage.content });
    }
    else game.socket.emit("system.cabinet", {msg: "updateChatMessage", data: {messageId: messageId, content: newChatMessage.content, flags: newChatMessage.flags}});
  }

  /**
   * Cliquer sur le bouton de discorde dans le chat 
   * @param {*} event 
   * @param {*} message 
   */
  static async demanderComedienDiscorde(event, message) {
    event.preventDefault();
    console.log("demanderComedienDiscorde", event, message);
    
    const user = game.user.id;
    const actor = game.actors.get(game.user.character?.id);
    if (actor) {
      return actor.rollSkill('autorite', { dialog: true, title: "Jet de discorde", defaultValues: {action: 'Discorde', aspect: 'rouah'} });
    }
  }
}
