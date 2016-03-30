var r = require('rethinkdb');
var Boom = require('boom');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'GET',
      path: '/messages/{id?}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            r.table('messages')
              .get(req.params.id)
              .run(req.server._rdbConn, function(err, result) {
                if (err) {
                  return reply(Boom.badImplementation(err));
                }
                return reply(result);
              });
          } else {
            r.table('messages')
            .run(req.server._rdbConn, function(err, result) {
              if (err) {
                return reply(Boom.badImplementation(err));
              }
              result.toArray(function(error, arrayResult) {
                if (error) {
                  return reply(Boom.badImplementation(error));
                }
                return reply(arrayResult);
              });
            });
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/messages',
      config: {
        handler: function(req, reply) {
          var message = Object.assign(req.payload,
                                      {createdAt: new Date()});

          r.table('messages')
            .insert(message, {returnChanges: true})
            .run(req.server._rdbConn, function(err, result) {
              if (err) {
                return reply(Boom.badImplementation(err));
              }
              return reply(result.changes[0].new_val);
            });
        }
      }
    },
    {
      method: 'DELETE',
      path: '/messages/{id}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            r.table('messages')
              .get(req.params.id)
              .delete({returnChanges: true})
              .run(req.server._rdbConn, function(err, result) {
                if (err) {
                  return reply(Boom.badImplementation(err));
                }
                return reply(result);
              });
          } else {
            return reply(Boom.badImplementation());
          }
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'messages'
};
