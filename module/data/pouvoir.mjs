export default class CabinetPouvoir extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        const schema = {};

        schema.niveau = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 3});
        schema.sphere = new fields.StringField({required: true, choices: SYSTEM.SPHERE, initial: "malkuth"});
        schema.perisprit = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
        schema.controle = new fields.BooleanField({initial: false});
        schema.automatique = new fields.BooleanField({initial: false});
        schema.description = new fields.HTMLField();

        return schema;
    }
}