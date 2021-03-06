"use strict";

import _ from "lodash";
import config from "config";
import Logger from "~/logger";
import INexusMiddleware from "~/middleware/base";
import {
	NotYetImplementedException,
	IllegalArgumentException,
	RegistryException
}
from "~/error/exceptions";

/**
 * Provides a registry of all services (or apps) connected to the server
 */
export default class IServiceRegistry extends INexusMiddleware {

	static ID = "registry";

	// Internal Service mapping
	storage = null;

	// Logger instance
	logger = Logger.getLogger("registry");

	// Default Adapter Registry
	_adapterRegistry = {};

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor() {
		super(IServiceRegistry.ID);
	}

	/**************************************************************************
	 * SERVICE REGISTRATION
	 *************************************************************************/

	/**
	 * [contains description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	contains(name) {
		throw new NotYetImplementedException("contains");
	}

	/**
	 * [get description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	get(name) {
		throw new NotYetImplementedException("contains");
	}

	/**
	 * [set description]
	 * @param {[type]} name    [description]
	 * @param {[type]} serivce [description]
	 */
	set(name, service) {
		throw new NotYetImplementedException("contains");
	}

	/**
	 * [all description]
	 * @return {[type]} [description]
	 */
	all() {
		throw new NotYetImplementedException("contains");
	}

	/**
	 * [remove description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	remove(name) {
		throw new NotYetImplementedException("contains");
	}

	/**************************************************************************
	 * ADAPTER REGISTRATION
	 *************************************************************************/

	 /**
	  * [getAdapter description]
	  * @param  {[type]} adapterName [description]
	  * @return {[type]}           [description]
	  */
	getAdapter(adapterName) {
		if (adapterName == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "adapterName");
		}

		if (!_.isString(adapterName)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "adapterName", "String");
		}

		if (!_.has(this._adapterRegistry, adapterName)) {
			throw new RegistryException(CODES.MISSING_ADAPTER);
		}
		return this._adapterRegistry[adapterName];
	}

	/**
	 * [registerAdapter description]
	 * @param  {[type]} adapterName [description]
	 * @param  {[type]} Adapter     [description]
	 * @return {[type]}             [description]
	 */
	registerAdapter(adapterName, Adapter) {
		if (adapterName == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "adapterName");
		}

		if (!_.isString(adapterName)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "adapterName", "String");
		}

		if (Adapter == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "Adapter");
		}

		if (!_.has(this._adapterRegistry, adapterName)) {
			let adapter = new Adapter();
			this._adapterRegistry[adapterName] = adapter;
			this.once("destroy", adapter.destroy);
			this.emit("registry", "adapter", "up", adapterName);
		}
	}

	/**
	 * [removeAdapter description]
	 * @param  {[type]} adapterName [description]
	 * @return {[type]}             [description]
	 */
	removeAdapter(adapterName) {
		if (adapterName == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "adapterName");
		}

		if (!_.isString(adapterName)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "adapterName", "String");
		}

		let adapter = this._adapterRegistry[adapterName];
		delete this._adapterRegistry[adapterName];
		this.removeListener("destroy", adapter.destroy);
		this.emit("registry", "adapter", "down", adapterName);
		adapter.destroy();
		return adapter;
	}
}
