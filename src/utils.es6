"use strict";

import _ from "lodash";
import config from "config";
import path from "path";

const BEGIN_VARIABLE_DELIM = "{";
const END_VARIABLE_DELIM = "}";
const VARIABLE_REGEX = new RegExp(
    "(\\" +
    BEGIN_VARIABLE_DELIM +
    "[^\\" +
    BEGIN_VARIABLE_DELIM +
    "]+\\" +
    END_VARIABLE_DELIM +
    ")", "g");

/**
 * [ensureForwardSlash description]
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
export function ensureForwardSlash(string) {
    return _.startswith(string, "/") ? string : ("/" + string);
}

export function resolveVariables(string) {
    let i, len, variables, variable, cleanedVariable, value;

    // Check the string for any variable
    // A variable beings with { and ends with }
    variables = VARIABLE_REGEX.exec(string);
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
