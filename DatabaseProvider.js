/**
 * Created by .
 * User: gregstewart
 * Date: 13/05/11
 * Time: 12:25 PM
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongodb');
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
// BSON = require('lib/mongodb').BSONPure;
var BSON = require('mongodb').BSONNative;


DatabaseProvider = function(host,port) {
    var db = new mongo.Db('node-mongo-chat', new Server(host, port, {auto_reconnect: true}, {}));
    db.addListener('error', function(error) {
      console.log('Error connecting to mongo -- perhaps it isn\'t running?');
    });
    db.open(function() {
    });

    return db;
};

exports.DatabaseProvider = DatabaseProvider;