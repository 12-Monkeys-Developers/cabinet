export default class CabinetCorruption extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: true, blank: true, textSearch: true })
    };
  }
}
