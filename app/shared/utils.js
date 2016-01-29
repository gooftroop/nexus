"use strict";

import _ from "lodash";

export function ensureForwardSlash(string) {
	return _.startswith(string, "/") ? string :  (string : "/" + string);
}