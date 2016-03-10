"use strict";

import _ from "lodash";
import Logger from "~/logger";
import CODES from "~/error/codes";
import { IllegalArgumentException } from "~/error/exceptions";

/**
 * Provides a registry of all services (or apps) connected to the server
 */
export default class ServiceRegistry {

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor() {
		this.services = {};
		this.logger = Logger.getLogger("registry");
	}

	/**
	 * [contains description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	contains(name) {
		return _.has(this.services, name);
	}

	/**
	 * [destroy description]
	 * @return {[type]} [description]
	 */
	destroy() {
		// TODO hook destroy event to every service through 'set'. emit destroy
	}

	/**
	 * [get description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	get(name) {
		if (name == null) { // TODO check if string
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.ILLEGAL_ARGUMENT, "name", "Service name must be a string");
		}

		if (!this.contains(name)) {
			throw new IllegalArgumentException(CODES.ILLEGAL_SERVICE_NAME, "name");
		}

		return this.services[name];
	}

	/**
	 * [set description]
	 * @param {[type]} name    [description]
	 * @param {[type]} serivce [description]
	 */
	set(name, service) {
		if (name == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "string");
		}

		if (service == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "service");
		}

		// TODO check service type?
		this.services[name] = service;
	}

	all() {
		return _.values(this.services);
	}

	/**
	 * [remove description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	remove(name) {
		if (name == null) { // TODO check if string
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.has(this.services, name)) {
			throw new RegistryError(CODES.SERVICE_NOT_FOUND, name);
		}

		this.services[name] == void 0;
	}
}
