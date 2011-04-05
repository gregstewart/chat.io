exports.start = function() {

    var fs = require('fs'); // file system
    var http = require('http'); // http service
    var io = require('socket.io'); // for npm, otherwise use require('./path/to/socket.io')
    var json = JSON.stringify;

    var indexFile = fs.readFileSync('./index.html'); //read the html page to be served (chat interface)

    // create http server and return chat interface
    var server = http.createServer( function(req, res) {
     res.writeHead(200, {'Content-Type': 'text/html'});
     res.end(indexFile);
    });
    server.listen(8080);

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
            request.message = message;
            request.type = 'shout';
            request.id = client.sessionId;
            //client.send(json(request)); tell like mechanism
            client.broadcast(json(request));
        });

        client.on('disconnect', function(){
            request.id = client.sessionId;
            request.type = 'disconnected';
            request.message = ' has disconnected';
            client.broadcast(json(request));
        });
    });
}