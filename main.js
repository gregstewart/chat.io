/**
 * @description main.js - entry point
 *
 * Set up a bunch of required modules
 */
var chatSocket = require('./ChatSocket');
var DatabaseProvider = require('./DatabaseProvider').DatabaseProvider;
var UserProvider = require('./UserProvider').UserProvider;
var ChannelProvider = require('./ChannelProvider').ChannelProvider;
var express = require('express');
var yaml = require('yaml');
var fs = require('fs'); // file system module
var indexFile = fs.readFileSync('./public/index.html'); //read the html page to be served (chat interface)
var SETTINGS = yaml.eval(fs.readFileSync('./config/settings.yml').toString()); // import the settings file and parse
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

try {
    SETTINGS[env]['database']['host'];
} catch(e) {
    console.log('Invalid environment variable: ' + env);
    process.exit(1);
}

/**
 * Configure the user provider (mongodB connection for user data storage)
 */
var databaseProvider = new DatabaseProvider(SETTINGS[env]['database']['host'], SETTINGS[env]['database']['port']);
var userProvider = new UserProvider(databaseProvider);
var channelProvider = new ChannelProvider(databaseProvider);

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

/* USERS */
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
    if (typeof req.body.sessionid !== 'undefined' || req.body.sessionid !== null) {

        userProvider.remove(
            req.body.sessionid
            , function(error, docs) {
                res.send({error:error, user:docs});
            }
        );
    } else {
        userProvider.getByHandle(
            req.body.handle
            , function(error, docs) {
                userProvider.remove(
                    docs.sessionid
                    , function(error, docs) {
                        res.send({error:error, user:docs});
                    }
                );
                
            }
        );
    }
});

/* CHANNELS */
app.get('/channel/', function(req, res) {
   channelProvider.findAll(function(error, results) {
       res.send({error:error, channels:results});
    });
});

app.post('/channel/new', function(req, res) {
    // important, since we are storing users belonging to a channel as an array we must initialise
    // the field as an array! Else we can push to it
    var users = [];
    users.push(req.body.sessionid);
    console.log(users);
    channelProvider.save({
        channel: req.body.channel,
        users: users
    }, function(error, docs) {
        res.send({error:error, channel:docs});
    });
});

app.post('/channel/join', function(req, res) {
    channelProvider.joinChannel({
        channel: req.body.channel,
        user: req.body.sessionid
    }, function(error, docs) {
        res.send({error:error, channel:docs});
    });
});


/**
 * Fire up the http server
 */
app.listen(SETTINGS[env]['express']['port']);

/**
 * Fire up the socket server
 */
chatSocket.start(userProvider, SETTINGS[env]['chat']['port']);