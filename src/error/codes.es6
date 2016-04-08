"use strict";

/**
 * Core & Application-specific exception code enums
 */

const DEFAULT_MESSAGE = "An error occurred while processing your request";
const DEFAULT_ERROR_CODE = 0;
const DEFAULT_HTTP_ERROR_STATUS = 500;
const CODES = {
	// GENERAL EXCEPTIONS
	DEFAULT: {
		code: 0,
		status: 500,
		message: function(arg) {
			return "This is a very unhelpful error message...apparently something bad happened. Please contact your " +
				   "Systems Administrator for more information" +
				   ((arg != null) ? (". (" + arg + ")") : ".");
		}
	},
	ILLEGAL_ARGUMENT: {
		code: 1,
		status: 400,
		message: function(arg1, arg2) {
			return "Illegal argument '" +
			arg1 +
			"'" +
			((arg2 != null) ? (". " + arg2) : ".");
		}
	},
	REQUIRED_PARAMETER: {
		code: 2,
		status: 400,
		message: function(arg) {
			return arg + " is required";
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
					" contains unexpected value" + (actual != null ? + ": '" + actual + "'" : "")
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
	NOT_YET_IMPLEMENTED: {
		code: 7,
		status: 500,
		message: function(name) {
			return "Extend error: '" + name + "'' is not implemented";
		}
	},
	// MIDDLEWARE EXCEPTIONS
	DUPLICATE_MIDDLEWARE: {
		code: 50,
		status: 500,
		message: function(name) {
			return "Middleware '" + name + "' is already attached";
		}
	},
	INVALID_MIDDLEWARE: {
		code: 51,
		status: 500,
		message: function(name) {
			return "'" + name + "' must be a class instance";
		}
	},
	// SERVICE EXCEPTIONS
	SERVICE_NOT_FOUND: {
		code: 100,
		status: 404,
		message: function(arg) {
			return "Service '" + arg + "' was not found";
		}
	},
	ILLEGAL_SERVICE_NAME: {
		code: 101,
		status: 400,
		message: function(arg1, arg2) {
			return arg1 + " must be a valid service name" + (arg2 != null ? " (" + arg2 + ")" : "");
		}
	},
	SERVICE_ALREADY_DEFINED: {
		code: 102,
		status: 500,
		message: function(name) {
			return "Service '" + name + "'' is already defined";
		}
	},
	ILLEGAL_ACTION: {
		code: 103,
		status: 400,
		message: function(action) {
			return "Invalid action. Cannot register service for action '" +
				typeof(action) +
				"'. Action must either be a String, Array, or Object";
		}
	},
	IMPROPERLY_CONFGIURED_HTTP_ACTION: {
		code: 104,
		status: 400,
		message: function() {
			return "Provided action is configured incorrectly. If providing an action as an object or array of " +
				   "objects, the object must be in the form of '{ action: ..., method: ...}'";
		}
	},
	INVALID_URI: {
		code: 105,
		status: 400,
		message: function(uri) {
			return "Invalid remote service uri: " + uri;
		}
	},
	ACTION_NOT_SUPPORTED: {
		code: 106,
		status: 400,
		message: function(action, name) {
			return "Action '" + action + "' is not supported for service '" + name + "'";
		}
	},
	HTTP_METHOD_NOT_SUPPORTED: {
		code: 107,
		status: 400,
		message: function(method, name) {
			return "HTTP Method '" + method + "' is not supported for service '" + name + "'";
		}
	},
	MISSING_REQUEST_PARAMETER: {
		code: 108,
		status: 400,
		message: function(param) {
			return "Invalid request: Missing request parameter '" + param + "'";
		}
	},
	MISSING_BODY_PARAMETER: {
		code: 109,
		status: 400,
		message: function(param) {
			return "Invalid request: Missing body parameter '" + param + "'";
		}
	},
	INVALID_ADAPTER: {
		code: 110,
		status: 500,
		message: function(name) {
			return "Invalid adapter for registration: no adapter name was found";
		}
	},
	ADAPTER_NOT_DEFINED: {
		code: 111,
		status: 500,
		message: function() {
			return "An adapter has not been defined for the model. Did you foget to call 'adapter()'?";
		}
	},
	MISSING_REGISTRY: {
		code: 112,
		status: 500,
		message: function() {
			return "No Registry has been configured. Did you forget to call 'setRegistry()'?";
		}
	},
	// REGISTRY EXCEPTIONS
	MISSING_ADAPTER: {
		code: 200,
		status: 500,
		message: function(name) {
			return "Adapter '" + name + "' has not been registered";
		}
	},
	// INTENT EXCEPTIONS
	INVALID_INTENT: {
		code: 300,
		status: 400,
		message: function() {
			return "Invalid intent '" + intent + "'";
		}
	}
};

export {
	DEFAULT_MESSAGE
};
export {
	DEFAULT_ERROR_CODE
};
export {
	DEFAULT_HTTP_ERROR_STATUS
};
export default CODES;
