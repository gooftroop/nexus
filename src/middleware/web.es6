"use strict";

import config from "config";
import morgan from "morgan";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import Logger from "~/logger";
import INexusMiddleware from "~/middleware/base";
import {
    resolvePath,
    sendHttpError
}
from "~/utils";
import {
    ImproperlyConfiguredException
}
from "~/error/exceptions";
import CODES from "~/error/codes";

export const ID = "www";

/**
 *
 */
export default class WebServer extends INexusMiddleware {

    app = null;

    logger = Logger.getLogger(ID);

    // TCP Server
    server = null;

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(app) {
        super(ID);

        // Configure express app
        this._init(app);
        this._bind();
    }

    /**
     * [destroy description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    destroy(callback) {
        // TODO close stream when available
        this.stop((callback) => {
            this.logger.info("Server destroyed");
        });
        super.destroy();
    }

    /**
     * [run description]
     * @return {[type]} [description]
     */
    run(callback) {

        this.logger.info("Starting server...");
        try {
            this.server = this._createTCPServer(callback);
        } catch (e) {
            this.logger.error("Failed to start TCP server!");
            sendHttpError(e);
            process.exit(-1);
        }

        try {
            this.stream = this._createWebsocketServer();
        } catch (e) {
            this.logger.error("Failed to start Websockets server!");
            sendHttpError(e);
            process.exit(-1);
        }

        this.emit("server", "started");
    }

    /**
     * [stop description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    stop(callback) {

        try {
            this.logger.info("Stopping server...");
            this.server.close(() => {
                this.logger.info("Server stopped");
                this.emit("server", "stopped");
                callback && callback();
            });
        } catch (e) {
            this.logger.error(e);
            this.server = null;
            throw e;
        }
    }

    /**
     * Proxy Express's use to allow for top-level middleware definition
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    use(...args) {
        this.app.use(...args);
        return this;
    }

    /**************************************************************************
     * Private Methods
     *************************************************************************/

    /**
     * [_bind description]
     * @return {[type]} [description]
     */
    _bind() {
        let router = new express.Router();

        router.get("/inspect/:name?", ::this._inspectControllers);

        this._configureStatic(router);
        this._middleware(router);

        this.app.use("/api", router);
    }

    /**
     * [_configureStatic description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _configureStatic(router) {
        if (this.config.get("static")) {
            let staticRoot = resolvePath(this.config.get("staticRoot"));
            router.use(express.static(staticRoot));
        }
    }

    /**
     * [_createTCPServer description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    _createTCPServer(callback) {
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
            let https = require("https");
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

    /**
     * [_createWebsocketServer description]
     * @return {[type]} [description]
     */
    _createWebsocketServer() {

    }

    /**
     * [_defaultListenCallback description]
     * @return {[type]} [description]
     */
    _defaultListenCallback(callback) {
        this.logger.info("Server " + this.hostname + " listening on " + this.port);
        callback && callback();
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
        this.emit("error", "HTTP Exception", err);
        sendHttpError(err, res);
    }

    /**
     * [_init description]
     * @return {[type]} [description]
     */
    _init(app) {

        if (!app) {
            this.app = express();

            // Set configuraiton options. Make them availabel at a top-level
            this.protocol = this.config.get("protocol");
            this.app.set("protocol", this.protocol);
            this.hostname = this.config.get("hostname");
            this.app.set("hostname", this.hostname);
            this.port = this.config.get("port");
            this.app.set("port", this.port);
            this.address = this.protocol + "://" + this.hostname + ":" + this.port;
            this.app.set("address", this.address);

            if (config.proxy) {
                this.app.enable("trust proxy");
            }

        } else {
            this.app = app;
        }
    }

    /**
     * [_inspectControllers description]
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    _inspectControllers(req, res) {
        // TODO guard against params.name for security
        let controller = req.params.name;
        postal.channel("nexus").request({
            topic: "controllers",
            name: controller
        }).then(
            function(data) {
                res.send(data.controller);
            },
            function(err) {
                sendHttpError(new NexusException(CODES.NOT_FOUND, "controller", controller), res);
            }
        );
    }

    /**
     * [middleware description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _middleware(router) {

        this.logger.stream = {
            write: (message, encoding) => {
                this.logger.info(message);
            }
        };

        router.use(morgan("combined", {
            "stream": this.logger.stream
        }));

        router.use(bodyParser.json());

        // For parsing application/x-www-form-urlencoded
        router.use(bodyParser.urlencoded({
            extended: true
        }));

        router.use(cookieParser());

        // Configure error-handling middleware
        router.use(this._handleError);
    }
}
