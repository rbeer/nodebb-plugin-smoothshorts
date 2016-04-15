'use strict';

var db = require.main.require('./src/database');

var settings = {
  local: {
    useModKey: false,
    modKey: '',
    useDomain: false,
    forcedDomain: ''
  }
};

settings.persist = function(cb) {
  db.setObject('settings:smoothshorts', settings.local, function(err) {
    return cb(err ? err : null);
  });
};

settings.set = function(data, cb) {
  settings.local = parseBools(data);
  settings.persist(cb);
};

settings.load = function(cb) {
  db.getObject('settings:smoothshorts', function(err, stored) {
    if (err) {
      return cb(err);
    }
    settings.local = parseBools(stored);
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
