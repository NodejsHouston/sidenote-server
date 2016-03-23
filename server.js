var path = require('path');
var async = require('async');
var r = require('rethinkdb');
var config = require(path.join(__dirname, 'config.js'));

global.rootRequire = function(name) {
  var projectPath = path.join(__dirname, name);
  return require(projectPath);
};

var Hapi = require('hapi');

// Create a new server
var server = new Hapi.Server();

function startHapi(connection) {
  server.connection({
    port: parseInt(process.env.PORT, 10) || 3000,
    host: 'localhost'
  });

  server._rdbConn = connection;

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
    }
  ], function() {
    server.start(function() {
      console.log('Server started at: ' + server.info.uri);
    });
  });
}

async.waterfall([
  function connect(callback) {
    r.connect(config.rethinkdb, callback);
  },

  function createDatabase(connection, callback) {
    // Create the database if needed.
    r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
      return r.branch(
        containsDb,
        {created: 0},
        r.dbCreate(config.rethinkdb.db)
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },

  function createTable(connection, callback) {
    // Create the table if needed.
    r.tableList().contains('messages').do(function(containsTable) {
      return r.branch(
        containsTable,
        {created: 0},
        r.tableCreate('messages')
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },

  function createIndex(connection, callback) {
    // Create the index if needed.
    r.table('messages').indexList().contains('createdAt')
      .do(function(hasIndex) {
        return r.branch(
          hasIndex,
          {created: 0},
          r.table('messages').indexCreate('createdAt')
        );
      }).run(connection, function(err) {
        callback(err, connection);
      });
  },

  function waitForIndex(connection, callback) {
    // Wait for the index to be ready.
    r.table('messages')
      .indexWait('createdAt')
      .run(connection, function(err, result) {
        callback(err, connection);
      });
  }

], function(err, connection) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  // Setup the server with a host and port
  startHapi(connection);
});

// Export the server to be required elsewhere.
module.exports = server;
