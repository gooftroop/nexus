"use strict";

// Third-party imports
import chai, {
    expect
}
from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";

// Nexus Imports
import Nexus from "~/nexus";
import RESTService from "~/middleware/services/api/rest";
import LocalRegistry from "~/middleware/services/registry/localRegistry";

// Test imports
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

describe("REST Service", function() {

    before(function() {

        // Build the Nexus app
        this.nexus = new Nexus();
        let restServices = new RESTService(new LocalRegistry());
        this.nexus.use("rest", restServices);
        restServices.run();

        this.BASE_SERVICES_URL = restServices.address + "/rest";
        this.SERVICES_INFO_URL = this.BASE_SERVICES_URL + "/info/";
        this.SERVICES_REGISTER_URL = this.BASE_SERVICES_URL + "/register/";
        this.SERVICES_UNREGISTER_URL = this.BASE_SERVICES_URL + "/unregister/";
    });

    after(function() {
        if (this.nexus) {
            this.nexus.destroy();
        }
    });

    describe("without publishing actions", function() {

        let service;

        before(function() {
            service = new RemoteRestService(TEST_PORT);
        });

        // TODO push nexus onto polo and change test
        it("tests that 'info' returns an empty result when no services have been registered", function(done) {
            request.get({
                json: true,
                uri: this.SERVICES_INFO_URL
            }, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.deep.equal([]);
                done();
            });
        });

        // Omitting Actions
        it("tests registering a service without providing actions", function(done) {
            request({
                method: "POST",
                json: true,
                uri: this.SERVICES_REGISTER_URL + service.name,
                body: {
                    uri: service.uri(),
                    options: {
                        json: true
                    }
                }
            }, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it("tests getting info about that service through the proxy", function(done) {
            request.get({
                json: true,
                uri: this.SERVICES_INFO_URL + service.name
            }, function(error, response, body) {
                expect(body).to.not.be.undefined;
                expect(body).to.have.property("name").to.equal(service.name);
                expect(body).to.have.property("actions").to.deep.equal({});
                expect(body).to.have.property("uri").to.equal(service.uri());
                done();
            });
        });

        it("tests calling a Http Method on that service when the service has not been started", function(done) {
            request.get({
                json: true,
                uri: this.BASE_SERVICES_URL + "/" + service.name + "/test/foo"
            }, function(error, response, body) {
                expect(response.statusCode).to.equal(500);
                expect(body).to.have.property("code").to.equal("ECONNREFUSED");
                done();
            });
        });

        describe("making successful HTTP requests", function() {

            before(function() {
                service.start();
            });

            after(function() {
                service.stop();
            });

            it("tests sucessfully calling GET on that service through the proxy", function(done) {
                request.get({
                    json: true,
                    uri: this.BASE_SERVICES_URL + "/" + service.name + "/test/foo"
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("GET: foo");
                    done();
                });
            });

            it("tests sucessfully calling POST on that service through the proxy", function(done) {
                request.post({
                    json: true,
                    uri: this.BASE_SERVICES_URL + "/" + service.name + "/test",
                    body: {
                        name: "foo"
                    }
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("POST: foo");
                    done();
                });
            });

            it("tests sucessfully calling PUT on that service through the proxy", function(done) {
                request.put({
                    json: true,
                    uri: this.BASE_SERVICES_URL + "/" + service.name + "/test",
                    body: {
                        name: "foo"
                    }
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("PUT: foo");
                    done();
                });
            });

            it("tests sucessfully calling DELETE on that service through the proxy", function(done) {
                request.del({
                    json: true,
                    uri: this.BASE_SERVICES_URL + "/" + service.name + "/test/foo"
                }, function(error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("DELETE: foo");
                    done();
                });
            });

        });

        it("tests unregistering the service", function() {});
    });

    describe("with publishing actions", function() {

        // Publishing a Actions
        it("tests registering a service and providing actions", function() {});
        it("tests getting information about that service through the proxy", function() {});
        it("tests calling GET on that service through the proxy with a valid action", function() {});
        it("tests calling POST on that service through the proxy with a valid action", function() {});
        it("tests calling PUT on that service through the proxy with a valid action", function() {});
        it("tests calling DELETE on that service through the proxy with a valid action", function() {});
        it("tests calling GET on that service through the proxy with an invalid action", function() {});
        it("tests calling POST on that service through the proxy with an invalid action", function() {});
        it("tests calling PUT on that service through the proxy with an invalid action", function() {});
        it("tests calling DELETE on that service through the proxy with an invalid action", function() {});
        it("tests unregistering the service", function() {});
    });
});
