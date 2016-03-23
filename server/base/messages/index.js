var r = require('rethinkdb');
var Boom = require('boom');

// messages routes for default index/root path, about page, 404 error pages, and others..
exports.register = function(server, options, next) {
  var messagesData = rootRequire('server/data/messages/index.json');

  server.route([
    {
      method: 'GET',
      path: '/messages/{id?}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            if (messagesData.length <= req.params.id) {
              return reply('No message found.').code(404);
            }
            return reply(messagesData[req.params.id]);
          }
          reply(messagesData);
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
          console.log(message);

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
          if (messagesData.length <= req.params.id) {
            return reply('No quote found.').code(404);
          }
          messagesData.splice(req.params.id, 1);
          reply(true);
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'messages'
};
