"use strict";

import _ from "lodash";
import polo from "polo";

import API from "./api";

/**
 *
 */
export default class ZeroConf extends API {

    // The internal zeroconf app
    app = null;

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(controller) {
        super("zeroconf", controller);
        this.app = polo();
    }

    /**
     * [destroy description]
     * @return {[type]} [description]
     */
    destroy() {
        super.destroy();
        this.app.stop();
        this.app.removeListener("up", this._handleUp);
        this.app.removeListener("down", this._handleDown);
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
        // TODO this
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
        console.log(this.app.repo);
        this.logger.info("Service '" + name + "' connected");
        // this._registerHelper(name, this._createRemoteService(name, attrs));
    }
}
