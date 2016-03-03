"use strict";

/**
 *
 */
export default class INexusController {

    /**
     * [constructor description]
     * @param  {[type]} app [description]
     * @return {[type]}     [description]
     */
    constructor(app) {
        this.app = app;
        this.logger = process.env.logger;
    }

    /**
     * [meta description]
     * @return {[type]} [description]
     */
    meta() {
        // TODO implement default meta
        return {};
    }
}
