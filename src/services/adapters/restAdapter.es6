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
export default class RestAdapter extends IAdapter {

    static GET = "GET";
    static DELETE = "DELETE";
    static HEAD = "HEAD";
    static OPTIONS = "OPTIONS";
    static PATCH = "PATCH";
    static POST = "POST";
    static PUT = "PUT";

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
            params,
            _whitelistedMethod,
            actions = model.get("actions"),
            action = intent.get("action"),
            body = intent.get("body"),
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

        params = _.extend({
            url: uri,
            method: method,
        }, model.get("options") || {});

        if (method === RestAdapter.POST || method === RestAdapter.PUT || method === RestAdapter.PATCH) {
            params.body = body;
        }

        request(params, function(error, response, body) {
            if (error) {
                return reject(error);
            }
            resolve(response);
        });
    }

    /**
     * [publish description]
     * @param  {[type]} intent  [description]
     * @param  {[type]} model   [description]
     * @param  {[type]} resolve [description]
     * @param  {[type]} reject  [description]
     * @return {[type]}         [description]
     */
    publish(intent, model, resolve, reject) {
        this.request(intent, model, resolve, reject);
    }

    /**
     * [push description]
     * @param  {[type]} intent  [description]
     * @param  {[type]} model   [description]
     * @param  {[type]} resolve [description]
     * @param  {[type]} reject  [description]
     * @return {[type]}         [description]
     */
    push(intent, model, resolve, reject) {
        this.request(intent, model, resolve, reject);
    }
}
