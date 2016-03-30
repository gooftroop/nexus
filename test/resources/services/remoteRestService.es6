import Hapi from "hapi";

export default class RemoteRestService {

    constructor(port) {
        this.name = "remote-rest-service";
        this.server = new Hapi.Server();
        this.server.connection({
            host: "localhost",
            port: port
        });

        this.server.route({
            method: 'GET',
            path: '/test/{name}',
            handler: function(request, reply) {
                let name = encodeURIComponent(request.params.name);
                return reply("GET: " + name);
            }
        });

        this.server.route({
            method: 'POST',
            path: '/test',
            handler: function(request, reply) {
                let name = request.payload.name;
                return reply("POST: " + name);
            }
        });

        this.server.route({
            method: 'PUT',
            path: '/test',
            handler: function(request, reply) {
                let name = request.payload.name;
                return reply("PUT: " + name);
            }
        });

        this.server.route({
            method: 'DELETE',
            path: '/test/{name}',
            handler: function(request, reply) {
                let name = encodeURIComponent(request.params.name);
                return reply("DELETE: " + name);
            }
        });
    }

    uri() {
        return this.server.info.uri;
    }

    start() {
        this.server.start((err) => {
            if (err) {
                throw err;
            }
        });
    }

    stop() {
        this.server.stop();
    }
}
