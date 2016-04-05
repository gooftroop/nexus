"use strict";

// Allow mutation of node-config config object
process.env.ALLOW_CONFIG_MUTATIONS = true;

// Setup regenerator runtime and core.js polyfill
import polyfill from "babel-polyfill";

// Third-party imports
import _ from "lodash";
import util from "util";
import path from "path";
import polo from "polo";
import morgan from "morgan";
import events from "events";
import config from "config";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// App imports
import Logger from "~/logger";
import Doodad from "~/lib/doodad";
import INexusController from "~/controllers/base";
import {
	resolvePath,
	sendHttpError
}
from "~/utils";
import NexusException, {
	ImproperlyConfiguredException, IllegalStateException
}
from "~/error/exceptions";
import CODES from "~/error/codes";

/**
 * States Enum. Represents the current state of Nexus
 * @type {Object}
 */
const STATES = {
	"IDLE": 0,
	"INITIALIZED": 1,
	"RUNNING": 2,
	"STOPPING": 3,
	"STOPPED": 4,
	"DESTROYING": 5,
	"DESTROYED": 6,
	"ERROR": 7,
	reverse: function(state) {
		let name, value;
		for (name in STATES) {
			value = STATES[name];
			if (state === value) {
				return name;
			}
		}
	}
};

/**
 *
 */
export default class Nexus extends Doodad {
	// TODO don"t forget to set NODE_ENV
	// TODO can node-config do config loading conditional on NODE_ENV?
	// TODO --keep-fnames for ugligy for use with constructor.name
	// TODO figure out how to handle uncaught exceptions! And for returning them to the right caller

	// TODO convert these when the proposed spec for private fields is integrated into Babel
	app = null;

	// Attached Conroller mapping
	controllers = {};

	// Internal State
	_state = STATES.IDLE;

	// Logger
	logger = null;

	// Initialize config
	// Retrieve the "nexus" configuration object
	config = config.get("nexus");

	// TCP Server
	server = null;

	/**
	 * [constructor description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	constructor(options = {}) {

		super();

		// Begin server configuration
		this._configurePaths(options);
		this._configureLogging(options);
		this._configureCleanup();

		// Start the server
		this.init(options);

		// Configure express app
		this._configureStatic(options);
		this._middleware(options);
		this._bind();
	}

	/**
	 * [state description]
	 * @return {[type]} [description]
	 */
	get state() {
		return this._state;
	}

	/**
	 * [setState description]
	 * @param {[type]} value [description]
	 */
	set state(value) {
		this._state = _.isString(value) ? STATES[value] : value;
		this.emit("state", "change", STATES.reverse(this._state));
	}

	/**
	 * [attach description]
	 * @param  {[type]} controller [description]
	 * @return {[type]}            [description]
	 */
	attach(name, Controller) {
		if (this.state > 2) {
			throw new NexusException(CODES.CANNOT_ATTACH_CONTROLLER, STATES.reverse(this.state));
		}

		if (_.has(this._controllers, name)) {
			throw new NexusException(CODES.DUPLICATE_CONTROLLER, name);
		}

		let controller;
		if (!(Controller instanceof INexusController)) {
			controller = new Controller(this.app);
			if (!(controller instanceof INexusController)) {
				throw new IllegalArgumentException(CODES.INVALID_TYPE, "Controller", "INexusController");
			}
		} else {
			controller = Controller;
		}

		this.once("destroy", controller.destroy);
		this.controllers[name] = controller;
		this.logger.info("Attached controller " + name);
		this.emit("controllers", "up", name);
		return this;
	}

