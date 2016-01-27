"use strict";

import _ from "lodash";
import config from "config";
import winston from "winston";
import Syslog from "winston-syslog";

/**
 *
 */
export default class Logger extends winston.Logger {

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor(options) {
		if (process.env.logger == null) {
			this.init(options);
			process.env.logger = super(this.configuredLoggers);
		}
		return process.env.logger;
	}

	/**
	 * [init description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	init(options) {

		// Retrieve the "logging" configuration object
		this._config = config.get("logging");
		this.configuredLoggers = _.extend({ "transports": [] }, options);

		// For now we hold onto the handlers and loggers, just in case we
		// want to expand Logger's API
		this._resolveHandlers((this.handlers = this._config.get("handlers")));
		this._resolveLoggers((this.loggers = this._config.get("loggers")));
	}

	// TODO this can be done better
	/**
	 * [_resolveHandlers description]
	 * @param  {[type]} handlers [description]
	 * @return {[type]}          [description]
	 */
	_resolveHandlers(handlers) {

		let handler,
			params,
			filename;

		for (handler in handlers) {

			params = handlers[handler];

			if (_.has(params, "filename")) {
				filename = params.filename;
				// If the filename does not begin with './' or '/', then the
				// filename is intended to be the absolute path from the app
				// root ('__dirname'). Update filename to be the absolute path
				if (!filename.match(/^\.?\/.*$/i)) {
					params.filename = [__dirname, filename].join("/");
				}
			}
		}
	}

	/**
	 * [_resolveLoggers description]
	 * @param  {[type]} loggers [description]
	 * @return {[type]}         [description]
	 */
	_resolveLoggers(loggers) {
		let logger,
			params,
			handler,
			transports = this.configuredLoggers.transports;

		for (logger in loggers) {

			params = this.loggers[logger];
			handler = this.handlers[params.handler];

			// TODO resolve filename
			transports.push(
				new handler.transport(
					_.extend(
						_.omit(params, "handler"),
						_.omit(handler, "transport")
					)
				)
			);
		}
	}
}