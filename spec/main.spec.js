"use strict";

/**
 * Main test file. Ensures that index.js can be called and nexus is created
 * and started correctly
 */

import Nexus from "app/server/nexus.js";

describe("main entry and startup test", () => {
	it("tests that nexus can be instantiated successfully", () => {
		// TODO can we import dynamically at this level?
		let nexus = Nexus();
	});
});