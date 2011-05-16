

exports.start = function(user, port) {

    var http = require('http'); // http service
    var io = require('socket.io'); // for npm, otherwise use require('./path/to/socket.io')
    var json = JSON.stringify;

    // create http server and return chat interface
    var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('');
    });
    server.listen(port);

    // socket.io
    var socket = io.listen(server);
    socket.on('connection', function(client) {
        // new client is here!
        var request = {};
        request.id = client.sessionId;
        request.type = 'connected';
        request.message = ' has connected';
        client.broadcast(json(request));

        client.on('message', function(message) {
            var request = {};
            console.log(message);
            request.message = message.message;
            request.type = message.type;
            request.id = client.sessionId;

            if (request.type === 'channel' && (typeof(message.channelId) !== 'undefined')) {
                client.broadcast(json(request),[12344534]);
            } else if (request.type === 'tell') {
                //client.send(json(request)); tell like mechanism
            } else {
                client.broadcast(json(request));
            }
        });

        client.on('disconnect', function() {
            deleteUser(client.sessionId);
            request.id = client.sessionId;
            request.type = 'disconnected';
            request.message = ' has disconnected';
            client.broadcast(json(request));
        });
    });

    function deleteUser(id) {
        user.remove(id, function(error, doc) {
            if (error !== null) {
                console.log('there\'s been an error deleting the user: ' + error);
            }
        });
    }
}