
var testdata = require('../../testdata')

exports.register = function(server, options, next) {
	var io = require('socket.io')(server.listener);
	io.on('connection', function (socket) {

  //Triggered when recieve new message from client side
  socket.on('newMessage',function(newMessage){
    socket.broadcast.emit('new:message',newMessage);

    //add new message to old message group
    testdata.messages.old.push(newMessage);

  });

  //Triggered when the user change pseduo username 
  socket.on('newName',function(odata){
    socket.broadcast.emit('change:name',odata);
    
    //Replace user's username with new name on server side
    testdata.profiles[odata.id].username = odata.newName;
  });

  //Triggered when new user join in the chatroom
  socket.on('Iamin',function(){
    //Generate userID (switch to using uuid generater lib later) 
    var id = 'u'+((new Date()).getTime().toString());
    
    //Mock profile data
    testdata.profiles[id]={gender:'male',name:'new user',location:'Houston',email:'aallen@blazinweb.com',username:id,img:'https://i0.wp.com/slack.global.ssl.fastly.net/7fa9/img/avatars/ava_0012-512.png?ssl=1'};
    testdata.id=id;

    //trigger 'init' event on the calling user, and send (userlist, messagelist and userid) for inialization
    socket.emit('init',testdata);

    //trigger 'user:join' event on other client, and send new userlist
    socket.broadcast.emit('user:join',testdata);
  });
});
	next();
}

exports.register.attributes = {
  name: 'socket'
};

