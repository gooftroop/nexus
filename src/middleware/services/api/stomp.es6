"use strict";

import API from "./api";

/**
 *
 */
export default class STOMPService extends API {

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(controller) {
        super("stomp", controller);
    }
}
