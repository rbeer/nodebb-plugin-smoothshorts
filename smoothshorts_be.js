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

SmoothShorts.resolveHash = function(req, res, next) {
  var hash = req.params.hash;

  // async this mess!
  // better yet, take the time to get familiar with db.*
  // and sort it out!
  // holy crap ^_^ - use db.sortedSetScore!
  db.isSortedSetMember('posts:smoothshorts', hash, function(err, isPostHash) {
    if (isPostHash) {
      /* if this hash points to a post */
      // get data row (rank) of hash/postid
      db.sortedSetRank('posts:smoothshorts', hash, function(err, rank) {
        // get postid from that row (rank)
        db.getSortedSetRangeWithScores('posts:smoothshorts', rank, rank, function(err, range) {
          // postid for hash
          var pid = range[0].score;
          // get topicid this pid belongs to
          db.getObjectField('post:' + pid, 'tid', function(err, tid) {
            /* is this a non-initial post? (i.e. not the first post in topic) */
            db.isSortedSetMember('tid:' + tid + ':posts', pid, function(err, isNotInitial) {
              if (isNotInitial) {
                /* yes, it is */
                // get position in topic listing (i.e. data-index in DOM)
                db.sortedSetRank('tid:' + tid + ':posts', pid, function(err, postInTopic) {
                  // get topic slug; needed for URI
                  db.getObjectField('topic:' + tid, 'slug', function(err, slug) {
                    // build URI
                    var uri = '/topic/' + slug + '/' + (parseInt(postInTopic, 10) + 2).toString();
                    winston.verbose('[plugins:SmoothShorts] Redirecting ' +
                                    hash + ' to post(' + pid + ') ' + uri);
                    // redirect user to URI
                    res.redirect(uri);
                  });
                });
              } else {
                /* no, it's not; simply redirect to topic */
                // get topic slug (i.e. 'tid/title'); needed for URI
                db.getObjectField('topic:' + tid, 'slug', function(err, slug) {
                  // build URI
                  var uri = '/topic/' + slug + '/1';
                  winston.verbose('[plugins:SmoothShorts] Redirecting ' + hash +
                                  ' to post(' + pid + ') ' + uri);
                  // redirect user to URI
                  res.redirect(uri);
                }); // Did you ever
              }     // wonder where
            });     // the term
          });       // callback hell
        });         // comes from?
      });           // Well, here you go. :]
    } else {
      // if this hash points to a topic
      db.isSortedSetMember('topics:smoothshorts', hash, function(err, isTopicHash) {
        if (isTopicHash) {
          // get data row (rank) of hash/topicid
          db.sortedSetRank('topics:smoothshorts', hash, function(err, rank) {
            // get topicid from that row (rank)
            db.getSortedSetRangeWithScores('topics:smoothshorts', rank, rank, function(err, range) {
              var tid = range[0].score;
              db.getObjectField('topic:' + tid, 'slug', function(err, slug) {
                // build URI
                var uri = '/topic/' + slug + '/';
                winston.verbose('[plugins:SmoothShorts] Redirecting ' + hash +
                                ' to topic(' + tid + ') ' + uri);
                // redirect user to URI
                res.redirect(uri);
              });
            });
          });
        } else {
          // at this point it's clear that
          // this is neither a post- nor topic-hash
          // show some error message
          winston.warn('[plugins:smoothshorts] Couldn\'t resolve ' + hash);
          next(null);
        }
      });
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
