"use strict";

/**
 * Core & Application-specific exception code enums
 */

const DEFAULT_MESSAGE = "An error occurred while processing your request";
const DEFAULT_ERROR_CODE = 0;
const DEFAULT_HTTP_ERROR_STATUS = 500;
const CODES = {
	DEFAULT: {
		code: 0,
		status: 500,
		message: function(arg) {
			return "This is a very unhelpful error message...apparently something bad happened. Please contact your "
					+ "Systems Administrator for more information"
					+ ((arg != null) ? (". (" + arg + ")") : ".");
		}
	},
	ILLEGAL_ARGUMENT: {
		code: 1,
		status: 400,
		message: function(arg1, arg2) {
			return "Illegal argument '"
					+ arg1
					+ "'"
					+ ((arg2 != null) ? (". " + arg2) : ".");
		}
	},
	REQUIRED_PARAMETER: {
		code: 2,
		status: 400,
		message: function(arg) {
			return arg + " is required.";
		}
	},
	INVALID_TYPE: {
		code: 3,
		status: 400,
		message: function(arg1, arg2) {
			return arg1 + " must be of type " + arg2;
		}
	},
	UNEXPECTED_VALUE: {
		code: 4,
		status: 500,
		message: function(variable, expected, actual) {
			return "'" + variable + "'" +
				   (
						expected != null ?
						": Expected '" + expected + "'; found '" + actual + "' instead" :
						" contains unexpected value: " + actual
					);
		}
	},
	NOT_FOUND: {
		code: 5,
		status: 400,
		message: function(name, value) {
			return "Could not find " + name + " (value: '" + value + "')";
		}
	},
	ILLEGAL_STATE: {
		code: 6,
		status: 500,
		message: function(expected, actual) {
			return "Invalid state. Expected to be in state " + expected + ", but is is " + actual;
		}
	},
	UNEXPECTED_STATE: {
		code: 6,
		status: 500,
		message: function(expected, actual) {
			return "Invalid state. Expected to not be in state " + expected;
		}
	},
	DUPLICATE_CONTROLLER: {
		code: 50,
		status: 400,
		message: function(name) {
			return "Controller '" + name + "' is already attached"
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
		message: function(arg1, arg2) {
			return arg1 + " must be a valid service name" + (arg2 != null ? " (" + arg2 + ")" : "");
		}
	},
	METHOD_NOT_SUPPORTED: {
		code: 102,
		status: 404,
		message: function(method, url, name) {
			return "Method '"
					+ method
					+ "' for url '"
					+ url
					+ "' is not supported by the service '"
					+ name
					+ "'.";
		}
	}
};

export { DEFAULT_MESSAGE };
export { DEFAULT_ERROR_CODE };
export { DEFAULT_HTTP_ERROR_STATUS };
export default CODES;
