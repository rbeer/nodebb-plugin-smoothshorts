'use strict';

var winston = require.main.require('winston');
var _ = require.main.require('underscore');
var db = require.main.require('./src/database');

/**
 * Settings
 * @memberOf backend
 * @module settings
 */

/** @alias module:settings */
var settings = {
  local: {
    /**
     * Indicates whether modifier key must be
     * pressed to replace URLs in context menu method
     * @memberOf backend.module:settings
     * @type {Boolean}
     * @default false
     * @see backend.module:settings.modKey
     */
    useModKey: false,
    /**
     * Modifier key (ctrl, alt or shift) to enable URL
     * replacement in context menu method
     * @memberOf backend.module:settings
     * @type {string}
     */
    modKey: '',
    /**
     * Short URLs will be built with this format
     * @memberOf backend.module:settings
     * @type {string}
     * @example
     * 'short.com/ss/:hash'
     * 'short.com/:hash'
     * 'short.com/:hash/yolo'
     */
    shortFormat: '',
    /**
     * CSS class name for copy button icon
     * @memberOf backend.module:settings
     * @type {String}
     * @default fa-external-link
     */
    copyButtonClass: 'fa-external-link'
  }
};

/**
 * Writes settings to database
 * @memberOf backend.module:settings
 * @param  {Function} cb
 */
settings.persist = function(cb) {
  db.setObject('settings:smoothshorts', settings.local, function(err) {
    return cb(err ? err : null);
  });
};

/**
 * Sets and persists local settings object
 * @memberOf backend.module:settings
 * @param {Object}   data
 * @param {Function} cb
 */
settings.set = function(data, cb) {
  _.extendOwn(settings.local, parseBools(data));
  settings.persist(cb);
};

/**
 * Loads settings from database
 * @memberOf backend.module:settings
 * @param  {Function} cb
 */
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

/**
 * Parses an Object and replaces 'true'/'false' string
 * values with their respective boolean
 * @memberOf backend.module:settings
 * @inner
 * @param  {Object} obj
 * @return {Object}
 */
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
