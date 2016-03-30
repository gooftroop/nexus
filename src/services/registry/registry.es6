"use strict";

import config from "config";
import Logger from "~/logger";
import Doodad from "~/lib/doodad";
import {
	NotYetImplementedException
}
from "~/error/exceptions";

/**
 * Provides a registry of all services (or apps) connected to the server
 */
export default class IServiceRegistry extends Doodad {

	// Internal Service mapping
	storage = null;

	// Logger instance
	logger = Logger.getLogger("registry");

	// Config object
	config = config.get("registry");

	/**
	 * [constructor description]
	 * @return {[type]} [description]
	 */
	constructor() {
		super();
	}

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
}
