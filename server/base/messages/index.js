// messages routes for default index/root path
exports.register = function(server, options, next){

var messagesData = rootRequire('server/data/messages/index.json');

    server.route([
        {
            method: 'GET',
            path: '/messages/{id?}',
            config: {
                handler: function(req, reply) {
				  if (req.params.id) {
                    var messageIndex = -1;
                    for (var i=0; i < messagesData.length; i++) {
                        if (messagesData[i].messageID === req.params.id) {
                            messageIndex = i;
                        }
                    }
				    if (messageIndex<0) return reply('No message found.').code(404);
				    return reply(messagesData[messageIndex]);
				  }
				  reply(messagesData);
				}
            }
        },
        {
            method: 'POST',
            path: '/messages/',
            config: {
              handler: function(req, reply) {
			    var newQuote = { author: req.payload.author, text: req.payload.text };
			    messagesData.push(newQuote);
			    reply(newQuote);
			  }
            }
        },
        {
            method: 'DELETE',
            path: '/messages/{id}',
            config: {
              handler: function(req, reply) {
			    if (messagesData.length <= req.params.id) return reply('No quote found.').code(404);
			    messagesData.splice(req.params.id, 1);
			    reply(true);
			  }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'messages'
};