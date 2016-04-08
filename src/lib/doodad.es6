"use strict";

import { EventEmitter } from "events";
import { NotYetImplementedException } from "~/error/exceptions";

/**
 *
 */
export default class Doodad extends EventEmitter {

    // Object Identifier
    _id = null;

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(id) {
        super();
        this.id = id;
    }

    /**
     * [id description]
     * @return {[type]} [description]
     */
    get id() {
        return this._id;
    }

    /**
     * [id description]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    set id(id) {
        this._id = id;
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

    /**
     * [meta description]
     * @return {[type]} [description]
     */
    toJSON() {
        // TODO implement default meta
        return {
            id: id
        };
    }
}
