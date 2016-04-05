"use strict";

import _ from "lodash";
import config from "config";
import Logger from "~/logger";
import CODES from "~/error/codes";
import APIService from "~/services/api/api";
import INexusController from "~/controllers/base";
import IRegistry from "~/services/registry/registry";
import {
	IllegalArgumentException, HttpException
}
from "~/error/exceptions";

/**
 * ServicesController
 *
 * Registering:
 *
 * 	Services can register themselves to a Nexus instance through defined APIs.
 *  When a service registers, it is added to the central registry and is
 *  automatically enrolled to be accessible through all APIs to recevie
 *  requests, unless otherwise opted out.
 *  However, a Service can only be registered once. When you register through
 *  a particular API, all requests will be proxied to that API.
 *  For registering, the following information is needed:
 *  	- The service's name
 *  	- (optional) The services domain or group
 *  	- (optional) The APIs to register to recieve requests/pub/sub
 *
 * Unregistering:
 *
 * 	When a service unregisters itself from nexus through one of the defined
 * 	APIs, that service is removed from the central repository, which has the
 * 	effect of unenrolling the service from all APIs.
 *
 * Communication:
 *
 * 	When an external agent wishs to act upon a service, it does so as an agent
 * 	of one of the defined APIs. Each API endpoint is responsible for providing
 * 	the proxying ability for that request to the desired Service. Furthermore,
 * 	each endpoint is responsible for defining the syntax of the communication
 * 	protocol for the porxy access by the agent.
 *
 * Events:
 *
 * 	- register: A Service is registered
 * 	- unregister: A Service is unregistered
 * 	- destroy: The controleer is being destroyed
 */
export default class ServicesController extends INexusController {

	// TODO FIGURE OUT HOW TO HAVE UNCAUGHT EXCEPTIONS HANDLED AT EACH ENDPOINT!!!

	// Dependency Injected express application
	app = null;

	// Defined APIs
	apis = {};

	// Logger instance
	logger = null;

	// Service Registry instance
	registry = null;

	// config object
	config = config.get("services");

	/**
	 * [constructor description]
	 * @param  {[type]} app [description]
	 * @return {[type]}     [description]
	 */
	constructor(app) {
		super();

		// TODO enforce 'app' to be an express instance
		this.app = app;
		this.logger = Logger.getLogger("services");
	}

	/**
	 * [define description]
	 * @param  {[type]} api [description]
	 * @return {[type]}     [description]
	 */
	define(Service, ...args) {

		let name, api;

		if (Service == null) {
			throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "Service");
		}

		if (this.registry == null) {
			throw new ServiceException(CODES.MISSING_REGISTRY);
		}

		// Javascript has no knowledge if something is a class or not, so our
		// best bet is to check to see if it's already an instance of API -
		// if not, try to instantiate it. If it fails, then it wasn't a class
		// (i.e. Service reference wasn't a constructor function). After that,
		// check again to verify that the instance is in fact an API instance.
		if (!(Service instanceof APIService)) {
			api = new Service(...args);
			if (!(api instanceof APIService)) {
				throw new IllegalArgumentException(CODES.INVALID_TYPE, "Service", "APIService");
			}
		} else {
			api = Service;
		}

		// Determine name of Service
		if (_.has(api, "name") && api.name != null) {
			name = api.name;
		} else {
			name = api.constructor.name;
		}

		if (_.has(this.apis, name)) {
			throw new ServiceException(CODES.SERVICE_ALREADY_DEFINED, name);
		}

		// Hook in destroy trigger
		this.once("destroy", api.destroy);

		// Inject the registry backend
		api.setRegistry(this.registry);

		// Register Service
		this.apis[name] = api;
		this.logger.info("Service API '" + name + "'' defined");
		this.emit("services", "api", "up", name, "define");

		return this;
	}

	/**
	 * [get description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	get(name) {
		if (!_.has(this.apis, name)) {
			throw new IllegalArgumentException(CODES.NOT_FOUND, "API Service", name);
		}
		return this.apis[name];
	}

	/**
	 * [remove description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	remove(name) {
		let service = this.get(name);
		delete this.apis[name];
		this.removeListener("destroy", service);
		this.logger.info("Service API '" + name + "'' removed");
		this.emit("services", "api", "down", name, "remove");
		this.service.destroy();
		return service;
	}

	/**
	 * [use description]
	 * @param  {[type]} registry [description]
	 * @return {[type]}          [description]
	 */
	use(Registry) {
		let _registry;
		if (!(Registry instanceof IRegistry)) {
			_registry = new Registry();
			if (!(_registry instanceof IRegistry)) {
				throw new IllegalArgumentException(CODES.INVALID_TYPE, "Registry", "IRegistry");
			}
		} else {
			_registry = Registry;
		}
		this.registry = _registry;
		this.logger.debug("Registry attached to Service Controller");
		return this;
	}
}
