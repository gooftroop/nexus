"use strict";

// Allow mutation of node-config config object
process.env.ALLOW_CONFIG_MUTATIONS = true;

// Setup regenerator runtime and core.js polyfill
import polyfill from "babel-polyfill";

// Third-party imports
import _ from "lodash";
import path from "path";
import config from "config";

// App imports
import Logger from "~/logger";
import Doodad from "~/lib/doodad";
import CODES from "~/error/codes";
import NexusException, { IllegalArgumentException } from "~/error/exceptions";

/**
 *
 */
export default class Nexus extends Doodad {
	// TODO don"t forget to set NODE_ENV
	// TODO can node-config do config loading conditional on NODE_ENV?
	// TODO --keep-fnames for ugligy for use with constructor.name?
	// TODO figure out how to handle uncaught exceptions! And for returning them to the right caller
	// TODO convert private vars when the proposed spec for private fields is integrated into Babel

	// Attached Conroller mapping
	_middleware = {};

	// Logger
	logger = null;

	/**
	 * [constructor description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	constructor(options = {}) {

		super();

		// Begin server configuration
		this._configureRoot();
		this._configureCleanup();

		// TODO this call will instantiate the loogger for the first time -
		// which means that it the logger will attempt to resolve the log paths
		// and try to consume 'root' from the config, which might no be correct
		// until after the call to 'configureRoot'.
		// Try to remove this flow dependency. Either root MUST be defined,
		// the looger tries to optimistically solve the missing root problem,
		// paths are resolved dynamically, ...or any other better ideas.
		this.logger = Logger.getLogger("nexus");
		// this.channel = postal.channel("nexus");

		// this.channel.subscribe("controllers", (data, envelope) => {
		// 	let type = data.type;
		// 	try {
		// 		switch (type) {
		// 			case "get":
		// 				envelope.reply(null, {
		// 					controller: this.inspect(data.name)
		// 				});
		// 				break;
		// 			case "set":
		// 				this.use(data.name, data.controller);
		// 				break;
		// 			case "delete":
		// 				this.remove(data.name);
		// 				break;
		// 			default:
		// 				envelope.reply({
		// 					msg: "No such request type for controllers exists: " + type + "'"
		// 				});
		// 				break;
		// 		}
		// 	} catch (e) {
		// 		envelope.reply(e);
		// 	}
		// });
	}

	/**
	 * [destroy description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	destroy() {
		super.destroy();
		this._removeEventListeners();
		Logger.destroy();
	}

	/**
	 * [inspect description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	inspect(name) {
		if (name == null || name === "all") {
			return _.keys(this._middleware);
		}

		if (!_.has(this._middleware, name)) {
			throw new IllegalArgumentException(CODES.NOT_FOUND, "middleware", name);
		}

		return this._middleware[name];
	}

	/**
	 * [remove description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	remove(name) {
		if (name == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARMAETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
		}

		if (name === "all") {
			let i, keys = _.keys(this._middleware);
			for (i in keys) {
				this._removeSingle(keys[i]);
			}
		} else {
			return this._removeSingle(name);
		}
	}

	/**
	 * [use description]
	 * @param  {[type]} middleware [description]
	 * @return {[type]}            [description]
	 */
	use(name, middleware) {

		if (!name) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARMAETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "String");
		}

		if (!middleware || typeof(middleware) === "function") {
			throw new IllegalArgumentException(CODES.INVALID_MIDDLEWARE, name);
		}

		if (_.has(this._middleware, name)) {
			throw new NexusException(CODES.DUPLICATE_MIDDLEWARE, name);
		}

		if (_.has(middleware, "destroy") && typeof(middleware.destroy) === "function") {
			this.once("destroy", middleware.destroy);
		}

		this._middleware[name] = middleware;
		this.logger.info("Attached middleware '" + name + "'");
		this.emit("middelware", "attached", name);
		return this;
	}

	/**************************************************************************
	 * Private Methods
	 *************************************************************************/

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
	 * [_configureRoot description]
	 * @return {[type]}         [description]
	 */
	_configureRoot() {
		if (!_.has(config, "root") || config.get("root") == "") {
			config.root = this.root = path.dirname(__dirname);
		}
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
	 * [_removeSingle description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	_removeSingle(name) {
		// Use inspect's validation
		let middleware = this.inspect(name);
		if (_.has(middleware, "destroy") && typeof(middleware.destroy) === "function") {
			this.removeListener("destroy", middleware.destroy);
		}

		delete this._middleware[name];
		this.logger.info("Removed middleware '" + name + "'");
		this.emit("middleware", "removed", name);
		return middleware;
	}

	/**
	 * [_unhandledExceptionHandler description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	_unhandledExceptionHandler(e) {
		this.logger && this.logger.error("Unhandled Exception. " + e);
		this.emit("exception", "Unhandled Exception", e);
	}
}
