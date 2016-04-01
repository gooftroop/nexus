"use strict";

import _ from "lodash";
import CODES from "~/error/codes";
import IRegistry from "~/services/registry/registry";
import {
    IllegalArgumentException, RegistryException
}
from "~/error/exceptions";

/**
 * Provides a registry of all services (or apps) connected to the server
 */
export default class ServiceRegistry extends IRegistry {

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor() {
        super();
        this.storage = {};
    }

    /**
     * [contains description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    contains(name) {
        return _.has(this.storage, name);
    }

    /**
     * [get description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get(name) {
        if (name == null) { // TODO check if string
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.isString(name)) {
            throw new IllegalArgumentException(CODES.ILLEGAL_ARGUMENT, "name", "Service name must be a string");
        }

        if (!this.contains(name)) {
            throw new RegistryException(CODES.ILLEGAL_SERVICE_NAME, "name");
        }

        return this.storage[name];
    }

    /**
     * [set description]
     * @param {[type]} name    [description]
     * @param {[type]} serivce [description]
     */
    set(name, service) {
        if (name == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.isString(name)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
        }

        // allow null value set
        this.storage[name] = service;
        return service;
    }

    /**
     * [all description]
     * @return {[type]} [description]
     */
    all() {
        return _.values(this.storage);
    }

    /**
     * [remove description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    remove(name) {
        if (name == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.isString(name)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
        }

        if (!_.has(this.storage, name)) {
            throw new RegistryError(CODES.SERVICE_NOT_FOUND, name);
        }

        let service = this.storage[name];
        delete this.storage[name];
        return service;
    }
}
