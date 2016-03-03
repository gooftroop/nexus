"use strict";

import _ from "lodash";
import config from "config";
import winston from "winston";
import Syslog from "winston-syslog";

import { resolvePath } from "~/utils";

/**
 *
 */
export default class Logger extends winston.Logger {

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor(options = {}) {
		if (process.env.logger == null) {
			super();
			this.init(options);
			this.configure(this._loggers);
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
		this.config = config.get("logging");

		// For now we hold onto the handlers and loggers, just in case we
		// want to expand Logger's API
		this.root = resolvePath(this.config.get("root"));

		this._handlers = this._resolveHandlers(this.config.get("handlers"), options);
		this._loggers = this._resolveLoggers(this.config.get("loggers"), options);
	}

	// TODO this can be done better
	/**
	 * [_resolveHandlers description]
	 * @param  {[type]} handlers [description]
	 * @return {[type]}          [description]
	 */
	_resolveHandlers(handlers, options) {

		let handler,
			params,
			filename,
			_buildParams,
			_handlers = {};

		for (handler in handlers) {
			params = handlers[handler];
			_buildParams = _.extend({}, params);
			if (_.has(params, "filename")) {
				_buildParams.filename = resolvePath(_buildParams.filename, this.root);
			}
			_handlers[handler] = _buildParams;
		}
		return _handlers;
	}

	/**
	 * [_resolveLoggers description]
	 * @param  {[type]} loggers [description]
	 * @return {[type]}         [description]
	 */
	_resolveLoggers(loggers, options) {
		let i, parts, _mod, logger, params, handler, transport,
			_loggers = _.extend({
				"transports": []
			}, options),
			transports = _loggers.transports;

		for (logger in loggers) {

			params = loggers[logger];
			handler = this._handlers[params.handler];
			parts = handler["transport"].split(".");

			// Comment dynamic loading
			_mod = require(parts.shift());
			for (i in parts) {
				_mod = _mod[parts[i]];
			}

			transport = new(_mod)(
				_.extend(
					_.omit(params, "handler"),
					_.omit(handler, "transport")
				)
			);
			_loggers.transports.push(transport);
		}
		return _loggers;
	}
}
