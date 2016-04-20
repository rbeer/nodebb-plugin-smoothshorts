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
  db.setObject('settings:smoothshorts', settings.local, function(err) {
    return cb(err ? err : null);
  });
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
    if (stored.useDomain !== void 0 && stored.forcedDomain !== void 0) {
      db.deleteObjectFields('settings:smoothshorts', [
        'useDomain', 'forcedDomain'
      ], function() {});
      winston.info('[plugins:SmoothShorts] Updated deprecated settings.');
      stored.shortFormat = stored.useDomain && stored.forcedDomain ? stored.forcedDomain + '/ss/:hash' : '';
      delete stored.useDomain;
      delete stored.forcedDomain;
      return settings.set(stored, cb);
    }
    _.extendOwn(settings.local, stored);
    return cb();
  });
};

function parseBools(obj) {
  for (var name in obj) {
    if (obj[name] === 'true') obj[name] = true;
    if (obj[name] === 'false') obj[name] = false;
  }
  return obj;
}

module.exports = settings;
