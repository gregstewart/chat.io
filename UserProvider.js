UserProvider = function(db) {
    this.db = db;
};

UserProvider.prototype.getCollection = function(callback) {
    this.db.collection('users', function(error, user_collection) {
        if (error) {
            callback(error);
        } else {
            callback(null, user_collection);
        }
    });
};

UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
        if (error) {
            callback(error)
        } else {
            user_collection.find(function(error, cursor) {
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

UserProvider.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof(users.length) === "undefined") {
                users = [users];
                for (var i = 0; i < users.length; i++) {
                    user = users[i];
                    user.created_at = new Date();
                }

                user_collection.insert(users, function() {
                    callback(null, users);
                });
            }
        }
    });
};

UserProvider.prototype.remove = function(id, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof(id) !== 'undefined') {
                user_collection.remove({'sessionid':id}, function() {
                    callback(null, 'User deleted');
                });
            }


        }
    });
};

exports.UserProvider = UserProvider;