"use strict";

import url from "url";
import _ from "lodash";
import request from "request";
import CODES from "~/error/codes";
import validator from 'validator';
import IAdapter from "~/services/adapters/adapter";
import {
    ensureLeadingSlash
}
from "~/utils";
import {
    ServiceException
}
from "~/error/exceptions";

export const DEFAULT_METHOD = "all";

/**
 *
 */
export default class HttpAdapter extends IAdapter {

    /**
     * [constructor description]
     * @param  {[type]} arg [description]
     * @return {[type]}      [description]
     */
    constructor() {
        super();
    }

    /**
     * [name description]
     * @return {[type]} [description]
     */
    static name() {
        return "HttpAdapter";
    }

    /**
     * [destroy description]
     * @return {[type]} [description]
     */
    destroy() {
        super.destroy();
        // TODO cancel any requests??
    }

    /**
     * [request description]
     * @param  {[type]} intent  [description]
     * @param  {[type]} resolve [description]
     * @param  {[type]} reject  [description]
     * @return {[type]}         [description]
     */
    request(intent, model, resolve, reject) {
        // TODO capture any errors and use reject
        // TODO ensure that path, method exists!
        let uri,
            path,
            _whitelistedMethod,
            actions = model.get("actions"),
            action = intent.get("action"),
            method = intent.get("method");

        // TODO validate that actions is in the format that we need

        if (!_.isEmpty(actions)) {
            if (!_.has(actions, action)) {
                return reject(new ServiceException(CODES.ACTION_NOT_SUPPORTED, action, model.get("name")));
            }

            _whitelistedMethod = actions[action];
            if (_whitelistedMethod != null && _whitelistedMethod != method && _whitelistedMethod != DEFAULT_METHOD) {
                return reject(new ServiceException(CODES.HTTP_METHOD_NOT_SUPPORTED, method, model.get("name")));
            }
        }

        path = _.has(actions, "path") ? actions.path : action;
        uri = url.resolve(model.get("uri"), path);
        request({
            url: uri,
            method: method
                // TODO fill out, like body
        }, function(error, response, body) {
            if (error) {
                return reject(error);
            }
            resolve(response);
        });
    }
}