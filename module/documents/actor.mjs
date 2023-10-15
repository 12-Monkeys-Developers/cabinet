export default class CabinetActor extends Actor {
  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  /** @inheritdoc */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    switch (data.type) {
      case "esprit":
        const pack = game.packs.get('world.actions');
        if (!pack) return;
        const index = await pack.getIndex();
        let actions = [];
        for (const action of index) {
          const item = await fromUuid(action.uuid);
          actions.push(item.toObject());
        }
        this.updateSource({items: actions});
        break;
    }
  }
}
