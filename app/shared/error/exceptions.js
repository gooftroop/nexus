"use strict";

import (DEFAULT_MESSAGE, DEFAULT_ERROR_CODE, DEFAULT_HTTP_ERROR_STATUS) from "./codes.js";
import _ from "lodash";

/**
 * Base Exception/Error class for the Nexus app
 */
export default class NexusException extends Error {

	/**
	 * [code description]
	 * @type {[type]}
	 */
	constructor(...args) {

		if (_.isObject(arg1)) { // Using error.CODES
			// TODO this could break badly if args[1...] is not provided and is expected
			let enum = args[0],
				msg_params = (args.length > 1) ? args.slice(1) : [],
				message = enum.message(msg_params),
				code = enum.code,
				status = enum.status;
		} else {
			let message = _.isString(args[0]) ? args[0] : DEFAULT_MESSAGE,
			code = _.isNumber(args[1]) ? args[1] : DEFAULT_ERROR_CODE,
			status = _.isNumber(args[2]) ? args[2] : DEFAULT_HTTP_ERROR_CODE;
		}

		super(message);
		this.message = message;
		this.code = code;
		this.status = status;
	}

	toJSON() {
		return {
			code: this.status,
			message: this.message
		};
	}
}

/**
 *
 */
export class IllegalArgumentException extends NexusException {

	/**
	 * [constructor description]
	 * @param  {...[type]} args [description]
	 * @return {[type]}         [description]
	 */
	constructor(...args) {
    	super(...args);
    	this.name = this.constructor.name;
    	Error.captureStackTrace(this, this.constructor.name)
  	}
}

/**
 *
 */
export class RegistryException extends NexusException {

	/**
	 * [constructor description]
	 * @param  {...[type]} args [description]
	 * @return {[type]}         [description]
	 */
	constructor(...args) {
    	super(...args);
    	this.name = this.constructor.name;
    	Error.captureStackTrace(this, this.constructor.name)
  	}
}

/**
 *
 */
export class ServiceException extends NexusException {

	/**
	 * [constructor description]
	 * @param  {...[type]} args [description]
	 * @return {[type]}         [description]
	 */
	constructor(...args) {
    	super(...args);
    	this.name = this.constructor.name;
    	Error.captureStackTrace(this, this.constructor.name)
  	}
}