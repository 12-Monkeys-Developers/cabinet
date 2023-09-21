export default class CabinetActor extends Actor {

    get isUnlocked() {
      if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
      return false;
    }

}