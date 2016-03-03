"use strict";

process.env.ALLOW_CONFIG_MUTATIONS = true;

import _ from "lodash";
import path from "path";
import config from "config";
import express from "express";
import morgan from "morgan";
import polo from "polo";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import Logger from "~/logger";
import ServicesController from "~/controllers/services";
import {
	resolvePath
}
from "~/utils";
import {
	NexusException, ImproperlyConfiguredException
}
from "~/error/exceptions";
import codes from "~/error/codes";

/**
 *
 */
export default class Nexus {
	// TODO don"t forget to set NODE_ENV
	// TODO is it possible to do sub routing in express?
	// TODO can node-config do config loading conditional on NODE_ENV?

	/**
	 * [constructor description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	constructor(options = {}) {

		// Instantiate the express server
		this.app = express();

		// Initialize config
		// Retrieve the "root" configuration object
		this.config = config;

		this._controllers = {};

		// Begin server configuration
		this._configure(options);
		this._middleware(options);
		this._bind();

		this.attach("services", ServicesController);
	}

	/**
	 * [attach description]
	 * @param  {[type]} controller [description]
	 * @return {[type]}            [description]
	 */
	attach(name, Controller) {
		this._controllers[name] = new Controller(this.app);
	}

	/**
	 * [run description]
	 * @return {[type]} [description]
	 */
	run(callback) {
		this.server = this._createTCPServer(callback);
		this.stream = this._createWebsocketServer();
	}

	/**
	 * [stop description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	stop(callback) {
		try {
			this.server && this.server.close(callback);
		} catch(e) {
			console.log(e);
			this.logger.error(e);
		}
	}

	/**
	 * [_bind description]
	 * @return {[type]} [description]
	 */
	_bind() {
		this.app.get("/describe/:name?", _.bind(this._describeControllers, this));

		// Configure error-handling middleware
		this.app.use(this._handleError);
	}

	/**
	 * [configure description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configure(options) {

		let loggingEnabled = _.has(options, "logging") ? options.logging : this.config.get("logging"),
			staticEnabled = _.has(options, "static") ? options.static : this.config.get("static");

		this._configurePaths(options);

		loggingEnabled && this._configureLogging(options);
		staticEnabled && this._configureStatic(options);

		this.protocol = options.protocol || this.config.get("protocol");
		this.hostname = options.hostname || this.config.get("hostname");
		this.port = options.port || this.config.get("port");
		this.address = this.protocol + "://" + this.hostname + ":" + this.port;
		this.backlog = options.backlog || this.config.get("backlog");
	}

	/**
	 * [_configureLogging description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configureLogging(options) {

		// Configure app-level logging
		this.logger = new Logger(options.logging);

		// Attach mogan (HTTP logging) to the app such
		// that it logs to the app's logger
		this.logger.stream = {
			write: (message, encoding) => {
				this.logger.info(message);
			}
		};

		this.app.use(morgan("combined", {
			"stream": this.logger.stream
		}));
	}

	/**
	 * [_configurePaths description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configurePaths(options) {
		if (!this.config.has("root") || this.config.get("root") == "") {
			config.root = this.root = path.dirname(__dirname);
		} else {
			config.root = this.root = this.config.get("root");
		}
	}

	/**
	 * [_configureStatic description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configureStatic(options) {
		this.staticRoot = resolvePath(options.staticRoot || this.config.get("staticRoot"));
		this.app.use(express.static(this.staticRoot));
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
				this.backlog,
				callback || this._defaultListenCallback);
		} else if (this.protocol == "https") { // TODO make constant
			let https = require("https");
			return https.createServer(this.config.get("ssl"), this.app).listen(
				this.port,
				this.hostname,
				this.backlog,
				callback || this._defaultListenCallback);
		} else {
			throw new ImproperlyConfiguredException(codes.UNEXPECTED_VALUE, "protocol", "[http, https]", this.protocol);
		}
	}

	_createWebsocketServer() {

	}

	/**
	 * [_defaultListenCallback description]
	 * @return {[type]} [description]
	 */
	_defaultListenCallback() {
		this.logger.info("Server " + this.app.get("hostname") + " listening on " + this.app.get("port"))
	}

	/**
	 * [_describeControllers description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_describeControllers(req, res) {
		let controller = req.params.name;
		if (!controller) {
			res.send({
				"controllers": _.keys(this._controllers)
			});
		} else {
			if (!_.has(this._controllers, controller)) {
				throw new NexusException(codes.RESOURCE_NOT_FOUND, "controller", controller);
			}
			res.send(this._controllers[controller].meta());
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
		let msg = {
			message: err.message
		};

		if (_.has(err, "code")) {
			msg.code = err.code;
		}
		res.status(err.status).send(msg);
	}

	/**
	 * [middleware description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_middleware(options) {

		this.app.use(bodyParser.json());

		// For parsing application/x-www-form-urlencoded
		this.app.use(bodyParser.urlencoded({
			extended: true
		}));

		this.app.use(cookieParser());
	}
}
