"use strict";

import _ from "lodash";
import config from "config";
import CODES from "~/error/codes";
import Doodad from "~/lib/doodad";
import {
    NotYetImplementedException, IllegalArgumentException
}
from "~/error/exceptions";

/**
 *
 */
export default class INexusMiddleware extends Doodad {

    // Config object
    config = {
        middleware: config.get("middleware"),
        defaults: config.get("defaults")
    };

    /**
     * [constructor description]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    constructor(id) {
        if (id == null) {
            throw new IllegalArgumentException(CODES.REQUIRED_PARAMETER, "id");
        }

        if (!_.isString(id)) {
            throw new IllegalArgumentException(CODES.INVALID_TYPE, "id", "String");
        }

        super(id);

        let middleware = this.config.middleware;
        if (_.has(middleware, id)) {
            this.config[id] = middleware.get(id);
        }
    }

    /**
     * [use description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    use(...args) {
        throw new NotYetImplementedException(CODES.NOT_YET_IMPLEMENTED, "use");
    }
}
