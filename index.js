var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen(port, function(){
  console.log('listening on *:' + port);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));

const crypto = require('crypto');
	
var easyHash = function(data, algo){
	const hash = crypto.createHash(algo);

	hash.update(data);
	return hash.digest('hex');
	hash.end();
	};
	

var SOCKET_LIST = {};

io.on('connection', function(socket){
	var timeStamp = "" + Date.now();
    socket.id = easyHash((timeStamp + (Math.random()).toString().slice(2,13)), 'sha1');
    SOCKET_LIST[socket.id] = socket;
	socket.on('key', function(data) {
		socket.key = data;
		for (i in SOCKET_LIST) {
			if (SOCKET_LIST[i].id != socket.id && SOCKET_LIST[i].key) {
			SOCKET_LIST[i].emit('newUser', {'id':socket.id, 'key':socket.key});
			socket.emit('newUser', {'id':SOCKET_LIST[i].id, 'key':SOCKET_LIST[i].key});
			}
		}
	});
	
	socket.emit('yourUser', socket.id);
	
	console.log(socket.id + ' connected');
	
	socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
		for (i in SOCKET_LIST) {
			SOCKET_LIST[i].emit('userQuit', socket.id);
		}
	console.log(socket.id + ' disconnected');

    });	

	socket.on('sendCipher', function(data) {
		data.socket = socket.id;
		for (i in SOCKET_LIST) {
		SOCKET_LIST[i].emit('addCipher', data);
		}
	});
	
	
});
