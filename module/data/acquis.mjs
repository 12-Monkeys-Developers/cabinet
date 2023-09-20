export default class CabinetAcquis extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        const schema = {};

        schema.valeur = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 3});
        schema.description = new fields.HTMLField();

        return schema;
    }
}