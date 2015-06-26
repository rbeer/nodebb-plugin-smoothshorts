'use strict';

var db = require.main.require('./src/database');
var winston = require.main.require('winston');
var xxh = require('xxhash');
var async = require.main.require('async');
var PluginSocket = require.main.require('./src/socket.io/plugins');

var SmoothShorts = {};

SmoothShorts.init = function(app, cb) {
  app.router.get('/ss/:hash', SmoothShorts.resolveHash);
  PluginSocket.SmoothShorts = {};
  PluginSocket.SmoothShorts.getTopicHashs = function(socket, tids, cb) {
    async.map(tids, SmoothShorts.getHashForTid, function(err, hashs) {
      if (err) {
        return cb(err);
      }
      cb(null, hashs);
    });
  };
  PluginSocket.SmoothShorts.getPostHashs = function(socket, pids, cb) {
    async.map(pids, SmoothShorts.getHashForPid, function(err, hashs) {
      if (err) {
        return cb(err);
      }
      cb(null, hashs);
    });
  };
  return cb(null, app);
};

SmoothShorts.resolveHash = function(req, res, cb) {
  var hash = req.params.hash;
  console.log(hash);

  async.parallel({
    isPost: function(next) {
      db.isSortedSetMember('posts:smoothshorts', hash, next);
    },
    isTopic: function(next) {
      db.isSortedSetMember('topics:smoothshorts', hash, next);
    }
  }, function(err, result) {
    if (err) {
      return cb(err);
    } else if (result.isPost) {
      async.waterfall([
        function(next) {
          db.sortedSetScore('posts:smoothshorts', hash, next);
        },
        function(pid, next) {
          db.getObjectField('post:' + pid, 'tid', function(err, tid) {
            return next(null, {pid: pid, tid: tid});
          });
        },
        function(data, next) {
          async.parallel({
            rank: function(next) {
              db.sortedSetRank('tid:' + data.tid + ':posts', data.pid, next);
            },
            slug: function(next) {
              db.getObjectField('topic:' + data.tid, 'slug', next);
            }
          }, function(err, result) {
            if (err) {
              return cb(err);
            }
            var pIndex = (result.rank !== null) ?
                         (parseInt(result.rank, 10) + 2).toString() : '1';
            var uri = '/topic/' + result.slug + '/' + pIndex;
            next(null, uri);
          });
        }
      ], function(err, uri) {
        if (err) {
          return cb(err);
        }
        winston.verbose('[plugins:SmoothShorts] Redirecting ' + hash +
                        ' to ' + uri);
        res.redirect(uri);
      });
    } else if (result.isTopic) {
      /* if this hash points to a topic */
      async.waterfall([
        function(next) {
          db.sortedSetScore('topics:smoothshorts', hash, next);
        },
        function(tid, next) {
          db.getObjectField('topic:' + tid, 'slug', next);
        }
      ], function(err, slug) {
        if (err) {
          return cb(err);
        }
        // build URI
        var uri = '/topic/' + slug + '/';
        winston.verbose('[plugins:SmoothShorts] Redirecting ' + hash +
                        ' to ' + uri);
        // redirect user to URI
        res.redirect(uri);
      });
    } else {
      winston.warn('[plugins:SmoothShorts] Couldn\'t resolve ' + hash);
      cb(null);
    }
  });
};

SmoothShorts.shortenTopic = function(topicData) {
  winston.verbose('[plugin:smoothshorts] Shortening Topic:');
  /** topics:smoothshorts sortedSet **/
  // hash topic object
  var hash = xxh.hash(new Buffer(JSON.stringify(topicData)),
                      0xCAFEBABE).toString(16);
  db.sortedSetAdd('topics:smoothshorts', topicData.tid, hash, function(err) {
    if (!err) {
      winston.verbose('[plugin:smoothshorts] ' + topicData);
    } else {
      winston.error('[plugin:smoothshorts] Writing hash to DB failed.' +
                    '(tid=' + topicData.tid + ')');
    }
  });
  // next(null, topicData);
};
SmoothShorts.purgeTopic = function(tid) {
  winston.verbose('[plugin:smoothshorts] Purging Topic: ' + tid);
  db.sortedSetsRemoveRangeByScore(['topics:smoothshorts'], tid, tid, function(err) {
    if (err) {
      winston.error('[plugin:smoothshorts] Deleting hash from DB failed.' +
                    '(tid=' + tid + ')');
    };
  });
};
SmoothShorts.shortenPost = function(postData) {
  winston.verbose('[plugin:smoothshorts] Shortening Post:');
  /** posts:smoothshorts sortedSet **/
  // hash post object
  var hash = xxh.hash(new Buffer(JSON.stringify(postData)), 0xCAFEBABE).toString(16);
  db.sortedSetAdd('posts:smoothshorts', postData.pid, hash, function(err) {
    if (!err) {
      winston.verbose('[plugin:smoothshorts] ' + postData);
    } else {
      winston.error('[plugin:smoothshorts] Writing hash to DB failed.' +
                    '(pid=' + postData.pid + ')');
      winston.error(err);
    }
  });
};
SmoothShorts.purgePost = function(pid) {
  winston.verbose('[plugin:smoothshorts] Purging Post: ' + pid);
  db.sortedSetsRemoveRangeByScore(['posts:smoothshorts'], pid, pid, function(err) {
    if (err) {
      winston.error('[plugin:smoothshorts] Deleting hash from DB failed.' +
                    '(pid=' + pid + ')');
    };
  });
};

SmoothShorts.getHashForTid = function(tid, cb) {
  db.getSortedSetRangeByScore('topics:smoothshorts', 0, -1, tid, tid, function(err, hash) {
    if (err) {
      return cb(err);
    }
    cb(null, {tid: tid, hash: hash[0]});
  });
};

SmoothShorts.getHashForPid = function(pid, cb) {
  db.getSortedSetRangeByScore('posts:smoothshorts', 0, -1, pid, pid, function(err, hash) {
    if (err) {
      cb(err);
    }
    cb(null, {pid: pid, hash: hash[0]});
  });
};

module.exports = SmoothShorts;
