"use strict";

// THIRD_PARTY IMPORTS
import _ from "lodash";
import morgan from "morgan";
import express from "express";
import validator from "validator";
import bodyParser from "body-parser";

// NEXUS IMPORTS
import Intent from "~/lib/intent";
import CODES from "~/error/codes";
import APIService from "~/middleware/services/api/api";
import RestAdapter from "~/middleware/services/adapters/restAdapter";
import {
    ServiceException
}
from "~/error/exceptions";
import {
    DEFAULT_METHOD
}
from "~/middleware/services/adapters/restAdapter";
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

    static ID = "rest";

    // Sub-app TCP router
    app = null;

    /**
     * [constructor description]
     * @param  {[type]} app [description]
     * @return {[type]}     [description]
     */
    constructor(registry, app = null) {
        super(RESTService.ID, registry);
        this._bind(app);
    }

    /**
     * [run description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    run(callback) {

        this.logger.info("Starting service...");
        if (this.protocol == "http") { // TODO make constant
            let http = require("http");
            return http.createServer(this.app).listen(
                this.port,
                this.hostname,
                this.backlog, () => {
                    this._defaultListenCallback(callback);
                });
            this.logger.info("Created HTTP server with " + this.hostname + ", " + this.port + ", " + this.backlog);
        } else if (this.protocol == "https") { // TODO make constant
            let https = require("https"),
                config = this.config.rest,
                ssl = _.has(config, "ssl") ? config.get("ssl") : this.config.defaults.get("ssl");
            return https.createServer(this.config.get("ssl"), this.app).listen(
                this.port,
                this.hostname,
                this.backlog, () => {
                    this._defaultListenCallback(callback);
                });
            this.logger.info("Created HTTPS server with " + this.hostname + ", " + this.port + ", " + this.backlog);
            this.logger.debug("::With SSL configuration: " + JSON.stringify(this.config.get("ssl")));
        } else {
            throw new ImproperlyConfiguredException(CODES.UNEXPECTED_VALUE, "protocol", "[http, https]", this.protocol);
        }
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

    /**
     * [with description]
     * @param  {[type]} value [description]
     * @return {[type]}         [description]
     */
    with(key, value) {
        this.model.set(key, value);
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
            options = req.body.options || {},
            // Since it's highly impractical to discover the uri of the client,
            // for now we'll force them to provide the service uri
            uri = req.body.uri;

        try {
            this.create(name)
                .adapter("RestAdapter", RestAdapter)
                .for(actions)
                .with("options", options)
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
            let intent = await this._protocolHelper(APIService.REQUEST, req);
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
            let intent = await this._protocolHelper(APIService.PUBLISH, req);
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
            let intent = await this._protocolHelper(APIService.PUSH, req);
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

    /**
     * [use description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    use(...args) {
        this.app.use(...args);
        return this;
    }

    /**************************************************************************
     * PRIVATE METHODS
     *************************************************************************/

    /**
     * [_bind description]
     * @return {[type]} [description]
     */
    _bind(app) {

        let router = new express.Router(),
            jsonParser = bodyParser.json();

        // Bind routes
        router.get("/info/:name?", ::this.services);
        router.post("/register/:name", jsonParser, ::this.register);
        router.post("/unregister/:name", jsonParser, ::this.unregister);

        // TODO action yields two capture groups for the following urls - fix this
        router.get("/:name/:action(*)", ::this.request);
        router.post("/:name/:action(*)", jsonParser, ::this.publish);
        router.put("/:name/:action(*)", jsonParser, ::this.push);
        router.delete("/:name/:action(*)", ::this.request);

        // Mount router to the central app under '/rest'
        if (!app) {
            let config = this.config[this.id] || this.config.middleware;
            this.app = express();
            this.protocol = _.has(config, "protocol") ? config.get("protocol") : this.config.defaults.get("protocol");
            this.app.set("protocol", this.address);

            this.hostname = _.has(config, "hostname") ? config.get("hostname") : this.config.defaults.get("hostname");
            this.app.set("hostname", this.address);

            this.port = _.has(config, "port") ? config.get("port") : this.config.defaults.get("port");
            this.app.set("port", this.address);

            this.backlog = _.has(config, "backlog") ? config.get("backlog") : this.config.defaults.get("backlog");
            this.app.set("backlog", this.address);

            this.address = this.protocol + "://" + this.hostname + ":" + this.port;
            this.app.set("address", this.address);

            this._middleware(router);
        } else {
            this.app = app;
        }

        this.app.use("/rest", router);
    }

    /**
     * [_defaultListenCallback description]
     * @return {[type]} [description]
     */
    _defaultListenCallback(callback) {
        this.logger.info("Service " + this.id + " at " + this.hostname + " listening on " + this.port);
        callback && callback();
    }

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
            ret[actions] = DEFAULT_METHOD;
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
     * [middleware description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _middleware(router) {

        router.use(morgan("combined", {
            "stream": {
                write: (message, encoding) => {
                    this.logger.info(message);
                }
            }
        }));

        // Configure error-handling middleware
        router.use(this._handleError);
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
        intent.put("body", req.body);

        return this.getResultFor(intent);
    }
}
