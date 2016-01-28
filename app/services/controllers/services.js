"use strict";

import _ from "lodash";
import INexusController from "app/shared/controllers/base.js";
import CODES from "app/shared/error/codes.js";
import IllegalArgumentException from "app/shared/error/exceptions.js";
import Registry from "app/services/registry.js";
import RemoteService from "app/services/models/remoteService.js"

/**
 * Proxy request syntax:
 *
 * https://<hostname|nexus.io>:<port|>/<:service_name>(/<:method_name|:api_key>/<:method_arguments>)
 */
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
	 * [init description]
	 * @return {[type]} [description]
	 */
	init() {

		this._registry = Registry();
		this._services = polo();

		// Configure Polo events
		this._services.on("up", function(name, service) {
			// TODO what is service?
			// TODO might need a way to ask this service for it's api...
			console.log(service);
			this.register(name, service);
		});

		this._services.on("down", function(name, service) {
			// There's a semantic difference between unregistering a service so that it doesn't exist anymore
			// and a service being 'dwon' or 'offline'.
			this.logger.info("Service '" + name + "' unregistered");
			this.unregister(name);

		});
	}

	/**
	 * [publish description]
	 * @return {[type]} [description]
	 */
	bind() {
		this.app.get("/services/:name", this._proxy_services);
		this.app.post("/services/register/:name", this._proxy_register);
		this.app.post("/services/unregister/:name", this._procxy_unregister);
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
		this.register(service);
	}

	/**
	 * [_proxy_services description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxy_services(req, res) {
		try {
			let service = this.services(req.name);
			if (_.isArray(service)) {
				res.send(JSON.stringify(service));
			} else {
				res.send(JSON.stringify(service));
			}
		} catch (e) {
			res.status(e.status).send(JSON.stringify(e));
		}
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
	 * [_proxy_register description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxy_register(req, res) {
		// create service and register it
		// set state to active

		try {
			let name = req.param.name,
				attrs = req.body;

			// TODO validate attrs
			this._set_service_discovery(name);
			this.register(attrs);
		} catch(e) {
			res.status(e.status).send(JSON.stringify(e));
		}
	}

	/**
	 * [_set_service_discovery description]
	 * @param {[type]} name [description]
	 */
	_set_service_discovery(name) {
		if (name == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "name");
		}

		if (!_.isString(name)) {
			throw new IllegalArgumentException(CODES.INVALID_TYPE, "name", "string");
		}

		polo.add({
			name: name,
			// TODO need host?
			port: this.app.address().port
		});
	}

	/**
	 * [register description]
	 * @param  {[type]} name [description]
	 * @param  {[type]} attrs  [description]
	 * @return {[type]}      [description]
	 */
	register(name, attrs) {
		// Instantiate a new Service model and add it to the registry
		if (attrs == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "attrs");
		}

		// TODO this has to change if we want to allow local registers via a message queue
		service = new RemoteService(name, attrs);
		this._defineProxyAPI(service);
		this._registry.set(name, service);
	}

	/**
	 * [_proxy_unregister description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	_proxy_unregister(req, res) {
		// remove from register
		try {
			let name = req.param.name;
			this.unregister(name);
		} catch(e) {
			res.status(e.status).send(JSON.stringify(e));
		}
	}

	/**
	 * [unregister description]
	 * @param  {[type]} name [description]
	 * @return {[type]}         [description]
	 */
	unregister(name) {
		this._registry.remove(name);
	}

	_defineProxyAPI(service) {
		// TODO need to create proxy requests for the service api
		// TODO we need a way to be indicated to that we should use an HTTP proxy or WebSocket proxy
		// since request doesn't handle both
	}
}