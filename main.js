/**
 * @description main.js - entry point
 *
 * Set up a bunch of required modules
 */
var chatSocket = require('./ChatSocket');
var UserProvider = require('./UserProvider').UserProvider;
var express = require('express');
var yaml = require('yaml');
var fs = require('fs'); // file system module
var indexFile = fs.readFileSync('./public/index.html'); //read the html page to be served (chat interface)
var SETTINGS = yaml.eval(fs.readFileSync('./config/settings.yml').toString()); // import the settings file and parse
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

try {
    eval('SETTINGS.' + env +'.database.host')
} catch(e) {
    console.log('Invalid environment variable: ' + env);
    process.exit(1);
}

/**
 * Configure the user provider (mongodB connection for user data storage)
 */
var userProvider = new UserProvider(eval('SETTINGS.' + env +'.database.host'), eval('SETTINGS.' + env + '.database.port'));

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
app.listen(eval('SETTINGS.' + env + '.express.port'));

/**
 * Fire up the socket server
 */
chatSocket.start(userProvider, eval('SETTINGS.' + env + '.chat.port'));