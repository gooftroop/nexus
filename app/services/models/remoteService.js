"use strict";

import Service from "./service.js";

/**
 *
 */

export default class RemoteService extends Service {

	// TODO auto configure SNMP for service status

	/**
	 * [constructor description]
	 * @param  {[type]} name [description]
	 * @param  {[type]} url  [description]
	 * @return {[type]}      [description]
	 */
	constructor(name, api) {
		// TODO handle exxceptions.
		super(name);
		this._props.url = api.url;
	}

	get url() {
		return this._props.url;
	}
}