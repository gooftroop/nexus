"use strict";

import _ from "lodash";
import request from "request";
import Service from "./service.js";
import ServiceException from "app/shared/error/exceptions.js";
import CODES from "app/shared/error/codes.js";

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
		this.api = props.api || {};
		this._mapping = {};
		this._root = props.root;

		this.bind();
	}

	/**
	 * For each path (fragment) specified in the api, create function pointers
	 * from the canonacalized path to the specified methods ['get', ...etc.]
	 * @return undefined
	 */
	bind() {

		let _path, props;
		for (_path in this.api) {

			props = this.api[_path];
			let url,
				methods = this._get_methods(props),
				options = _without(props, "method");

			// Replace the '/' in the path with '_' so that the path is
			// callable on the service and assign it a proxy function to
			// parse/normalize/check all the necessary information before
			// calling the corresponding CRUD method.
			this[_path.replace("/", "_")] = (...args) => {

				// TODO handle exceptions. min 2 args, max 3
				let last = args.length - 1,
					method = args[0],
					res = args[last];

				// Check to see if the service API defined the method for the
				// url
				if (_.indexOf(methods, method) == -1) {
					throw new ServiceException(CODES.METHOD_NOT_SUPPORTED, method, _path, this.name);
				}

				// Assign the response callback function to the last index
				// of args.
				args[last] = (response) => {
					res.status = response.statusCode;
					// TODO headers, body, cookies, etc?
					res.send(); // TODO
				}

				// Build the fully qualified url for the request against the
				// remote service
				url = this.url + _path; // TODO make sure url and path is joined by '/'

				// Call the cooresponding method with the modified args array
				return this[method](...args);
			}
		}
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
	 * [del description]
	 * @param  {[type]}   url      [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	del(url, callback) {
		request.del(url).on("response", callback);
	}

	/**
	 * [get description]
	 * @param  {[type]}   url      [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	get(url, callback) {
		request.get(url).on("response", callback);;
	}

	/**
	 * [patch description]
	 * @param  {[type]}   url      [description]
	 * @param  {Object}   body     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	patch(url, body, callback) {
		request.patch({
			body: body
		}).on("response", callback);
	}

	/**
	 * [post description]
	 * @param  {[type]}   url      [description]
	 * @param  {Object}   body     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	post(url, body, callback) {
		request.post({
			body: body
		}).on("response", callback);
	}

	/**
	 * [put description]
	 * @param  {[type]}   url      [description]
	 * @param  {Object}   body     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	put(url, body, callback) {
		request.put({
			body: body
		}).on("response", callback);
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

	/**************************************************************************
	 * PRIVATE METHODS
	 *************************************************************************/

	 /**
	  * [_get_methods description]
	  * @param  {[type]} props [description]
	  * @return {[type]}       [description]
	  */
	 _get_methods(props) {
	 	let _methods = props.method;
	 	_methods = _.isString(_methods) ? _methods.split(" ") : _methods;
	 	if (!_.isArray(_methods)) {
	 		throw new ServiceException(CODES.INVALID_TYPE, "method", "string or array");
	 	}
	 	return _methods;
	 }
}