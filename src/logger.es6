"use strict";

import fs from "fs";
import _ from "lodash";
import util from "util";
import events from "events";
import mkdirp from "mkdirp";
import config from "config";
import winston from "winston";
import Syslog from "winston-syslog";
import {
	ImproperlyConfiguredException
}
from "~/error/exceptions";
import CODES from "~/error/codes";

import {
	resolvePath
}
from "~/utils";

var instance = null;
const DEFAULT_ERROR_TRANSPORT_CONFIG = {
	"humanReadableUnhandledException": true,
	"json": false,
	"colorize": true
};

/**
 *
 */
export default class Logger extends winston.Logger {

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor(options = {}) {
		super();
		this.init(options);
		this.configure(options);
		return (instance = this);
	}

	/**
	 * Get the current logger, if a logger has been created; otherwise create
	 * a new logger and return it.
	 * @param {[type]} name   [description]
	 * @return {[type]} [description]
	 */
	static getLogger(name = null) {
		if (instance == null) {
			new Logger();
		}
		return (name == null) ? instance : instance.get(name);
	}

	/**
	 * [destroy description]
	 * @return {[type]} [description]
	 */
	static destroy() {
		if (instance != null) {
			instance.close();
			instance = null;
		}
	}

	/**
	 * [add description]
	 * @param {[type]} name   [description]
	 * @param {[type]} config [description]
	 */
	add(name, config) {
		return this.loggers.add(name, config);
	}

	/**
	 * [get description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	get(name) {
		return this.loggers.get(name);
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
		this.level = this.config.get("level");

		this.handlers = this._resolveTransports(this.config.get("transports"), options);
		this.loggers = this._resolveLoggers(this.config.get("loggers"), this.handlers, options);
	}

	// TODO this can be done better
	/**
	 * [_resolveHandlers description]
	 * @param  {[type]} transports [description]
	 * @return {[type]}          [description]
	 */
	_resolveTransports(transports, options) {

		let i, handler,
			params,
			parts,
			module,
			handlers = {};

		for (handler in transports) {

			params = _.extend({}, transports[handler]); // handler dict is immutable - clone params
			if (_.has(params, "filename")) {
				params.filename = this._resolvePath(params.filename);
			}

			if (!_.has(params, "name")) {
				params["name"] = handler;
			}

			parts = params["transport"].split(".");
			delete params["transport"];

			// Comment dynamic loading
			module = require(parts.shift());
			for (i in parts) {
				module = module[parts[i]];
			}

			handlers[handler] = new(module)(params)
		}

		return handlers;
	}

	/**
	 * [_resolveLoggers description]
	 * @param  {[type]} loggers [description]
	 * @return {[type]}         [description]
	 */
	_resolveLoggers(loggers, handlers, options) {
		let logger,
			transports,
			container = new winston.Container();

		// Look for root or "" in loggers - this is the default logger settings.
		// If there are not settings, assume default settings (define them here)
		// For every other loggers, add to container to return as this.loggers
		// Look through handlers to find handlers being used by the current logger
		// if default logger, then add to this.transports. Otherwise, add to container.

		if (_.has(loggers, "") && _.has(loggers, "root")) {
			throw new ImproperlyConfiguredException(
				CODES.ILLEGAL_ARGUMENT,
				"root logger",
				"Cannot define both 'root' and '\"\"' as root logger");
		}

		if (_.has(loggers, "")) {
			options.transports = this._filterTransportsForLogger("", loggers[""], handlers);
			delete loggers[""];
		} else if (_.has(loggers, "root")) {
			options.transports = this._filterTransportsForLogger("root", loggers["root"], handlers);
			delete loggers["root"];
		}
		// Else, use Winston default logger (Console)

		for (logger in loggers) {
			transports = this._filterTransportsForLogger(logger, loggers[logger], handlers);
			container.add(logger, {
				transports: transports
			});
		}

		return container;
	}

	/**
	 * [_resolveLogger description]
	 * @param  {[type]} name   [description]
	 * @param  {[type]} params [description]
	 * @return {[type]}        [description]
	 */
	_filterTransportsForLogger(name, params, handlers) {

		if (!_.has(params, "transports")) {
			throw new ImproperlyConfiguredException(CODES.REQUIRED_PARAMETER, "transports");
		}

		// Resolve transports config parameter. If transports is an array,
		// it is a list of strings. If it is a string, convert transports
		// to an array. Otherwise, throw an exception.
		let i, transport,
			transports = [],
			list = this._resolveLoggerTransports(params.transports);

		for (i in list) {
			transport = list[i];
			if (!_.has(handlers, transport)) {
				throw new ImproperlyConfiguredException(CODES.NOT_FOUND, "transport", transport);
			}
			transports.push(handlers[transport]);
		}
		return transports;
	}

	/**
	 * [_resolveLoggerTransports description]
	 * @param  {[type]} transports [description]
	 * @return {[type]}            [description]
	 */
	_resolveLoggerTransports(transports) {
		if (_.isArray(transports)) {
			let i, t;
			for (i in transports) {
				t = transports[i];
				if (!_.isString(t)) {
					throw new ImproperlyConfiguredException(
						CODES.UNEXPECTED_VALUE,
						"logger.transports member",
						typeof(transports),
						"[string]");
				}
			}
			return transports;
		} else if (_.isString(transports)) {
			return [transports];
		} else {
			throw new ImproperlyConfiguredException(
				CODES.UNEXPECTED_VALUE,
				"logger.transports",
				typeof(transports),
				"[string|array]");
		}
	}

	/**
	 * [_resolvePath description]
	 * @param  {[type]} _path [description]
	 * @param  {[type]} root  [description]
	 * @return {[type]}       [description]
	 */
	_resolvePath(_path, root = this.root) {
		let resolvedPath = resolvePath(_path, root),
			dir = resolvedPath.substring(0, resolvedPath.lastIndexOf("/"));
		if (!fs.existsSync(dir)) {
			mkdirp.sync(dir);
		}
		return resolvedPath;
	}
}
