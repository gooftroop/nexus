"use strict";

import _ from "lodash";
import CODES from "~/error/codes";
import Doodad from "~/lib/doodad";
import { IllegalArgumentException, IllegalStateException } from "~/error/exceptions";

/**
 * Model representation of a remote service
 */
export default class IAdapter extends Doodad {

	/**
	 * [constructor description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	constructor() {
		super();
	}

	/**
	 * [name description]
	 * @return {[type]} [description]
	 */
	static name() {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "name");
	}

	/**************************************************************************
	 * Protocol Translators
	 *************************************************************************/

	/**
	 * [publish description]
	 * @return {[type]} [description]
	 */
	publish(intent, model, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "publish");
	}

	/**
	 * [subscribe description]
	 * @return {[type]} [description]
	 */
	subscribe(intent, model, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "subscribe");
	}

	/**
	 * [request description]
	 * @return {[type]} [description]
	 */
	request(intent, model, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "request");
	}

	/**
	 * [respond description]
	 * @return {[type]} [description]
	 */
	respond(intent, model, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "respond");
	}

	/**
	 * [push description]
	 * @return {[type]} [description]
	 */
	push(intent, model, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "push");
	}

	/**
	 * [pull description]
	 * @return {[type]} [description]
	 */
	pull(intent, mdoel, resolve, reject) {
		throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "pull");
	}
}
