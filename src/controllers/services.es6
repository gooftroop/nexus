"use strict";

import _ from "lodash";
import polo from "polo";
import request from "request";
import INexusController from "~/controllers/base";
import CODES from "~/error/codes";
import {
	IllegalArgumentException, HttpException
}
from "~/error/exceptions";
import Registry from "~/registry";
import RemoteService from "~/models/remoteService";
import Logger from "~/logger";
import {
	sendError
}
from "~/utils";

/**
 * Proxy request syntax:
 *
 * https://<hostname|nexus.io>:<port|>/<:service_name>(/<:method_name|:api_key>/<:method_arguments>)
 */
// TODOS:
// 1. Figure out what 'service' is coming in from polo's 'up' event
// 2. Also answer the question of what if services don't define an API?
// 3. How should we go about allowing both HTTP and WebSocket proxying?
export default class ServicesController extends INexusController {

	/**
	 * [constructor description]
	 * @param  {[type]} app [description]
	 * @return {[type]}     [description]
	 */
	constructor(app) {
		super(app);

		this.registry = new Registry();
		this.logger = Logger.getLogger("services");

		this._configureZeroConf();
		this._bind();
	}

	/**
	 * [destroy description]
	 * @return {[type]} [description]
	 */
	destroy() {
		super.destroy();
		// TOOD or use event?
		this.zeroconf.stop();
		this.zeroconf.removeListener("up", this._handleUp);
		this.zeroconf.removeListener("down", this._handleDown);
		this.registry.destroy();
	}

	/**
	 * [_registerHelper description]
	 * @param  {[type]} name [description]
	 * @param  {[type]} attrs  [description]
	 * @return {[type]}      [description]
	 */
	register(name, serivce) {

		this._registerHelper(name, service);
	}

	/**
	 * [services description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	services(name) {

		// TODO ensure url encoding
		if (name == null) {
			return this.registry.all();
		}

		return this.registry.get(name);
	}


	/**
	 * [unregister description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	unregister(name) {
		this.registry.remove(name);
	}

	/**************************************************************************
	 * PRIVATE METHODS
	 *************************************************************************/

	/**
	 * [publish description]
	 * @return {[type]} [description]
	 */
	_bind() {
		this.app.get("/services(/:name)?", ::this._proxyServices);
		this.app.post("/services/register/:name", ::this._proxyRegister);
		this.app.post("/services/unregister/:name", ::this._proxyUnregister);
	}

	/**
	 * [_configureZeroConf description]
	 * @return {[type]} [description]
	 */
	_configureZeroConf() {

		this.zeroconf = polo();

		// this.zeroconf.put({
		// 	name: "nexus",
		// 	port: this.app.get("port")
		// });

		// // Configure Polo events
		// this.zeroconf.on("up", ::this._handleUp);
		// this.zeroconf.on("down", ::this._handleDown);
	}

	/**
	 * [_createRemoteService description]
	 * @param  {[type]} name  [description]
	 * @param  {[type]} attrs [description]
	 * @return {[type]}       [description]
	 */
	_createRemoteService(name, attrs, req) {
		let params = [];

		if (attrs) {
			if (_.has(attrs, "url")) {
				params.push(attrs.url);
			} else if (_.has(attrs, "address")) {
				params.push(attrs.address);
			} else if (_.has(attrs, "host")) {
				// TODO make strings Constants
				params.push("http://" + attrs.host + (_.has(attrs, "port") ? ":" + attrs.port : ""));
			} else if (req) {
				params.push(req.protocol + "://" + req.get("host") + req.originalUrl);
			}

			if (_.has(attrs, "paths")) {
				params.push(attrs.paths);
			}
		}

		return new RemoteService(name, ...params);
	}

	/**
	 * [_defineProxyAPI description]
	 * @param  {[type]} service [description]
	 * @return {[type]}         [description]
	 */
	_defineProxyAPI(service) {
		// TODO we need a way to be indicated to that we should use an HTTP proxy or WebSocket proxy
		// since request doesn't handle both
		//
		// for the proxy just create a route function as such:
		// /<name>/:path
		// Where :path is forwarded to the service with root
		// prefixed, if root exists
		// So...we can use app.all() and let the microservice handle the method not being supported
		// for a specific url, or we can require api and only build the routes for the defined methods
		// ....Im leaning for the former since that reduces the hard requirements for mircoservices
		// particpating nexus.

		// TODO force HTTPS? or allow option
		// TODO WebSockets????
		let url = this.app.get("address") + "/" + service.name + "/:fragment";
		this.app.all(url, function(req, res) {

			let fragment = req.params.fragment,
				method = req.method; // TODO correct?

			service[method](fragment, req, res);
		});
	}

	/**
	 * [_handleDown description]
	 * @param  {[type]} name    [description]
	 * @param  {[type]} service [description]
	 * @return {[type]}         [description]
	 */
	_handleDown(name, service) {
		// There's a semantic difference between unregistering a service so that it doesn't exist anymore
		// and a service being 'down' or 'offline'.
		this.logger.info("Service '" + name + "' disconnected");
		this.unregister(name);
	}

	/**
	 * [_handleUp description]
	 * @param  {[type]} name  [description]
	 * @param  {[type]} attrs [description]
	 * @return {[type]}       [description]
	 */
	_handleUp(name, attrs) {
		// TODO might need a way to ask this service for it's api...
		console.log("inside 'up' handlers: " + name);
		console.log(this.zeroconf.repo);
		this.logger.info("Service '" + name + "' connected");
		this._registerHelper(name, this._createRemoteService(name, attrs));
	}

	/**
	 * [_proxy_registerHelper description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxyRegister(req, res) {
		// create service and register it
		// set state to active

		try {
			let service,
				name = req.params.name,
				attrs = req.body;

			service = this._createRemoteService(name, attrs, req);
			this._registerHelper(name, service);
			res.send({
				message: "Service '" + name + "' registered"
			});
		} catch (err) {
			sendError(err, res);
		}
	}

	/**
	 * [_proxy_services description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxyServices(req, res) {
		try {
			let service = this.services(req.params.name);
			res.send(service);
		} catch (err) {
			sendError(err, res);
		}
	}

	/**
	 * [_proxy_unregister description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxyUnregister(req, res) {
		// remove from register
		try {
			let name = req.params.name;
			this.unregister(name);
		} catch (err) {
			sendError(err, res);
		}
	}

	/**
	 * [_registerHelper description]
	 * @param  {[type]} name    [description]
	 * @param  {[type]} service [description]
	 * @return {[type]}         [description]
	 */
	_registerHelper(name, service) {
		// Instantiate a new Service model and add it to the registry
		if (service == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "service");
		}

		this._defineProxyAPI(service);

		// TODO service can be a Service instance or an object of attrs. Handle this.
		this.registry.set(name, service);
	}
}
