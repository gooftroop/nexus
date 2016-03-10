"use strict";

import _ from "lodash";
import request from "request";
import Service from "./service";
import { ensureForwardSlash } from "~/utils";
import { ServiceException, IllegalArgumentException } from "~/error/exceptions";
import CODES from "~/error/codes";

/**
 *
 */
export default class RemoteService extends Service {

	// TODO auto configure SNMP for service status?
	// TODO hook in for info url for getting meta (/info or allow **/info?)
	// TODO hook in for contact url for getting contact info (/contact or allow **/contact?)

	/**
	 * [constructor description]
	 * @param  {[type]} name  [description]
	 * @param  {[type]} props [description]
	 * @return {[type]}       [description]
	 */
	constructor(name, url, paths={}) {
		// <(protocol://)?(hostname|ip){1}[:port]?
		// TODO handle exceptions. address must exist and must be valid
		super(name);
		this.url = this._validateUrl(url);
		this.paths = this._validatePaths(paths);
	}

	/**
	 * [toJSON description]
	 * @return {[type]} [description]
	 */
	toJSON() {
		return _.extend(
			super.toJSON(),
			{
				url: this.url,
				paths: this.paths
			}
		);
	}

	/**************************************************************************
	 * CRUD METHODS
	 *************************************************************************/

	 /**
	  * [delete description]
	  * @param  {[type]} url [description]
	  * @param  {[type]} req [description]
	  * @param  {[type]} res [description]
	  * @return {[type]}     [description]
	  */
	 delete(url, req, res) {
		let qualified = this._getQualifiedUrl(url);
		request({
			url: qualified,
			method: "DELETE"
		}, (err, response, body) => {
			res.status(respnose.statusCode).send(body);
		});
	 }

	 /**
	  * [get description]
	  * @param  {[type]} url [description]
	  * @param  {[type]} req [description]
	  * @param  {[type]} res [description]
	  * @return {[type]}     [description]
	  */
	 get(url, req, res) {
		let qualified = this._getQualifiedUrl(url);
		request({
			url: qualified,
			method: "GET"
		}, (err, response, body) => {
			res.status(respnose.statusCode).send(body);
		});
	 }

	 /**
	  * [post description]
	  * @param  {[type]} url [description]
	  * @param  {[type]} req [description]
	  * @param  {[type]} res [description]
	  * @return {[type]}     [description]
	  */
	 post(url, req, res) {
		let qualified = this._getQualifiedUrl(url);
		request({
			url: qualified,
			body: req.body,
			method: "POST"
		}, (err, response, body) => {
			res.status(respnose.statusCode).send(body);
		});
	 }

	 /**
	  * [put description]
	  * @param  {[type]} url [description]
	  * @param  {[type]} req [description]
	  * @param  {[type]} res [description]
	  * @return {[type]}     [description]
	  */
	 put(url, req, res) {
		let qualified = this._getQualifiedUrl(url);
		request({
			url: qualified,
			body: req.body,
			method: "PUT"
		}, (err, response, body) => {
			res.status(respnose.statusCode).send(body);
		});
	 }

	/**************************************************************************
	 * PRIVATE METHODS
	 *************************************************************************/

	 /**
	  * [_getQualifiedUrl description]
	  * @param  {[type]} url [description]
	  * @return {[type]}     [description]
	  */
	 _getQualifiedUrl(url) {
		return this.url + ensureForwardSlash(url);
	 }

	 /**
	  * [_validate_address description]
	  * @param  {[type]} address [description]
	  * @return {[type]}         [description]
	  */
	 _validateUrl(url) {
		// TODO validate
		return url;
	 }

	 /**
	  * [_validate_api description]
	  * @param  {[type]} paths [description]
	  * @return {[type]}     [description]
	  */
	 _validatePaths(paths) {
		if (!_.isObject(paths)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "paths", "object");
		}
		return paths;
	 }
}
