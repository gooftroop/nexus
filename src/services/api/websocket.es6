"use strict";

import API from "./api";

/**
 *
 */
export default class Websocket extends API {

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(controller) {
        super("websocket", controller);
    }
}
