var path = require('path');
var db = require(path.join(path.dirname(require.main.filename), 'models'));

var Boom = require('boom');
var _ = require('lodash');

exports.register = function(server, options, next) {
  var User = db.model('User');

  server.route([
    {
      method: 'GET',
      path: '/users/{id?}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            User.find(req.params.id, function(err, user) {
              if (err) {
                return reply(Boom.badImplementation(err));
              }
              if (_.isEmpty(user)) {
                return reply(Boom.notFound());
              }
              return reply(user);
            });
          } else {
            // Alternative: use native r methods
            User.r.run()
              .then(function(users) {
                return reply(users);
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
      path: '/users',
      config: {
        handler: function(req, reply) {
          User.create(req.payload, function(err, newUser) {
            if (err) {
              return reply(Boom.badImplementation(err));
            }
            return reply(newUser);
          });
        }
      }
    },
    {
      method: 'DELETE',
      path: '/users/{id}',
      config: {
        handler: function(req, reply) {
          if (req.params.id) {
            User.remove(req.params.id, function(err, result) {
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
  name: 'users'
};
