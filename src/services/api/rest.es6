"use strict";

// THIRD_PARTY IMPORTS
import _ from "lodash";
import express from "express";
import validator from "validator";

// NEXUS IMPORTS
import Intent from "~/lib/intent";
import CODES from "~/error/codes";
import APIService from "~/services/api/api";
import {
    ServiceException
}
from "~/error/exceptions";
import HttpAdapter from "~/services/adapters/httpAdapter";
import { DEFAULT_METHOD } from "~/services/adapters/httpAdapter";
import {
    sendHttpError
}
from "~/utils";

/**
 * Proxy request syntax:
 *
 * https://<hostname|nexus.io>:<port|>/services/<:service_name>[/|/<Service Absolute API Path>]
 */
export default class RESTService extends APIService {

    // Sub-app TCP router
    router = new express.Router();

    /**
     * [constructor description]
     * @param  {[type]} app [description]
     * @return {[type]}     [description]
     */
    constructor(app) {
        super("REST");
        this.bind(app);
    }

    /**
     * [bind description]
     * @return {[type]} [description]
     */
    bind(app) {

        // Bind routes
        this.router.get("/info/:name?", ::this.services);
        this.router.post("/register/:name", ::this.register);
        this.router.post("/unregister/:name", ::this.unregister);

        // TODO action yields two capture groups for the following urls - fix this
        this.router.get("/:name/:action(*)", ::this.request);
        this.router.post("/:name/:action(*)", ::this.publish);
        this.router.put("/:name/:action(*)", ::this.push);
        this.router.delete("/:name/:action(*)", ::this.publish);

        // Configure error-handling middleware
        this.router.use(this._handleError);

        // Mount router to the central app under '/rest'
        // For now we reach up to find the app in the controller. This actaully really sucks, so we should
        // probably find a cleaner way to do this.
        app.use("/rest", this.router);
    }

    /**************************************************************************
     * BUILDER METHODS
     *************************************************************************/

    /**
     * [for description]
     * @param  {[type]} actions [description]
     * @return {[type]}         [description]
     */
    for (actions) {
        // A Service should contain an api - that is, a definition of what
        // is available over the adapter's protocol and what is not (by
        // omission). We need a way to check to see if the current destination
        // specified in the intent is valid or not. If not, return an error.
        this.model.set("actions", this._forHelper(actions));
        return this;
    }

    /**
     * [on description]
     * @param  {[type]} uri [description]
     * @return {[type]}     [description]
     */
    on(uri) {
        if (!validator.isURL(uri, {
                require_protocol: true
            }) && !validator.isIP(uri)) {
            throw new ServiceException(CODES.INVALID_URI, uri);
        }
        this.model.set("uri", uri);
        return this;
    }

    /**************************************************************************
     * BINDING METHODS
     *************************************************************************/

    /**
     * [register description]
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    register(req, res, next) {
        // TODO validate params.name
        // TODO aync event, return response

        if (!_.has(req.params, "name")) {
            throw new ServiceException(CODES.MISSING_REQUEST_PARAMETER, "name");
        }

        if (!_.has(req.body, "uri")) {
            throw new ServiceException(CODES.MISSING_BODY_PARAMETER, "uri");
        }

        let name = req.params.name,
            actions = req.body.for,
            // Since it's highly impractical to discover the uri of the client,
            // for now we'll force them to provide the service uri
            uri = req.body.uri;

        try {
            this.create(name)
                .adapter("HttpAdapter", HttpAdapter)
                .for(actions)
                .on(uri)
                .save();
        } catch (e) {
            return next(e);
        }

        res.send({
            message: "Service '" + name + "' registered"
        });
    }

    /**
     * [request description]
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    async request(req, res, next) {

        try {
            // TODO does this block?
            let intent = await this._protocolHelper(this.REQUEST, req);
            res.status(intent.get("status")).send(intent.get("body"));
        } catch (e) {
            return next(e);
        }
    }

    /**
     * [services description]
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    services(req, res, next) {
        try {
            let service = super.services(req.params.name);
            // TODO aync event, return response
            res.send(service);
        } catch (e) {
            return next(e);
        }
    }

    /**
     * [publish description]
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async publish(req, res, next) {
        try {
            // TODO does this block?
            let intent = await this._protocolHelper(this.PUBLISH, req);
            res.status(intent.get("status")).send(intent.get("body"));
        } catch (e) {
            return next(e);
        }
    }

    /**
     * [push description]
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async push(req, res, next) {
        try {
            // TODO does this block?
            let intent = await this._protocolHelper(this.PUSH, req);
            res.status(intent.get("status")).send(intent.get("body"));
        } catch (e) {
            return next(e);
        }
    }

    /**
     * [unregister description]
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    unregister(req, res, next) {
        // remove from register
        if (!_.has(req.params, "name")) {
            throw new ServiceException(CODES.MISSING_REQUEST_PARAMETER, "name");
        }

        try {
            let name = req.params.name;
            // TODO aync event, return response
            this.remove(name);
            res.send({
                message: "Service '" + name + "' unregistered"
            });
        } catch (err) {
            return next(e);
        }
    }

    /**************************************************************************
     * PRIVATE METHODS
     *************************************************************************/

    /**
     * [_forHelper description]
     * @param  {[type]} actions [description]
     * @return {[type]}         [description]
     */
    _forHelper(actions, ) {
        if (_.isArray(actions)) {
            // TODO build compiled object better
            let i, action, compiled = {};
            for (i in actions) {
                action = actions[i];
                if (_.isArray(action)) {
                    compiled = compiled.concat(this._forHelper(action));
                } else {
                    compiled.push(this._forHelper(action));
                }
            }
            return compiled;
        } else if (_.isObject(actions)) {
            // TODO this is not correct validation
            if (!_.has(actions, "action") && !_.has(actions, "method")) {
                throw new new ServiceException(CODES.IMPROPERLY_CONFGIURED_HTTP_ACTION);
            }
            return actions;
        } else if (_.isString(actions)) {
            // TODO instantiate on one line
            let ret = {};
            ret[actions] = HttpAdapter.DEFAULT_METHOD;
            return ret;
        } else if (actions === undefined) {
            // If actions is undefined, then allow full path pass-through
            return {};
        } else {
            throw new ServiceException(CODES.ILLEGAL_ACTION, actions);
        }
    }

    /**
     * [_handleError description]
     * @param  {[type]}   err  [description]
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    _handleError(err, req, res, next) {
        sendHttpError(err, res);
    }

    /**
     * [_protocolHelper description]
     * @param  {[type]} protocolAction [description]
     * @param  {[type]} req            [description]
     * @return {[type]}                [description]
     */
    _protocolHelper(protocolAction, req) {

        if (!_.has(req.params, "name")) {
            throw new ServiceException(CODES.MISSING_REQUEST_PARAMETER, "name");
        }

        let service = req.params.name,
            action = _.has(req.params, "action") ? req.params.action : "",
            intent = new Intent(protocolAction);

        intent.put("service", service);
        intent.put("method", req.method);
        intent.put("action", action);

        return this.getResultFor(intent);
    }
}
