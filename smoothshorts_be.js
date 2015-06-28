'use strict';

var db = require.main.require('./src/database');
var winston = require.main.require('winston');
var async = require.main.require('async');
var PluginSocket = require.main.require('./src/socket.io/plugins');
var AdminSocket = require.main.require('./src/socket.io/admin');

var xxh = require('xxhash');
/** open world **/
var SmoothShorts = {
  useModKey: false,
  modKey: '',
  useDomain: false,
  forcedDomain: '',
  topiCount: 0,
  topicHashCount: 0,
  postCount: 0,
  postHashCount: 0
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
      SmoothShorts.useModKey = (config.useModKey) ? config.useModKey : false;
      SmoothShorts.modKey = (config.modKey) ? config.modKey : '';
      SmoothShorts.useDomain = (config.useDomain) ? config.useDomain : false;
      SmoothShorts.forcedDomain = (config.forcedDomain) ? config.forcedDomain : '';
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
  var hash = xxh.hash(new Buffer(JSON.stringify(postData)),
                      0xCAFEBABE).toString(16);
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
    },
    config: function(next) {
      db.getObject('settings:smoothshorts', next);
    }
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    // left side, "Settings"
    if (result.config) {
      if (result.config.modKey) {
        data.modKey = {};
        data.modKey[result.config.modKey] = true;
      }
      data.useModKey = (result.config.useModKey === 'true');
      data.useDomain = (result.config.forcedDomain !== '');
      data.forcedDomain = result.config.forcedDomain;
    } else {
      data.useDomain = false;
      data.useModKey = false;
      data.forcedDomain = '';
    }
    // right side, "Status"
    data.postCount = result.postCount;
    data.postHashCount = result.postHashCount;
    data.topicCount = result.topicCount;
    data.topicHashCount = result.topicHashCount;
    data.postStatus = (data.postCount !== data.postHashCount) ?
                      'cout-warn' : '';
    data.topicStatus = (data.topicCount !== data.topicHashCount) ?
                       'cout-warn' : '';
    res.render('admin', data);
  });
};
SmoothShorts.Admin.saveSettings = function(req, res, next) {
  // { _csrf: 'Krgyg2tw-T6YOPxXXnFszAhRX4hw1KBC_9CU',
  // useModKey: 'true',
  // modKey: 'shift',
  // useDomain: 'true',
  // domain: 'mydomain.com' }
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

    SmoothShorts.useModKey = dbData.useModKey;
    SmoothShorts.modKey = dbData.modKey;
    SmoothShorts.useDomain = dbData.useDomain;
    SmoothShorts.forcedDomain = dbData.forcedDomain;

    res.json('OK');
  });
};

module.exports = SmoothShorts;
