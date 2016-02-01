"use strict";

/**
 *
 */
export default class INexusController extends Object {

	/**
	 * [constructor description]
	 * @param  {[type]} app [description]
	 * @return {[type]}     [description]
	 */
	constructor(app) {
		super();
		this.app = app;
		this.logger = process.env.logger;
	}
}