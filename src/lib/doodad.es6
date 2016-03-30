"use strict";

import { EventEmitter } from "events";
import { NotYetImplementedException } from "~/error/exceptions";

/**
 *
 */
export default class Doodad extends EventEmitter {

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor() {
        super();
    }

    /**
     * [destroy description]
     * @return {[type]} [description]
     */
    destroy() {
        // Trigger a destroy
        this.emit("destroy");
        // Ensure that the listeners are removed
        this.removeAllListeners("destroy");
    }
}
