"use strict";

/**
 * Core & Application-specific exception code enums
 */

const DEFAULT_MESSAGE = "";
const DEFAULT_ERROR_CODE = 0;
const DEFAULT_HTTP_ERROR_STATUS = 500;

const CODES = {
	DEFAULT: {
		code: 0,
		status: 500,
		message: function(arg) {
			return "This is a very unhelpful error message...apparently something bad happened. Please contact your " +
					"Systems Administrator for more information" + (arg != null) ? ". (" + arg + ")" : ".";
	},
	ILLEGAL_ARGUMENT: {
		code: 1,
		status: 400,
		message: function(arg1, arg2) {
			return "Illegal argument '" + arg1 + "'" + (arg2 != null) ? ". " + arg2 : ".";
		}
	},
	REQUIRED_PARAMETER: {
		code: 2,
		status: 400,
		message: fucntion(arg) {
			return arg + " is required.";
		}
	},
	INVALID_TYPE: {
		code: 3,
		status: 400,
		message: function(arg1, arg2) {
			return  arg1 " must be of type " + arg2;
		}
	},
	SERVICE_NOT_FOUND: {
		code: 100,
		status: 404,
		message: function(arg) {
			return "Service '" + arg + "' was not found.";
		}
	},
	ILLEGAL_SERVICE_NAME: {
		code: 101,
		status: 400,
		message: function(arg) {
			return arg + " must be a valid service name";
		}
	}
};

export default CODES;
export DEFAULT_MESSAGE;
export DEFAULT_ERROR_CODE;
export DEFAULT_HTTP_ERROR_STATUS;