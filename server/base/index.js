var Boom = require('boom');

// Base routes for default index/root path, about page, 404 error pages, and others..
exports.register = function(server, options, next){

    server.route([
        {
            method: 'GET',
            path: '/',
            config: {
                handler: function(request, reply){
                    reply(Boom.notFound());
                },
                id: 'index'
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'base'
};
