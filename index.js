"use strict";

import Nexus from "app/nexus.js";

/**
 * Nexus server entry & initialization
 */

// TODO read from a configuration file
// TODO make configuration file available to all services? i.e. through an API?
// TODO logging
// TODO compression?
// TODO An easy way to add middleware without modifying this file?
// TODO a reply function like hapi?
//
// when someone creates a service, they should be responsible for defining
// what the API is and keep that definition in the service (they should not
// update this file). Somehow we have to discover these serivces and load
// their router defs
//
// who provides the functionality
// where it lives on the network
// what it depends on
//
// Rather than relying on the server registering these services,
// each service should publish it's API to the server when it
// starts - all it needs is the URL the server is subscribed to.
// Question is...how do I go about doing this?
// 1. Setup an API to register itself & publish its API & set status
// 2. When a service registers, create a Service model in the registry
// 3. Register API:
// {
// 		name: STRING,
// 		url: STRING (Service's URL root)
// 		api?
// }

// options can be supplied from command line...
let app = new Nexus();
app.run();