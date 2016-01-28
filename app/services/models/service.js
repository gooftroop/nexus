"use strict";

import _ from "lodash";
import CODES form "app/shared/error/codes.js";
import IllegalArgumentException from "app/shared/error/exceptions.js";

/**
 * Model representation of a remote service
 */
export default class Service {

	/**
	 * [constructor description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	constructor(name) {

		if (name == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "string");
		}

		if (!_.isObject(api)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "api", "object");
		}
		this.name = name;
	}

	/**
	 * Override at Service implementation level
	 * @return {[type]} [description]
	 */
	toJSON() {
		return {
			name: this.name
		};
	}
}