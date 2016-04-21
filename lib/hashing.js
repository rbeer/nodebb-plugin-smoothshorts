'use strict';

var async = require.main.require('async');
var nconf = require.main.require('nconf');
var winston = require.main.require('winston');
var db = require.main.require('./src/database');
var xxh = require('xxhash');

var hashing = {};

var hashType = {
  topics: 'tid',
  posts: 'pid'
};

hashing.getHashForId = function(id, type, cb) {
  db.getSortedSetRangeByScore(type + ':smoothshorts', 0, -1, id, id,
    function(err, hash) {
      if (err) {
        return cb(err);
      }
      var res = { hash: hash[0] };
      res[hashType[type]] = id;
      cb(null, res);
    });
};

hashing.getHashDelegate = function(type) {
  return function(id, cb) {
    hashing.getHashForId.call(this, id, type, cb);
  };
};

hashing.shortenPost = function(postData, cb) {
  shorten(postData, 'posts', cb);
};

hashing.shortenTopic = function(topicData, cb) {
  shorten(topicData, 'topics', cb);
};

hashing.purgePost = function(id) {
  purge(id, 'posts');
};

hashing.purgeTopic = function(id) {
  purge(id, 'topics');
};

hashing.resolveHash = function(req, res, cb) {
  var hash = req.params.hash;

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
            if (err) {
              return cb(err);
            }
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

function shorten(data, type, cb) {
  var hash = hashData(data);
  db.sortedSetAdd(type + ':smoothshorts', data[hashType[type]], hash, function(err) {
    if (!err) {
      winston.error('[plugin:smoothshorts] Writing hash to DB failed.' +
                    '(' + hashType[type] + '=' + data[hashType[type]] + ')');
      winston.error(err);
      return cb ? cb(err) : void 0;
    }
    winston.verbose(type === 'posts' ?
                    '[plugin:smoothshorts] Hashed post ID ' + data.pid :
                    '[plugin:smoothshorts] Hashed \'' + data.title + '\' (ID: ' + data.tid + ')');
    return cb ? cb() : void 0;
  });
}

function purge(id, type) {
  db.sortedSetsRemoveRangeByScore([type + ':smoothshorts'], id, id, function(err) {
    if (err) {
      return winston.error('[plugin:smoothshorts] Deleting hash from DB failed.' +
                    '(' + hashType[type] + '=' + id + ')');
    }
    winston.verbose('[plugin:smoothshorts] Deleted hash for ' + type.substring(0, type.length - 1) + ' ID ' + id);
  });
}

function hashData(data) {
  var key = nconf.get('secret');
  key = parseInt('0x' + key.substring(0, key.indexOf('-')), 16);
  var hash = xxh.hash(new Buffer(JSON.stringify(data)), key).toString(16);
  // don't take any chances of leaking the secret around;
  // not even just parts of it. ;)
  key = null;
  return hash;
}

module.exports = hashing;
