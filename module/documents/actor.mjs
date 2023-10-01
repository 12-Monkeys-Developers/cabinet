export default class CabinetActor extends Actor {

    get isUnlocked() {
      if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
      return false;
    }

    get estComedien(){
      if (this.type !=="esprit") return false;
      let reference = game.settings.get("cabinet", "gestion");
      return (reference.comedien === this.id);
    }
    
    get dansJardin(){
      if (this.type !=="esprit") return false;
      return this.getFlag(game.system.id, "dansJardin");
    }
}