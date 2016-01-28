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
		this.url = props.url; // <(protocol://)?(hostname|ip){1}[:port]?
		this.root = props.root;
		this.api = props.api || {};
	}

	/**
	 * [generateProxyApi description]
	 * @return {[type]} [description]
	 */
	*generateProxyApi() {
		// for the proxy just create a route function as such:
		// /<name>/:path
		// Where :path is forwarded to the service with root
		// prefixed, if root exists
	}

	/**
	 * [toJSON description]
	 * @return {[type]} [description]
	 */
	toJSON() {
		return _.extend(
			super(),
			{
				url: this.url,
				root: this.root,
				api: this.api
			}
		);
	}
}