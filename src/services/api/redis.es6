"use strict";

import API from "./api";

/**
 *
 */
export default class RedisService extends API {

    /**
     * [constructor description]
     * @return {[type]} [description]
     */
    constructor(controller) {
        super("redis", controller);
    }
}
