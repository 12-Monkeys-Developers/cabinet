/**
 * Acquis : Nom, valeur de +1 à +3, description optionnelle
 * Milieu est géré dans le nom de l'item
 */
export default class CabinetAcquis extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        const schema = {};

        schema.valeur = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 3});
        schema.description = new fields.HTMLField({ required: false, blank: true });

        return schema;
    }
}