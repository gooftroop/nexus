"use strict";

import config from "config";
import express from "express";
import morgan from "morgan";
import polo from "polo";
import consign from "consign";
import bodyParser from "body-parser";
import Logger from "app/server/logger.js";

/**
 *
 */
export default class Nexus {
	// TODO don"t forget to set NODE_ENV

	/**
	 * [constructor description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	constructor(options={}) {

		// Instantiate the express server
		this.app = process.env.app = express();

		// Retrieve the "server" configuration object
		this._config = config.get("server");

		// Begin server configuration
		this.configure(options);
		this.middleware(options);
	}

	/**
	 * [configure description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	configure(options) {

		let loggingEnabled = _.has(options, "logging") ? options.logging || this._config.get("logging"),
			staticEnabled = _.has(options, "static") ? options.static || this._config.get("static");

		loggingEnabled && this._configureLogging(options);
		staticEnabled && this._configureStatic(options);

		// TODO This might have to go....
		// IF so, just need to figure out a generic way to load files
		consign({
			cwd: __dirname + "/app",
			logger: this.logger
		})
		.include("app/services/controllers")
		.then("app/server/controllers")
		.into(this.app);
		console.log(this.app);
	}

	middleware(options) {

		this.app.use(bodyParser.json());

		// for parsing application/x-www-form-urlencoded
		this.app.use(bodyParser.urlencoded({
			extended: true
		}));
	}

	/**
	 * [run description]
	 * @return {[type]} [description]
	 */
	run(options={}) {
		this.app.listen(
			options.port || this.config.get("port"),
			options.hostname || this.config.get("hostname"),
			options.backlog || this.config.get("backlog"),
			options.listenCallback || this._defaultListenCallback
		);
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
	 * [_configureStatic description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	_configureStatic(options) {

		let staticRoot = options.staticRoot || this.config.get("staticRoot");
		if (!staticRoot.match(/^\.?\/.*$/i)) {
			staticRoot = [__dirname, staticRoot].join("/");
		}

		this.app.use(express.static(staticRoot));
	}

	_defaultListenCallback() {
		this.logger.info("Server " + this.app.get("hostname") + " listening on " + this.app.get("port"))
	}
}