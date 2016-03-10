"use strict";

import Logger from "~/logger";

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
        this.logger = Logger.getLogger("serivces");
    }

    /**
     * [destroy description]
     * @return {[type]} [description]
     */
    destroy() {
        // nothing
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
