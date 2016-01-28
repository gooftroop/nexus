"use strict";

import Service from "./service.js";

/**
 *
 */
export default class RemoteService extends Service {

	// TODO auto configure SNMP for service status?

	/**
	 * [constructor description]
	 * @param  {[type]} name [description]
	 * @param  {[type]} attrs  [description]
	 * @return {[type]}      [description]
	 */
	constructor(name, attrs) {
		// TODO handle exxceptions. api must exist
		super(name);
		this.url = attrs.url;
		this.api = {};

		// if an api fragment begins with <name>, use the fragment
		// if an api fragment doesn't begin with fragment, add <name> + / + fragment
		// syntax is: { <fragment> : <METHOD | [METHODS]>, ...etc. >

		let api = attrs.api, fragment;
		for (fragment in api) {

		}
	}

	/**
	 * [toJSON description]
	 * @return {[type]} [description]
	 */
	toJSON() {
		return _.extend(
			super(),
			{
				url: this.url
			}
		);
	}
}