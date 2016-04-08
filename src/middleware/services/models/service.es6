"use strict";

import _ from "lodash";
import CODES from "~/error/exceptions";
import {
    IllegalArgumentException
}
from "~/error/exceptions";

/**
 *
 */
export default class ServiceModel {

    // Internall data structure
    _attributes = {};

    // Model name
    _name = null;

    // Adapter name
    _adapter = null;

    /**
     * [constructor description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    constructor(name) {
        this.name = name;
    }

    /**
     * [adapter description]
     * @return {[type]} [description]
     */
    get adapter() {
        return this._adapter;
    }

    /**
     * [adpater description]
     * @param  {[type]} adapter [description]
     * @return {[type]}         [description]
     */
    set adapter(adapter) {
        if (adapter == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "adapter");
        }

        if (!_.isString(adapter)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "adapter", "String");
        }

        this._adapter = adapter;
    }

    /**
     * [name description]
     * @return {[type]} [description]
     */
    get name() {
        return this._name;
    }

    /**
     * [name description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    set name(name) {
        if (name == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.isString(name)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
        }
        this._name = name;
    }

    /**
     * [get description]
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    get(key) {
        return this._attributes[key];
    }

    /**
     * [set description]
     * @param {[type]} key   [description]
     * @param {[type]} value [description]
     */
    set(key, value) {
        if (key == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "key");
        }
        this._attributes[key] = value;
        return this;
    }

    /**
     * Override at Service implementation level
     * @return {[type]} [description]
     */
    toJSON() {
        return _.extend(this._attributes, { name: this.name });
    }
}
