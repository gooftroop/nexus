"use strict";

// Third-party Imports
import _ from "lodash";

// Nexus Imports
import Logger from "~/logger";
import Doodad from "~/lib/doodad";
import CODES from "~/error/codes";
import Intent from "~/lib/intent";
import INexusController from "~/controllers/base";
import IAdapter from "~/services/adapters/adapter";
import IRegistry from "~/services/registry/registry";
import ServiceModel from "~/services/models/service";
import {
    NotYetImplementedException, IllegalArgumentException, ServiceException, HttpException
}
from "~/error/exceptions";

// Can an optimization just be for nexus to facilitate a direct link over
// localhost?
// TODO implement pluggable/polymorphic validation

export const API_RESPONSE = "com.propelmarketing.nexus.response";

/**
 *
 */
export default class APIService extends Doodad {

    // Protocols
    PUBLISH = "publish";
    SUBSCRIBE = "subscribe";
    REQUEST = "request";
    RESPOND = "respond";
    PUSH = "push";
    PULL = "pull";

    // The API's name
    name = null;

    // Logger instance
    logger = null;

    // Service Datastore field
    registry = null;

    /**
     * [constructor description]
     * @param  {[type]} app [description]
     * @return {[type]}     [description]
     */
    constructor(name) {

        super();

        if (name == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
        }

        if (!_.isString(name)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
        }

        this.name = name;
        this.logger = Logger.getLogger("api");
    }

    /**
     * [getResultFor description]
     * @param  {[type]} intent [description]
     * @return {[type]}        [description]
     */
    getResultFor(intent) {
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

    /**
     * [setRegistry description]
     * @param {[type]} registry [description]
     */
    setRegistry(registry) {
        if (registry == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "registry");
        }

        if (!(registry instanceof IRegistry)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "registry", "IRegistry");
        }

        this.registry = registry;

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
        console.log(this.model);
        this.model.adapter = adapterName;
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

        this.registry.set(this.model.name, this.model);
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

        let serviceAdapter = this.registry.remove(name);
        this.removeListener("destroy", serviceAdapter.destroy);
        serviceAdapter.destroy();
        return serviceAdapter;
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
            let intent = new Intent(API_RESPONSE);
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
