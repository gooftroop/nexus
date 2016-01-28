"use strict";

import _ from "lodash";
import Service from "./service.js";

/**
 *
 */
export default class RemoteService extends Service {

	// TODO auto configure SNMP for service status?

	/**
	 * [constructor description]
	 * @param  {[type]} name  [description]
	 * @param  {[type]} props [description]
	 * @return {[type]}       [description]
	 */
	constructor(name, props) {
		// TODO handle exxceptions. url must exist.
		super(name);
		this._address = props.address; // <(protocol://)?(hostname|ip){1}[:port]?
		this._root = props.root;
		this.api = props.api || {};
	}

	/**
	 * [url description]
	 * @return {[type]} [description]
	 */
	get url() {
		// TODO check for protocol?
		// TODO modify for websockets??
		if (this._root == null) {
			return this._address
		} else {
			return [this._address, this._root].join("/");
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
				address: this._address,
				root: this._root,
				url: this.url(),
				api: this.api
			}
		);
	}
}