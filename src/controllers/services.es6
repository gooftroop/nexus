"use strict";

import _ from "lodash";
import polo from "polo";
import request from "request";
import INexusController from "~/controllers/base";
import CODES from "~/error/codes";
import { IllegalArgumentException } from "~/error/exceptions";
import Registry from "~/registry";
import RemoteService from "~/models/remoteService"

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
		this.init();
		this.bind();
	}

	/**
	 * [registry description]
	 * @return {[type]} [description]
	 */
	get registry() {
		return this._registry;
	}

	/**
	 * [services description]
	 * @param  {[type]} service [description]
	 * @return {[type]}         [description]
	 */
	set services(service) {
		// Create a LocalService?
		// Make available on LAN via zero-confg
		this.register(name, service);
	}

	/**
	 * [publish description]
	 * @return {[type]} [description]
	 */
	bind() {
		this.app.get("/services/:name", _.bind(this._proxyServices, this));
		this.app.post("/services/register/:name", _.bind(this._proxyRegister, this));
		this.app.post("/services/unregister/:name", _.bind(this._proxyUnregister, this));
	}

	/**
	 * [init description]
	 * @return {[type]} [description]
	 */
	init() {

		this._registry = new Registry();
		this._services = polo();

		// Configure Polo events
		this._services.on("up", function(name, service) {
			// TODO what is service?
			// TODO might need a way to ask this service for it's api...
			console.log(service);
			this._register(name, service);
		});

		this._services.on("down", function(name, service) {
			// There's a semantic difference between unregistering a service so that it doesn't exist anymore
			// and a service being 'dwon' or 'offline'.
			this.logger.info("Service '" + name + "' unregistered");
			this.unregister(name);

		});
	}

	/**
	 * [services description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	services(name) {
		if (name == null) {
			return this._registry.all();
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		let service = this._registry.get(name);

		if (service == null) {
			throw new IllegalArgumentException(CODES.ILLEGAL_SERVICE_NAME, "name");
		}

		return service;
	}


	/**
	 * [unregister description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	unregister(name) {
		this._registry.remove(name);
		// Remove from polo
		this._services.repo.pop(name);
	}

	/**************************************************************************
	 * PRIVATE METHODS
	 *************************************************************************/

	/**
	 * [_defineProxyAPI description]
	 * @param  {[type]} service [description]
	 * @return {[type]}         [description]
	 */
	_defineProxyAPI(service) {
		// TODO need to create proxy requests for the service api
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
		// TODO does address give fully qualified url??
		let url = [this.app.address(), service.name, ":fragment"].join("/");
		this.app.all(url, function(req, res) {

			// Replace all '/' with '_' in the fragment and call the method on
			// services
			let fragment = req.params.fragment.replace("/", "_"),
				method = req.method; // TODO correct?

			service[fragment](method, req, res);
		});
	}

	/**
	 * [_proxy_register description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxyRegister(req, res) {
		// create service and register it
		// set state to active

		try {
			let name = req.param.name,
				attrs = req.body;

			// TODO validate attrs
			service = new RemoteService(name, attrs);
			this._setServiceDiscovery(name);
			this._defineProxyAPI(service);
			this._register(name, service);
		} catch(e) {
			res.status(e.status).send(JSON.stringify(e));
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
			let service = this.services(req.name);
			res.send(JSON.stringify(service));
		} catch (e) {
			res.status(e.status).send(JSON.stringify(e));
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
			let name = req.param.name;
			this.unregister(name);
		} catch(e) {
			res.status(e.status).send(JSON.stringify(e));
		}
	}

	/**
	 * [_register description]
	 * @param  {[type]} name [description]
	 * @param  {[type]} attrs  [description]
	 * @return {[type]}      [description]
	 */
	_register(name, serivce) {
		// Instantiate a new Service model and add it to the registry
		if (attrs == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "attrs");
		}

		// TODO service can be a Service instance or an object of attrs. Handle this.
		this._registry.set(name, service);
	}

	/**
	 * [_set_service_discovery description]
	 * @param {[type]} name [description]
	 */
	_setServiceDiscovery(name) {
		if (name == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "string");
		}

		this._services.add({
			name: name,
			port: this.app.address().port
		});
	}
}
