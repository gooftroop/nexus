"use strict";

import _ from "lodash";
import redis from "redis";
import CODES from "~/error/codes";
import IRegistry from "~/middleware/services/registry/registry";
import {
    IllegalArgumentException, RegistryException
}
from "~/error/exceptions";

/**
 * Provides a registry of all services (or apps) connected to the server
 */
export default class ServiceRegistry extends IRegistry {

    // TODO implement a synced cache
    // This will require a pub/sub for inputs to sync the cache with the correct data

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor() {
        super();
        let redisConfig = this.config.registry.get("redis");
        // TODO build connection config object
        this.storage = redis.createClient();

        // Configure error reporting
        this.storage.on("error", function(e) {
            this.logger.error(e);
        });

        // TODO test if password is available, if so call auth
    }

    destroy() {
        super();
        this.storage.end();
    }

    /**
     * [contains description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    contains(name) {
        return (this.get(name) != null);
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

        // TODO gotta make this work...
        return this.storage.get(name, (err, reply) => {
            // If reply is null, error
            // If err is not null, error
            // Otherwise, load the data and the load configuration from the response
            // instanitate the correct service and return
            // TODO validate reply
            return reply;
        });
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
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "string");
        }

        if (service == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "service");
        }

        // TODO set if not exists? otherwise error out?
        // Store the service data, along with information on how to load the correct service
        this.storage.set(name, JSON.stringify(service));
        // TODO send out publish to notify that a set has occurred
        return service;
    }

    /**
     * [all description]
     * @return {[type]} [description]
     */
    all() {
        // TODO!
        return _.values(this.storage);
    }

    /**
     * [remove description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    remove(name) {
        if (name == null) { // TODO check if string
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.has(this.storage, name)) {
            throw new RegistryError(CODES.SERVICE_NOT_FOUND, name);
        }

        // TODO!
        let service = this.storage.get(name);
        delete this.storage[name];
        return service;
    }
}
