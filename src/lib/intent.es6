"use strict";

import _ from "lodash";
import Doodad from "~/lib/doodad";
import CODES from "~/error/codes";
import {
    IllegalArgumentException
}
from "~/error/exceptions";

/**
 *
 */
export default class Intent extends Doodad {

    // Internal Data mapping
    data = {};

    // The action of this intent
    action = null;

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(action) {

        super();

        if (action == null || !_.isString(action)) {
            throw new IllegalArgumentException(CODES.INVALID_INTENT, action);
        }

        this.action = action;
    }

    /**
     * [get description]
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    get(key) {

        if (key == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "key");
        }

        // Can return null values!
        return this.data[key];
    }

    /**
     * [put description]
     * @param {[type]} key   [description]
     * @param {[type]} value [description]
     */
    put(key, value) {

        if (key == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "key");
        }

        // Allow null values
        this.data[key] = value;
    }
}
