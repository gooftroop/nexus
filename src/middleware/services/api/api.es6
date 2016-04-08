"use strict";

// Third-party Imports
import _ from "lodash";
import config from "config";

// Nexus Imports
import Logger from "~/logger";
import CODES from "~/error/codes";
import Intent from "~/lib/intent";
import INexusMiddleware from "~/middleware/base";
import IAdapter from "~/middleware/services/adapters/adapter";
import IRegistry from "~/middleware/services/registry/registry";
import LocalRegistry from "~/middleware/services/registry/localRegistry";
import ServiceModel from "~/middleware/services/models/service";
import {
    NotYetImplementedException, IllegalArgumentException, ServiceException, HttpException
}
from "~/error/exceptions";

// Can an optimization just be for nexus to facilitate a direct link over
// localhost?
// TODO implement pluggable/polymorphic validation

/**
 *
 */
export default class APIService extends INexusMiddleware {

    static ID = "api";

    static API_RESPONSE = "com.propelmarketing.nexus.response";

    // Protocols
    static PUBLISH = "publish";
    static SUBSCRIBE = "subscribe";
    static REQUEST = "request";
    static RESPOND = "respond";
    static PUSH = "push";
    static PULL = "pull";

    // Logger instance
    logger = null;

    // Service Datastore field
    _registry = null;

    /**
     * [constructor description]
     * @param  {[type]} id [description]
     * @return {[type]}     [description]
     */
    constructor(id, registry) {
        super(id);
        this.logger = Logger.getLogger(APIService.ID);
        this.registry = registry;
    }

    /**
     * [registry description]
     * @return {[type]} [description]
     */
    get registry() {
        return this._registry;
    }

    /**
     * [registry description]
     * @param  {[type]} registry [description]
     * @return {[type]}          [description]
     */
    set registry(registry) {
        if (!registry) {
            this._registry = new LocalRegistry();
        } else if (!(registry instanceof IRegistry)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "registry", "IRegistry");
        } else {
            this._registry = registry;
        }
    }

    /**
     * [getResultFor description]
     * @param  {[type]} intent [description]
     * @return {[type]}        [description]
     */
    getResultFor(intent) {

        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        // TODO need to do some validation here!
        // TODO Check if method exists - return error if not
        // TODO the adapter needs to be part of the model
        let model = this.registry.get(intent.get("service")),
            adapter = this.registry.getAdapter(model.adapter);

        return new Promise((resolve, reject) => {
            adapter[intent.action](
                intent,
                model,
                this._resolveForIntent(resolve),
                this._rejectForIntent(reject)
            );
        });
    }

    /**************************************************************************
     * BUILDER METHODS
     *************************************************************************/

     /**
      * [adapter description]
      * @param  {[type]} adapterName [description]
      * @param  {[type]} Adapter     [description]
      * @return {[type]}             [description]
      */
     adapter(adapterName, Adapter) {
        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        this.registry.registerAdapter(adapterName, Adapter);
        this.model.adapter = adapterName;
        this.logger.debug("Associated service '" + this.model.name + "' with API Adapter '" + adapterName + "'");
        return this;
     }

    /**
     * [for description]
     * @param  {[type]} actions [description]
     * @return {[type]}         [description]
     */
    for(actions) {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "for");
    }

    /**
     * [on description]
     * @param  {[type]} uri [description]
     * @return {[type]}     [description]
     */
    on(uri) {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "on");
    }

    /**
     * [with description]
     * @param  {[type]} value [description]
     * @return {[type]}         [description]
     */
    with(key, value) {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "with");
    }

    /**************************************************************************
     * REGISTRATION METHODS
     *************************************************************************/

    /**
     * [_registerHelper description]
     * @param  {[type]} name [description]
     * @param  {[type]} attrs  [description]
     * @return {[type]}      [description]
     */
    create(name) {
        /*
         * Return a Anyonomous Object as 'Registration Proxy'
         * This proxy will allow APIs to dynamically register new services
         * as a desired type in a functional, semantic manner
         * i.e for REST Service:
         *     .register(name).for(<method list>).with(<service address>)
         */

        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        let model = new ServiceModel(name);
        return _.extend(this, {
            model: model
        });
    }

    /**
     * [save description]
     * @return {[type]} [description]
     */
    save() {

        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        if (this.model.adapter == null) {
            throw new ServiceException(CODES.ADAPTER_NOT_DEFINED);
        }

        let name = this.model.name;
        this.registry.set(name, this.model);
        this.logger.info("Service '" + name + "'' saved");
        this.emit("services", "service", "up", name, "save");
        return this;
    }

    /**
     * [services description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    services(name) {

        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        if (name == null) {
            return this.registry.all();
        }

        return this.registry.get(name);
    }

    /**
     * [unregister description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    remove(name) {

        if (this.registry == null) {
            throw new ServiceException(CODES.MISSING_REGISTRY);
        }

        let service = this.registry.remove(name);
        this.logger.info("Service '" + name + "'' removed");
        this.emit("services", "service", "down", name, "remove");
        return service;
    }

    /**************************************************************************
     * Protocols
     *************************************************************************/

    /**
     * Called when an registered service wants to publish information to
     * another registered service. To publish, a service must provide:
     * - the target service's name
     * - the channel or target to publish to
     * - the published content
     * The syntax on method signature will be determined by the underlying
     * API implementation, however when making a publish intent, these
     * parameters will be validated.
     * @return {[type]} [description]
     */
    publish() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "publish");
    }

    /**
     * [subscribe description]
     * @return {[type]} [description]
     */
    subscribe() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "subscribe");
    }

    /**
     * [request description]
     * @return {[type]} [description]
     */
    request() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "request");
    }

    /**
     * [respond description]
     * @return {[type]} [description]
     */
    respond() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "respond");
    }

    /**
     * [push description]
     * @return {[type]} [description]
     */
    push() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "push");
    }

    /**
     * [pull description]
     * @return {[type]} [description]
     */
    pull() {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "pull");
    }

    /**************************************************************************
     * PRIVATE METHODS
     *************************************************************************/

    /**
     * [_resolveForIntent description]
     * @param  {[type]} resolve [description]
     * @return {[type]}         [description]
     */
    _resolveForIntent(resolve) {
        return (response) => {
            let intent = new Intent(APIService.API_RESPONSE);
            intent.put("status", response.statusCode);
            intent.put("body", response.body);
            resolve(intent);
        }
    }

    /**
     * [_rejectForIntent description]
     * @param  {[type]} reject [description]
     * @return {[type]}        [description]
     */
    _rejectForIntent(reject) {
        return (error) => {
            reject(new HttpException(error));
        }
    }
}
