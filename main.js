var chatSocket = require('./ChatSocket');
var UserProvider = require('./UserProvider').UserProvider;
var express = require('express');
var fs = require('fs'); // file system
var indexFile = fs.readFileSync('./public/index.html'); //read the html page to be served (chat interface)

var userProvider = new UserProvider('localhost', 27017);

var app = express.createServer();
app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function(req, res) {
    res.end(indexFile);
});

app.post('/user/new', function(req, res) {
    userProvider.save({
        handle: req.body.handle,
        sessionid: req.body.sessionid
    }, function(error, docs) {
        res.send({error:error, user:docs});
    });

});

app.listen(3000);

chatSocket.start(userProvider);