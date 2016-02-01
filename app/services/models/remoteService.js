"use strict";

import _ from "lodash";
import request from "request";
import Service from "./service.js";
import { ServiceException, IllegalArgumentException } from "app/shared/error/exceptions.js";
import CODES from "app/shared/error/codes.js";
import { ensureForwardSlash } from "app/shared/utils.js";

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
		// TODO handle exceptions. address must exist and must be valid
		super(name);
		this._address = this._validateAddress(props.address); // <(protocol://)?(hostname|ip){1}[:port]?

		this.api = {};
		if (_.has(props, "api")) {
			this.api = this._validateApi(props.api);
		}

		this._root = this._validateRoot(props.root);

		this.bind();
	}

	/**
	 * For each path (fragment) specified in the api, create function pointers
	 * from the canonacalized path to the specified methods ['get', ...etc.]
	 * @return undefined
	 */
	bind() {

		let _path, _props;
		for (_path in this.api) {

			_props = this.api[_path];
			let url,
				methods = this._getMethods(_props),
				options = _without(_props, "method");

			// Replace the '/' in the path with '_' so that the path is
			// callable on the service and assign it a proxy function to
			// parse/normalize/check all the necessary information before
			// calling the corresponding CRUD method.
			this[_path.replace("/", "_")] = ((method, req, res) => {

				// TODO handle exceptions. min 2 args, max 3

				// Check to see if the service API defined the method for the
				// url
				if (_.indexOf(methods, method) == -1) {
					throw new ServiceException(CODES.METHOD_NOT_SUPPORTED, method, _path, this.name);
				}

				// Assign the response callback function to the last index
				// of args.
				// Build the fully qualified url for the request against the
				// remote service
				let cb = function(response) {
					res.status = response.statusCode;
					// TODO headers, body, cookies, etc?
					res.send(); // TODO
				}, url = (this.url + ensureForwardSlash(_path));

				// Call the cooresponding method with the modified args array
				return this[method](url, req, cb);
			});
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
			return this._address;
		} else {
			return (this._address + ensureForwardSlash(this._root));
		}
	}

	/**
	 * [del description]
	 * @param  {[type]}   url      [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	del(url, req, callback) {
		request.del(url).on("response", callback);
	}

	/**
	 * [get description]
	 * @param  {[type]}   url      [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	get(url, req, callback) {
		request.get(url).on("response", callback);
	}

	/**
	 * [patch description]
	 * @param  {[type]}   url      [description]
	 * @param  {Object}   body     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	patch(url, req, callback) {
		// TODO get body
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
	post(url, req, callback) {
		// TODO get body
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
	put(url, req, callback) {
		// TODO get body
		request.put({
			body: body
		}).on("response", callback);
	}

	/**
	 * [toJSON description]
	 * @return {[type]} [description]
	 */
	toJSON() {
		let _url = this.url;
		return _.extend(
			super.toJSON(),
			{
				address: this._address,
				root: this._root,
				url: _url,
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
	 _getMethods(props) {
	 	let _methods = props.method;
	 	if (_.isString(_methods)) {
	 		_methods = _methods.split(" ");
	 	}

	 	if (!_.isArray(_methods)) {
	 		throw new ServiceException(CODES.INVALID_TYPE, "method", "string or array");
	 	}
	 	return _methods;
	 }

	 /**
	  * [_validate_address description]
	  * @param  {[type]} address [description]
	  * @return {[type]}         [description]
	  */
	 _validateAddress(address) {
	 	// TODO validate
	 	return address;
	 }

	 /**
	  * [_validate_api description]
	  * @param  {[type]} api [description]
	  * @return {[type]}     [description]
	  */
	 _validateApi(api) {
	 	if (!_.isObject(api)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "api", "object");
		}
	 	return api;
	 }

	 /**
	  * [_validate_root description]
	  * @param  {[type]} root [description]
	  * @return {[type]}      [description]
	  */
	 _validateRoot(root) {
	 	if (!_.isString(root)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "root", "string");
		}
	 	return root;
	 }
}