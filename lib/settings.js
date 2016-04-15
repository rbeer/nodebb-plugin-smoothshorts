'use strict';

var db = require.main.require('./src/database');

var settings = {
  default: {
    useModKey: false,
    modKey: '',
    useForceDomain: false,
    forceDomain: ''
  },
  local: {
    useModKey: null,
    modKey: null,
    useForceDomain: null,
    forceDomain: null
  }
};

settings.persist = function(cb) {
  db.setObject('settings:smoothshorts', settings.local, function(err) {
    return cb(err ? err : null);
  });
};

settings.load = function(cb) {
  db.getObject('settings:smoothshorts', function(err, stored) {
    if (err) {
      return cb(err);
    }
    settings.local = stored;
    return cb();
  });
};

module.exports = settings;
