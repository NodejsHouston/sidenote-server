'use strict';
global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
}
/**
* Dependencies.
*/
const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const Hoek = require('hoek');

// Create a new server
const server = new Hapi.Server();

// Setup the server with a host and port
server.connection({
    port: parseInt(process.env.PORT, 10) || 3000,
    host: 'localhost'
});

// Setup the views engine and folder
server.register(require('vision'), (err) => {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: require('swig')
        },
        relativeTo: __dirname,
        path: './server/views'
    });
});

// Export the server to be required elsewhere.
module.exports = server;

/*
    Load all plugins and then start the server.
    First: community/npm plugins are loaded
    Second: project specific plugins are loaded
 */
server.register([
    {
        register: Inert
    },
    {
        register: require("good"),
        options: {
            opsInterval: 5000,
            reporters: [{
                reporter: require('good-console'),
                events:[{ ops: '*', request: '*', log: '*', response: '*', 'error': '*' }]
            }]
        }
    },
    {
        register: require("hapi-named-routes")
    },
    {
        register: require("hapi-cache-buster")
    },
    {
        register: require('./server/assets/index.js')
    },
    {
      register: require('./server/base/index.js')
    },
    {
      register: require('./server/base/messages/index.js')
    }
], function () {
    //Start the server
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
