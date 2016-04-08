"use strict";

// Third-party imports
import chai, {
    expect
}
from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";

// Nexus imports
import Nexus from "~/nexus";
import CODES from "~/error/codes";
import { IllegalArgumentException } from "~/error/exceptions";

chai.use(sinonChai);
chai.config.includeStack = true;

/**
 * Main test file. Ensures that index.js can be called and nexus is created
 * and started correctly
 */

/**
 * TODO
 * 1. The default.json file should have no additional logging defined. We need to first fix that
 *    then create tests that verify several logging configurations.
 *    After these tests, ALL tests should log to a test log.
 * 2. Test creating logging resources dirs automatically (i.e. logs/ for file logging)
 * 3. Create tests that verify various logging configurations, including:
 *     - Loading configs based on environment type (NODE_ENV)
 *     - Loading different config file types
 *     - Loading instance configurations (based on, say hostname)
 *     - Syslog
 *     - NewRelic
 *     - Environment variable overrides
 *    For this we will need to:
 *     a) Ensure that our logging library doesn't load all files available, but can conditionally
 *        load based on certain environmental influencers
 *     b) Centralize our app-level configuration in a extensible manner
 *        (i.e. right now setting 'root' back to the config object is sketchy)
 * 4. Expose 500 errors (i.e. causing unexpected faults in the code that yeild 500 errors)
 *     NOTE: this would probably be an advance functionality since this will require randomized testing
 * 5. Test the ability to attach contollers
 * 6. Test the ability to add middleware
 * 7. Test HTTPS (default is HTTP - see default.json)
 * 8. Test Websockets
 */

describe("Core server functionality", function() {

    before(function() {
        this.nexus = new Nexus();
    });

    after(function() {
        if (this.nexus) {
            this.nexus.destroy();
        }
    });

    it("tests that nexus can be started successfully", function() {
        expect(this.nexus).not.to.be.undefined;
    });

    describe("Controller tests", function() {

        describe("Correct tests", function() {

            it("tests listing all available attached middleware when no middleware is being used", function() {
                expect(this.nexus.inspect("all")).to.deep.equal([]);
            });
        });

        describe("Error tests", function() {

            it("verifies that an IllegalArgumentException is thrown when inspecting a controller that has not been defined", function() {
                let e = new IllegalArgumentException(CODES.NOT_FOUND, "middleware", "foo");
                expect(() => {
                    this.nexus.inspect("foo");
                }).to.throw('Could not find middleware (value: \'foo\')');
            });
        });
    });
});
