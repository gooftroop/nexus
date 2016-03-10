"use strict";

import chai, {
    expect
}
from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";
import Nexus from "~/main";

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

    beforeEach(function(done) {
        this.nexus = new Nexus();
        this.nexus.run(() => {
            this.BASE_SERVICES_URL = this.nexus.address + "/services";
            this.SERVICES_REGISTER_URL = this.BASE_SERVICES_URL + "/register/";
            this.SERVICES_UNREGISTER_URL = this.BASE_SERVICES_URL + "/unregister/";
            done();
        });
    });

    afterEach(function(done) {
        if (this.nexus) {
            this.nexus.destroy(done);
        }
    });

    describe("Local Services", function() {
        describe("Zero-conf", function() {});
        describe("Explicitly bound", function() {});
    });

    describe("Remote Services", function() {

        describe("Service's REST API", function(done) {

            // TODO push nexus onto polo and change test
            it("tests that '/services' returns an empty result when no services have been registered", function(done) {
                request.get({
                    method: "GET",
                    json: true,
                    uri: this.BASE_SERVICES_URL
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    // expect(body).to.deep.equal([{
                    //     "name": "nexus",
                    //     "paths": {},
                    //     "url": "192.168.246.152:8080"
                    // }]);
                    expect(body).to.deep.equal([]);
                    done();
                });
            });

            // Omitting an API
            it("tests registering a service without publishing an API", function(done) {
                let service = new RemoteRestService(TEST_PORT);
                request({
                    method: "POST",
                    json: true,
                    uri: this.SERVICES_REGISTER_URL + service.name
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("tests getting information about that service through the proxy", function() {});
            it("tests calling GET on that service through the proxy", function() {});
            it("tests calling POST on that service through the proxy", function() {});
            it("tests calling PUT on that service through the proxy", function() {});
            it("tests calling DELETE on that service through the proxy", function() {});
            it("tests unregistering a service", function() {});

            // Publishing an API
            it("tests registering a service and publishing an API", function() {});
            it("tests getting information about that service throug hthe proxy", function() {});
            it("tests calling GET on that service through the proxy", function() {});
            it("tests calling POST on that service through the proxy", function() {});
            it("tests calling PUT on that service through the proxy", function() {});
            it("tests calling DELETE on that service through the proxy", function() {});
            it("tests unregistering a service", function() {});
        });
    });
});
