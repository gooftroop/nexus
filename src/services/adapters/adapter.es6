"use strict";

import _ from "lodash";
import CODES from "~/error/codes";
import Doodad from "~/lib/doodad";
import { IllegalArgumentException, IllegalStateException } from "~/error/exceptions";

/**
 * Model representation of a remote service
 */
export default class IAdapter extends Doodad {

	// Service data instance
	data = null;

	/**
	 * [constructor description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	constructor(data={}) {
		super();
		this.data = data;
	}

	/**************************************************************************
	 * Protocol Translators
	 *************************************************************************/

	/**
	 * [publish description]
	 * @return {[type]} [description]
	 */
	publish(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "publish");
	}

	/**
	 * [subscribe description]
	 * @return {[type]} [description]
	 */
	subscribe(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "subscribe");
	}

	/**
	 * [request description]
	 * @return {[type]} [description]
	 */
	request(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "request");
	}

	/**
	 * [respond description]
	 * @return {[type]} [description]
	 */
	respond(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "respond");
	}

	/**
	 * [push description]
	 * @return {[type]} [description]
	 */
	push(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "push");
	}

	/**
	 * [pull description]
	 * @return {[type]} [description]
	 */
	pull(intent, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "pull");
	}
}
