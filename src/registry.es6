"use strict";

import _ from "lodash";
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
		this._registry = {};
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

		return this._registry[name];
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

		this._registry[name] = serivce;
	}

	all() {
		return _.values(this._registry);
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

		if (!_.has(this._registry, name)) {
			throw new RegistryError(CODES.SERVICE_NOT_FOUND, name);
		}

		this._registry[name] == void 0;
	}
}
