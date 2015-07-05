'use strict';

var nconf = require.main.require('nconf');
var winston = require.main.require('winston');
var async = require.main.require('async');
var db = require.main.require('./src/database');
var PluginSocket = require.main.require('./src/socket.io/plugins');
var AdminSocket = require.main.require('./src/socket.io/admin');

var xxh = require('xxhash');
/** open world **/
var SmoothShorts = {
  useModKey: false,
  modKey: '',
  useDomain: false,
  forcedDomain: ''
};
SmoothShorts.init = function(app, cb) {
  app.router.get('/ss/:hash', SmoothShorts.resolveHash);
  app.router.get('/admin/plugins/smoothshorts',
                 app.middleware.applyCSRF, app.middleware.admin.buildHeader,
                 SmoothShorts.Admin.render);
  app.router.get('/api/admin/plugins/SmoothShorts',
                 app.middleware.applyCSRF,
                 SmoothShorts.Admin.render);
  app.router.post('/api/admin/plugins/smoothshorts/save',
                  app.middleware.applyCSRF,
                  SmoothShorts.Admin.saveSettings);

  db.getObject('settings:smoothshorts', function(err, config) {
    if (err) {
      return cb(err);
    }
    if (config) {
      SmoothShorts.useModKey = (config.useModKey === 'true');
      SmoothShorts.modKey = (config.modKey) ? config.modKey : '';
      SmoothShorts.useDomain = (config.useDomain === 'true');
      SmoothShorts.forcedDomain = (config.forcedDomain) ?
                                  config.forcedDomain : '';
    }
  });

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
  PluginSocket.SmoothShorts.getConfig = function(socket, cb) {
    var data = {
      modKey: (SmoothShorts.useModKey) ? SmoothShorts.modKey : '',
      forcedDomain: (SmoothShorts.useDomain) ?
                    SmoothShorts.forcedDomain : ''
    };
    cb(data);
  };
  return cb(null, app);
};
SmoothShorts.resolveHash = function(req, res, cb) {
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
SmoothShorts.shortenTopic = function(topicData, cb) {
  /** topics:smoothshorts sortedSet **/
  // key is generated from 'NodeBB secret'
  var key = nconf.get('secret');
  key = parseInt('0x' + key.substring(0, key.indexOf('-')), 16);
  // hash topic object
  var hash = xxh.hash(new Buffer(JSON.stringify(topicData)), key).toString(16);
  // don't take any chances of leaking the secret around;
  // not even just parts of it. ;)
  key = null;
  db.sortedSetAdd('topics:smoothshorts', topicData.tid, hash, function(err) {
    if (!err) {
      winston.verbose('[plugin:smoothshorts] Hashed \'' + topicData.title +
                      '\' (ID: ' + topicData.tid + ')');
      if (cb) cb();
    } else {
      winston.error('[plugin:smoothshorts] Writing hash to DB failed.' +
                    '(tid=' + topicData.tid + ')');
      if (cb) cb(err);
    }
  });
  // next(null, topicData);
};
SmoothShorts.purgeTopic = function(tid) {
  db.sortedSetsRemoveRangeByScore(['topics:smoothshorts'], tid, tid,
    function(err) {
      if (err) {
        winston.error('[plugin:smoothshorts] Deleting hash from DB failed.' +
                      '(tid=' + tid + ')');
      } else {
        winston.verbose('[plugin:smoothshorts] Deleted hash for topic ID ' +
                        tid);
      }
    });
};
SmoothShorts.shortenPost = function(postData, cb) {
  /** posts:smoothshorts sortedSet **/
  // key is generated from 'NodeBB secret'
  var key = nconf.get('secret');
  key = parseInt('0x' + key.substring(0, key.indexOf('-')), 16);
  console.log(key);
  // hash post object
  var hash = xxh.hash(new Buffer(JSON.stringify(postData)), key).toString(16);
  // don't take any chances of leaking the secret around;
  // not even just parts of it. ;)
  key = null;
  db.sortedSetAdd('posts:smoothshorts', postData.pid, hash, function(err) {
    if (!err) {
      winston.verbose('[plugin:smoothshorts] Hashed post ID ' + postData.pid);
      if (cb) cb();
    } else {
      winston.error('[plugin:smoothshorts] Writing hash to DB failed.' +
                    '(pid=' + postData.pid + ')');
      winston.error(err);
      if (cb) cb(err);
    }
  });
};
SmoothShorts.purgePost = function(pid) {
  winston.verbose('[plugin:smoothshorts] Purging Post: ' + pid);
  db.sortedSetsRemoveRangeByScore(['posts:smoothshorts'], pid, pid,
    function(err) {
      if (err) {
        winston.error('[plugin:smoothshorts] Deleting hash from DB failed.' +
                      '(pid=' + pid + ')');
      } else {
        winston.verbose('[plugin:smoothshorts] Deleted hash for post ID ' +
                        pid);
      }
    });
};
SmoothShorts.getHashForTid = function(tid, cb) {
  db.getSortedSetRangeByScore('topics:smoothshorts', 0, -1, tid, tid,
    function(err, hash) {
      if (err) {
        return cb(err);
      }
      cb(null, {tid: tid, hash: hash[0]});
    });
};
SmoothShorts.getHashForPid = function(pid, cb) {
  db.getSortedSetRangeByScore('posts:smoothshorts', 0, -1, pid, pid,
                              function(err, hash) {
                                if (err) {
                                  cb(err);
                                }
                                cb(null, {pid: pid, hash: hash[0]});
                              });
};

/** admin's cave **/
SmoothShorts.Admin = {};
SmoothShorts.Admin.addMenuItem = function(custom_header, cb) {
  custom_header.plugins.push({
    route: '/plugins/smoothshorts',
    icon: 'fa-location-arrow',
    name: 'SmoothShorts'
  });
  cb(null, custom_header);
};
SmoothShorts.Admin.render = function(req, res, next) {
  var data = {
    csrf: req.csrfToken()
  };
  async.parallel({
    postCount: function(next) {
      db.sortedSetCard('posts:pid', next);
    },
    postHashCount: function(next) {
      db.sortedSetCard('posts:smoothshorts', next);
    },
    topicCount: function(next) {
      db.sortedSetCard('topics:tid', next);
    },
    topicHashCount: function(next) {
      db.sortedSetCard('topics:smoothshorts', next);
    }
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    // left side, "Settings"
    data.modKey = {};
    data.modKey[SmoothShorts.modKey] = true;
    data.useModKey = SmoothShorts.useModKey;
    data.useDomain = SmoothShorts.useDomain;
    data.forcedDomain = SmoothShorts.forcedDomain;
    // right side, "Status"
    data.postCount = result.postCount;
    data.postHashCount = result.postHashCount;
    data.topicCount = result.topicCount;
    data.topicHashCount = result.topicHashCount;
    data.postStatus = (data.postCount !== data.postHashCount) ?
                      'cout-warn' : '';
    data.topicStatus = (data.topicCount !== data.topicHashCount) ?
                       'cout-warn' : '';
    res.render('admin/plugins/smoothshorts', data);
  });
};
SmoothShorts.Admin.saveSettings = function(req, res, next) {
  var dbData = {
    useModKey: req.body.useModKey,
    modKey: req.body.modKey,
    useDomain: req.body.useDomain,
    forcedDomain: req.body.domain
  };
  db.setObject('settings:smoothshorts', dbData, function(err) {
    if (err) {
      res.json(500, 'saveError');
    }

    SmoothShorts.useModKey = (dbData.useModKey === 'true');
    SmoothShorts.modKey = dbData.modKey;
    SmoothShorts.useDomain = (dbData.useDomain === 'true');
    SmoothShorts.forcedDomain = dbData.forcedDomain;

    res.json('OK');
  });
};

AdminSocket.plugins.SmoothShorts = {};
AdminSocket.plugins.SmoothShorts.hashMissing = function(socket, data, cb) {
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
              SmoothShorts.shortenPost(postData, function(err) {
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
              SmoothShorts.shortenTopic(topicData, function(err) {
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
/* not yet implemented - stay tuned for 0.2.0! :)
AdminSocket.plugins.SmoothShorts.deleteUnused = function(socket, data, cb) {
};
*/
module.exports = SmoothShorts;
