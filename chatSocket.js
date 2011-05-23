

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
        request.message = ' has connected';
        client.broadcast(json(request));

        client.on('message', function(message) {
            var request = {};
            console.log(message);
            request.message = message.message;
            request.type = message.type;
            request.id = client.sessionId;
            request.user = typeof(message.user) !== 'undefined'?message.user:null;

            if (request.type === 'channel' && (typeof(message.channelId) !== 'undefined')) {
                console.log('channel');
                client.broadcast(json(request),[12344534]);
            } else if (request.type === 'tell') {
                console.log('tell');
                //client.send(json(request)); tell like mechanism
            } else {
                if(typeof(message.type) === 'undefined') {
                    request.type = 'connected';
                }

                console.log('broadcast');
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
        console.log('here'); 
        user.remove(id, function(error, doc) {
            if (error !== null) {
                console.log('there\'s been an error deleting the user: ' + error);
            }
        });
    }

    function getUser(id) {
        user.get(id, function(error, doc) {
           if (error !== null) {
               console.log('Unable to find handle for session id: ' + id);
               return id;
           } else {
               console.log(doc);
               //return doc.handle;
           }
        });
    }
}