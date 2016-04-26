var path = require('path');
var config = require(path.join(__dirname, 'config.js'));

var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
  port: parseInt(process.env.PORT, 10) || 3000,
  host: 'localhost'
});

// Export the server to be required elsewhere.
module.exports = server;

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
    register: require('./models')
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

// Export the server to be required elsewhere.
module.exports = server;
