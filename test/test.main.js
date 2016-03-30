"use strict";

import chai, {
    expect
}
from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";
import Nexus from "~/main";
import Services from "~/services/services";

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

    after(function(done) {
        if (this.nexus) {
            this.nexus.destroy(done);
        } else {
            done();
        }
    });

    it("tests that nexus can be started successfully", function(done) {
        expect(this.nexus).not.to.be.undefined;
        this.nexus.run(() => {
            expect(this.nexus).not.to.be.undefined;
            done();
        });
    });

    describe("Network tests", function() {

        describe("Correct tests", function() {

            it("tests listing all available attached controllers", function(done) {
                this.nexus.attach("services", Services);
                request.get(this.nexus.address + "/describe", (error, response, body) => {
                    expect(response.statusCode).to.equal(200);
                    let msg = JSON.parse(body);
                    expect(msg).to.have.property("controllers");
                    expect(error).to.be.null;
                    done();
                });
            });
        });

        describe("Error tests", function() {

            it("tests a 404 error", function(done) {
                request.get(this.nexus.address + "/foo", (error, response, body) => {
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });

            it("tests a 400 error", function(done) {
                request.get(this.nexus.address + "/describe/foo", (error, response, body) => {
                    expect(response.statusCode).to.equal(400);
                    let msg = JSON.parse(body);
                    expect(msg).to.have.property("code").to.equal(5);
                    done();
                });
            });
        });
    });
});
