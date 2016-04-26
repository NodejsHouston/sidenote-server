var path = require('path');
var db = require(path.join(path.dirname(require.main.filename), 'models'));

var Boom = require('boom');
var _ = require('lodash');

exports.register = function(server, options, next) {
  var Message = db.model('Message');

  server.route([
    {
      method: 'GET',
      path: '/messages/{id?}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            Message.find(req.params.id, function(err, message) {
              if (err) {
                return reply(Boom.badImplementation(err));
              }
              if (_.isEmpty(message)) {
                return reply(Boom.notFound());
              }
              return reply(message);
            });
          } else {
            // Alternative: use native r methods
            Message.r.run()
              .then(function(messages) {
                return reply(messages);
              })
              .error(function(err) {
                return reply(Boom.badImplementation(err));
              })
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/messages',
      config: {
        handler: function(req, reply) {
          Message.create(req.payload, function(err, newMessage) {
            if (err) {
              return reply(Boom.badImplementation(err));
            }
            return reply(newMessage);
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
            Message.remove(req.params.id, function(err, result) {
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
