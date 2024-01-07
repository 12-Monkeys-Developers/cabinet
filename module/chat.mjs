export default class CdmChat {
  /**
   * Constructor.
   * @param actor The emiter of the chat message.
   */
  constructor(actor) {
    this.actor = actor;
    this.chat = null;
    this.content = null;
    this.template = null;
    this.data = null;
    this.chatData = null;
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

    // Le joueur a choisi de chuchoter au le MJ
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
}
