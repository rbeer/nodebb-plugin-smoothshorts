'use strict';

var async = require.main.require('async');
var nconf = require.main.require('nconf');
var db = require.main.require('./src/database');

var hashing = require('./hashing');
var settings = require('./settings');

var sockets = {
  admin: {},
  plugin: {}
};

sockets.plugin.getHashes = function(socket, data, cb) {
  async.map(data.ids, hashing.getHashDelegate.call(this, data.type), function(err, hashes) {
    if (err) {
      return cb(err);
    }
    cb(null, hashes);
  });
};

sockets.plugin.getConfig = function(socket, cb) {
  cb({
    modKey: (settings.local.useModKey) ? settings.local.modKey : '',
    shortFormat: !settings.local.shortFormat ? nconf.get('url').replace(/http[s]?:\/\//, '') + '/ss/:hash' : settings.local.shortFormat,
    copyButtonClass: settings.local.copyButtonClass
  });
};

sockets.admin.saveSettings = function(socket, data, cb) {
  settings.set(data, cb);
};

sockets.admin.hashMissing = function(socket, data, cb) {
  async.parallel({
    postIds: function(next) {
      db.getSortedSetRevRange('posts:pid', 0, -1, next);
    },
    topicIds: function(next) {
      db.getSortedSetRevRange('topics:tid', 0, -1, next);
    }
  }, function(err, result) {
    if (err) {
      return cb(err);
    }
    db.getSortedSetRevRangeWithScores('posts:smoothshorts', 0, -1,
      function(err, hashSet) {
        if (err) {
          cb(err);
        }
        if (hashSet.length < result.postIds.length) {
          result.postIds.forEach(function(pid) {
            for (var i = 0; i < hashSet.length; i++) {
              if (hashSet[i].score === pid) {
                return;
              }
            }
            db.getObject('post:' + pid, function(err, postData) {
              if (err) {
                return;
              }
              hashing.shortenPost(postData, function(err) {
                if (!err) {
                  socket.emit('event:smoothshorts.newhash', {type: 'post'});
                }
              });
            });
          });
        }
      });
    db.getSortedSetRevRangeWithScores('topics:smoothshorts', 0, -1,
      function(err, hashSet) {
        if (err) {
          cb(err);
        }
        if (hashSet.length < result.topicIds.length) {
          result.topicIds.forEach(function(tid) {
            for (var i = 0; i < hashSet.length; i++) {
              if (hashSet[i].score === tid) {
                return;
              }
            }
            db.getObject('topic:' + tid, function(err, topicData) {
              if (err) {
                return;
              }
              hashing.shortenTopic(topicData, function(err) {
                if (!err) {
                  socket.emit('event:smoothshorts.newhash', {type: 'topic'});
                }
              });
            });
          });
        }
      });
  });
};

module.exports = sockets;
