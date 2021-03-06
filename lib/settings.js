'use strict';

var winston = require.main.require('winston');
var _ = require.main.require('underscore');
var db = require.main.require('./src/database');

var settings = {
  local: {
    useModKey: false,
    modKey: '',
    shortFormat: '',
    copyButtonClass: 'fa-external-link'
  }
};

settings.persist = function(cb) {
  db.setObject('settings:smoothshorts', settings.local, cb);
};

settings.set = function(data, cb) {
  _.extendOwn(settings.local, parseBools(data));
  settings.persist(cb);
};

settings.load = function(cb) {
  db.getObject('settings:smoothshorts', function(err, stored) {
    if (err) {
      return cb(err);
    }
    stored = parseBools(stored);
    upgrade(stored, function(err) {
      if(!err) {
        _.extendOwn(settings.local, stored);
        cb();
      }
    });
  });
};

function upgrade(stored, cb) {
  /**
   * Replace useDomain and forcedDomain with shortFormat
   * @since 0.3.0
   */
  if (stored.useDomain !== void 0 && stored.forcedDomain !== void 0) {
    db.deleteObjectFields('settings:smoothshorts', [
      'useDomain', 'forcedDomain'
    ], function() {});
    stored.shortFormat = stored.useDomain && stored.forcedDomain ? stored.forcedDomain + '/ss/:hash' : '';
    delete stored.useDomain;
    delete stored.forcedDomain;
    settings.set(stored, function(err) {
      if (err) {
        winston.error('[plugins:SmoothShorts] Settings upgrade failed!');
        winston.error(err);
        return cb(1);
      }
      winston.info('[plugins:SmoothShorts] Upgraded deprecated settings.');
      cb();
    });
  }
  cb();
}

function parseBools(obj) {
  for (var name in obj) {
    if (obj.hasOwnProperty(name)) {
      if (obj[name] === 'true') obj[name] = true;
      if (obj[name] === 'false') obj[name] = false;
    }
  }
  return obj;
}

module.exports = settings;
