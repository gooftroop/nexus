"use strict";

import chai, {
    expect
}
from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";
import Nexus from "~/nexus";

import RemoteRestService from "~/../test/resources/services/remoteRestService";

chai.use(sinonChai);
chai.config.includeStack = true;

const TEST_PORT = 8081;

/**
 * TODO
 * 1. Figure out how to handler services with the same name
 *    (i.e. how do we deal with multiple services behind a load balancers)
 * 2. Allow nested registering of services - that is, be able to register under a domain
 * 3.
 */

// var nexus;

describe("Services", function() {


    // before(function(done) {
    //     this.nexus = new Nexus();
    //     this.nexus.run(done);
    // });

    // after(function(done) {
    //     if (this.nexus) {
    //         this.nexus.destroy(done);
    //     } else {
    //        done();
    //    }
    // });

    it("tests that a Service controller is attached to a running Nexus instance", function() {});
    it("tests that an API with a name can be defined on the Service Controller", function() {});
    it("tests that the same API with a name can be removed from the Service Controller", function() {});
    it("tests that an API without a name can be defined on the Service Controller", function() {});
    it("tests that the same API without a name can be removed from the Service Controller", function() {});
    it("tests registering multiple APIs under the same name", function() {});
    it("tests removing a single API from an API swarm", function() {});
    it("tests removing all APIs from an API swarm by using the API name", function() {});
});
