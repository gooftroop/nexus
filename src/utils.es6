"use strict";

// Third-party imports
import _ from "lodash";
import path from "path";
import config from "config";

// App imports
import Logger from "~/logger";
import { DEFAULT_HTTP_ERROR_STATUS } from "~/error/codes";
import HttpException from "~/error/exceptions";

// Constants
const BEGIN_VARIABLE_DELIM = "{";
const END_VARIABLE_DELIM = "}";
const VARIABLE_REGEX = new RegExp(
    "(\\" +
    BEGIN_VARIABLE_DELIM +
    "[^\\" +
    BEGIN_VARIABLE_DELIM +
    "]+\\" +
    END_VARIABLE_DELIM +
    ")", "gmi");

/**
 * [ensureLeadingSlash description]
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
export function ensureLeadingSlash(string) {
    return _.startswith(string, "/") ? string : ("/" + string);
}

/**
 * [resolveVariables description]
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
export function resolveVariables(string) {
    let i,
        len,
        variables,
        variable,
        cleanedVariable,
        value;

    // Check the string for any variable
    // A variable beings with { and ends with }
    variables = VARIABLE_REGEX.exec(string);

    // Reset the REGEX object
    VARIABLE_REGEX.lastIndex = 0;

    if (variables == null) {
        return string;
    }

    len = variables.length;

    for (i = 1; i < len; i++) {
        variable = variables[i];
        cleanedVariable = variable.replace(BEGIN_VARIABLE_DELIM, "").replace(END_VARIABLE_DELIM, "");
        value = config.get(cleanedVariable);
        string = string.replace(variable, value);
    }
    return string;
}

/**
 * [resolvePath description]
 * @param  {[type]} _path [description]
 * @param  {[type]} root  [description]
 * @return {[type]}       [description]
 */
export function resolvePath(_path, root) {
    let index, end, variable, value;
    if (root == null) {
        root = config.root;
    }

    // CHeck the path for any variable
    _path = resolveVariables(_path)

    // If the _path does not begin with './' or '/', then the
    // _path is intended to be the absolute path from the provided
    // root. Update _path to be the absolute path
    if (!_path.match(/^\.?\/.*$/i)) {
        _path = path.join(root, _path);
    }
    return _path;
}

/**
 * [sendHttpError description]
 * @param  {[type]} err [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
export function sendHttpError(err, res) {
    // TODO Why do we have to ref 'default' here, but not in other files???
    let logger = Logger.default.getLogger("nexus"),
        status = DEFAULT_HTTP_ERROR_STATUS,
        report = ": " + err.message,
        msg = {
            message: err.message
        };

    if (err instanceof HttpException || _.has(err, "status")) {
        status = err.status;
        msg.code = err.code;
        report = " -- (CODE: " + err.code + "; STATUS: " + status + ") " + report;
    }

    // TODO short-circuit this statement if in PRODUCTION mode. Don't leak stacks in production
    // but...allow that to be configurable
    if (_.has(err, "stack")) {
        report += (". STACK:\n" + err.stack);
    }

    logger.error("Error" + report);
    res.status(status).send(msg);
}
