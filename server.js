var path = require('path');


global.rootRequire = function(name) {
  var projectPath = path.join(__dirname, name);
  return require(projectPath);
};

var Hapi = require('hapi');

// Create a new server
var server = new Hapi.Server();

// Setup the server with a host and port
server.connection({
  port: parseInt(process.env.PORT, 10) || 3000,
  host: 'localhost'
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
    register: require("good"),
    options: {
      opsInterval: 5000,
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  },
  {
    register: require('./server/base/index.js')
  },
  {
    register: require('./server/base/messages/index.js')
  },
  {
    register: require('./server/socket/index.js')
  }
], function() {
  server.start(function() {
    console.log('Server started at: ' + server.info.uri);
  });
});
