import * as ESPRIT from "./esprit.mjs";
export const SYSTEM_ID = "cabinet";

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
    id: SYSTEM_ID,
    QUALITES: ESPRIT.QUALITES,
    ASPECTS: ESPRIT.ASPECTS
}