	/**
	 * [destroy description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	destroy(callback) {

		if (this.state == STATES.DESTROYING) {
			this.logger.error("Cannot destroy app - app is already beging destroyed");
			return;
		}

		if (this.state == STATES.DESTROYED) {
			this.logger.error("Cannot destroy app - app is already destroyed");
			return;
		}

		super.destroy();

		// TODO close stream when available
		this.stop(() => {
			this.logger.info("Destroying server...");
			this.state = STATES.DESTROYING;
			this._removeEventListeners();
			this.state = STATES.DESTROYED;
			this.logger.info("Server destroyed");
			callback && callback();
			this._destroyLogger();
			Nexus.app = null;
		});
	}

	/**
	 * [get description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	get(name) {
		if (!_.has(this.controllers, name)) {
			throw new IllegalArgumentException(CODES.NOT_FOUND, "controller", name);
		}
		return this.controllers[name];
	}

	/**
	 * [init description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	init(options) {

		if (this.state != STATES.IDLE && this.state != STATES.STATES.DESTROYED) {
			this.logger.error("App is already initialized");
			throw new IllegalStateException(CODES.ILLEGAL_STATE, "IDLE or DESTROYED", STATES.reverse(this.state));
		}

		this.logger.info("initializing server...");

		// Instantiate the express server
		this.app = express();

		// Set configuraiton options. Make them availabel at a top-level
		this.protocol = options.protocol || this.config.get("protocol");
		this.app.set("protocol", this.protocol);
		this.hostname = options.hostname || this.config.get("hostname");
		this.app.set("hostname", this.hostname);
		this.port = options.port || this.config.get("port");
		this.app.set("port", this.port);
		this.address = this.protocol + "://" + this.hostname + ":" + this.port;
		this.app.set("address", this.address);
		this.backlog = options.backlog || this.config.get("backlog");
		this.state = STATES.INITIALIZED;
	}

	/**
	 * [remove description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	remove(name) {
		let controller = this.get(name);
		this.removeListener("destroy", controller);
		delete this.controllers[name];
		this.logger.info("Removed controller " + name);
		this.emit("controllers", "down", name);
		return controller;
	}

	/**
	 * [run description]
	 * @return {[type]} [description]
	 */
	run(callback) {

		if (this.state != STATES.INITIALIZED) {
			this.logger.error("Cannot start app - app is not in a good place mentally or emotionally for this commitment");
			throw new IllegalStateException(CODES.ILLEGAL_STATE, "INITIALIZED", STATES.reverse(this.state));
		}

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

		this.state = STATES.RUNNING;
	}

	/**
	 * [stop description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	stop(callback) {

		if (this.state === STATES.STOPPED || this.state === STATES.STOPPING || !this.server) {
			return;
		}

		this.state = STATES.STOPPING;
		try {
			this.logger.info("Stopping server...");
			this.server.close(() => {
				this.logger.info("Server stopped");
				this.state = STATES.STOPPED;
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
		this.app.get("/describe/:name?", ::this._describeControllers);
	}

	/**
	 * [_configureCleanup description]
	 * @return {[type]} [description]
	 */
	_configureCleanup() {

		// Catches ctrl+c event
		this._boundSigIntHandler = ::this._sigIntHandler;
		process.on("SIGINT", this._boundSigIntHandler);

		// Catches uncaught exceptions
		this._boundUncaughtExceptionHandler = ::this._unhandledExceptionHandler;
		process.on("uncaughtException", this._boundUncaughtExceptionHandler);
	}

	/**
	 * [_configureLogging description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configureLogging() {

		if (this.config.get("logging")) {

			// Configure app-level logging
			this.logger = Logger.getLogger("nexus");

			// Attach mogan (HTTP logging) to the app such
			// that it logs to the app's logger
			this.logger.stream = {
				write: (message, encoding) => {
					this.logger.info(message);
				}
			};
		}
	}

	/**
	 * [_configurePaths description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configurePaths() {
		if (this.config.get("root") == "") {
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
	_configureStatic() {
		if (this.config.get("static")) {
			this.staticRoot = resolvePath(this.config.get("staticRoot"));
			this.app.use(express.static(this.staticRoot));
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
	 * [_describeControllers description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_describeControllers(req, res) {
		// TODO guard against params.name for security
		let controller = req.params.name;
		if (!controller) {
			res.send({
				"controllers": _.keys(this._controllers)
			});
		} else {
			if (!_.has(this._controllers, controller)) {
				sendHttpError(new NexusException(CODES.NOT_FOUND, "controller", controller), res);
			} else {
				res.send(this._controllers[controller].meta());
			}
		}
	}

	/**
	 * [_destroyLogger description]
	 * @return {[type]} [description]
	 */
	_destroyLogger() {
		Logger.destroy();
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
	 * [middleware description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_middleware(options) {

		if (config.proxy) {
			app.enable("trust proxy");
		}

		this.app.use(morgan("combined", {
			"stream": this.logger.stream
		}));

		this.app.use(bodyParser.json());

		// For parsing application/x-www-form-urlencoded
		this.app.use(bodyParser.urlencoded({
			extended: true
		}));

		this.app.use(cookieParser());

		// Configure error-handling middleware
		this.app.use(this._handleError);
	}

	/**
	 * [_sigIntHandler description]
	 * @return {[type]} [description]
	 */
	_sigIntHandler() {
		this.logger && this.logger.info("Captured ctrl-c");
		if (this.state != STATES.DESTROYING && this.state != STATES.DESTROYED) {
			this.destroy();
		}
		process.exit(1);
	}

	/**
	 * [_removeEventListeners description]
	 * @return {[type]} [description]
	 */
	_removeEventListeners() {
		process.removeListener("SIGINT", this._boundSigIntHandler);
		process.removeListener("uncaughtException", this._boundUncaughtExceptionHandler);
	}

	/**
	 * [_unhandledExceptionHandler description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	_unhandledExceptionHandler(e) {
		this.logger && this.logger.error("Unhandled Exception. " + e);
		this.emit("error", "Unhandled Exception", e);
	}
}
