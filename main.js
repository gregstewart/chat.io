/**
 * @description main.js - entry point
 *
 * Set up a bunch of required modules
 */
var chatSocket = require('./ChatSocket');
var UserProvider = require('./UserProvider').UserProvider;
var express = require('express');
var fs = require('fs'); // file system module
var indexFile = fs.readFileSync('./public/index.html'); //read the html page to be served (chat interface)

/**
 * Configure the user provider (mongodB connection for user data storage)
 */
var userProvider = new UserProvider('localhost', 27017);

/**
 * Create the Express server for handling requests
 */
var app = express.createServer();
app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

/**
 * Express server routes:
 * 1) get the main/index page
 * 2) get all users
 * 3) create a new user
 * 4) delete a user
 */
app.get('/', function(req, res) {
    res.end(indexFile);
});

app.get('/user/', function(req, res) {
   userProvider.findAll(function(error, results) {
       res.send({error:error, users:results});
    });
});

app.post('/user/new', function(req, res) {
    userProvider.save({
        handle: req.body.handle,
        sessionid: req.body.sessionid
    }, function(error, docs) {
        res.send({error:error, user:docs});
    });

});

app.get('/user/delete', function(req, res) {
    var sessionid = req.body.sessionid;

    userProvider.remove(
        sessionid
        , function(error, docs) {
            res.send({error:error, user:docs});
        }
    );
});


/**
 * Fire up the http server
 */
app.listen(3000);

/**
 * Fire up the socket server
 */
chatSocket.start(userProvider);