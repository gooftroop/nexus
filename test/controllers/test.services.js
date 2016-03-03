"use strict";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "request";

describe("Services", function() {

    describe("Local Services", function() {
        describe("Zero-conf", function() {});
        describe("Explicitly bound", function() {});
    });

    describe("Remote Services", function() {
        describe("Service's REST API", function() {

            // Omitting an API
            it("tests registering a service without publishing an API", function() {

            });
            it("tests getting information about that service throug hthe proxy", function() {});
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
