/**
 * Created by .
 * User: gregstewart
 * Date: 13/05/11
 * Time: 12:24 PM
 * To change this template use File | Settings | File Templates.
 */
ChannelProvider = function(db) {
    this.db = db;
};

ChannelProvider.prototype.getCollection = function(callback) {
    this.db.collection('channels', function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            callback(null, channel_collection);
        }
    });
};

ChannelProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error)
        } else {
            channel_collection.find(function(error, cursor) {
                if (error) {
                    callback(error)
                } else {
                    cursor.toArray(function(error, results) {
                        if (error) {
                            callback(error)
                        } else {
                            callback(null, results)
                        }
                    });
                }
            });
        }
    });
};

ChannelProvider.prototype.save = function(channels, callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof(channels.length) === "undefined") {
                channels = [channels];
                for (var i = 0; i < channels.length; i++) {
                    console.log('here');
                    channel = channels[i];
                    channel.created_at = new Date();
                }


                channel_collection.findOne({'channel':channel.channel}, function(error, result) {
                   if (error) {
                       callback(error);
                   } else {
                       console.log(result);

                       if (typeof(result) === 'undefined')
                       {
                           channel_collection.insert(channels, function() {
                               callback(null, channels);
                           });
                       } else {
                           callback('channel exists', channels);
                       }
                   }
                });
               



            }


        }
    });
};

ChannelProvider.prototype.findByChannel = function(name, callback) {
    this.getCollection(function(error, channel_collection) {
      if( error ) {
          callback(error);
      } else {
        channel_collection.findOne({channel: name}, function(error, result) {
          if( error ) {
              console.log(error);
              callback(error);
          } else {
              console.log(result);
              callback(null, result);
          }
        });
      }
    });
};

ChannelProvider.prototype.remove = function(id, callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof(id) !== 'undefined') {
                channel_collection.remove({'sessionid':id}, function() {
                    callback(null, 'channel deleted');
                });
            }


        }
    });
};

exports.ChannelProvider = ChannelProvider;