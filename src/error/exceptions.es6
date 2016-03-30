"use strict";

import { DEFAULT_MESSAGE, DEFAULT_ERROR_CODE, DEFAULT_HTTP_ERROR_STATUS } from "./codes";
import _ from "lodash";

export class HttpException extends Error {

    /**
     * [constructor description]
     * @param  {[type]} message [description]
     * @param  {[type]} status  [description]
     * @return {[type]}         [description]
     */
    constructor(message=DEFAULT_MESSAGE, status=DEFAULT_HTTP_ERROR_STATUS) {

        super(message);
        if (_.isObject(message)) {
            this.code = message.code || DEFAULT_ERROR_CODE;
            status = message.status || DEFAULT_HTTP_ERROR_STATUS;
            message = message.message || DEFAULT_MESSAGE;

        }

        this.message = message;
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }

    /**
     * [toJSON description]
     * @return {[type]} [description]
     */
    toJSON() {
        return {
            status: this.status,
            message: this.message
        };
    }
}

/**
 * Base Exception/Error class for the Nexus app
 */
export default class NexusException extends HttpException {

    /**
     * [code description]
     * @type {[type]}
     */
    constructor(...args) {
        let message, code, status, arg1 = args[0];
        if (_.isObject(arg1)) { // Using error.CODES
            // TODO this could break badly if args[1...] is not provided and is expected
            let msg_params = ((args.length > 1) ? args.slice(1) : []);
            message = arg1.message(...msg_params);
            code = arg1.code;
            status = arg1.status;

        } else {
            message = (_.isString(arg1) ? arg1 : DEFAULT_MESSAGE);
            code = (_.isNumber(args[1]) ? args[1] : DEFAULT_ERROR_CODE);
            status = (_.isNumber(args[2]) ? args[2] : DEFAULT_HTTP_ERROR_STATUS);
        }

        super(message, status);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }

    toJSON() {
        let orig = super.toJSON();
        return _.extend(orig, {
            code: this.code
        });
    }
}

/**
 *
 */
export class IllegalArgumentException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 *
 */
export class IllegalStateException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 *
 */
export class ImproperlyConfiguredException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 *
 */
export class NotYetImplementedException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 *
 */
export class RegistryException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 *
 */
export class ServiceException extends NexusException {

    /**
     * [constructor description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor.name);
    }
}
