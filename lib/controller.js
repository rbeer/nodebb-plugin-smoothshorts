'use strict';

var async = require.main.require('async');
var nconf = require.main.require('nconf');
var winston = require.main.require('winston');
var db = require.main.require('./src/database');
var PluginSocket = require.main.require('./src/socket.io/plugins');
var AdminSocket = require.main.require('./src/socket.io/admin');

var sockets = require('./sockets');
var settings = require('./settings');
var hashing = require('./hashing');

/**
 * SmoothShorts - Seamless short URLs for NodeBB
 * @author Raphael Beer <raphael.beer@protonmail.com>
 * @license [MIT]{@link https://raw.githubusercontent.com/rbeer/nodebb-plugin-smoothshorts/master/LICENSE}
 * @memberOf backend
 * @module SmoothShorts
 * @requires backend.module:hashing
 * @requires backend.module:settings
 * @requires backend.module:sockets
 */

/** @alias module:SmoothShorts */
var SmoothShorts = {
  admin: {},
  purgePost: hashing.purgePost,
  purgeTopic: hashing.purgeTopic,
  shortenPost: hashing.shortenPost,
  shortenTopic: hashing.shortenTopic
};

/**
 * Plugin initialisation
 * @memberOf backend.module:SmoothShorts
 * @method init
 * @param  {app}      app - Express app instance
 * @param  {Function} cb
 * @listens nodebb-core.event:"static:app.load"
 */
SmoothShorts.init = function(app, cb) {
  settings.load(function(err) {
    if (err) {
      return cb(err);
    }
    setRoutes(app.router, app.middleware);
    openSockets();
    return cb(null, app);
  });
};

/**
 * Adds menu entry to ACP/Plugins
 * @memberOf backend.module:SmoothShorts
 * @method addMenuItem
 * @param {Object}   custom_header - See event for structure details
 * @param {Function} cb
 * @listens nodebb-core.event:"filter:admin.header.build"
 */
SmoothShorts.admin.addMenuItem = function(custom_header, cb) {
  custom_header.plugins.push({
    route: '/plugins/smoothshorts',
    icon: 'fa-location-arrow',
    name: 'SmoothShorts'
  });
  cb(null, custom_header);
};

/**
 * Registers socket.io methods
 * @memberOf backend.module:SmoothShorts
 */
function openSockets() {
  PluginSocket.SmoothShorts = sockets.plugin;
  AdminSocket.plugins.SmoothShorts = sockets.admin;
}

/**
 * Registers Express routes
 * @memberOf backend.module:SmoothShorts
 * @param {router}                      router     - NodeBB's Express plugin router
 * @param {Object.<string, middleware>} middleware - NodeBB's Express middlewares
 */
function setRoutes(router, middleware) {
  var format = settings.local.shortFormat;
  var path = !format ? '/ss/:hash' : format.slice(format.indexOf('/'));

  router.get(path, validateHash, hashing.resolveHash);
  winston.info('[plugins:SmoothShorts] Listening for short URLs on:', path);

  router.get('/admin/plugins/smoothshorts',
             middleware.applyCSRF, middleware.admin.buildHeader,
             renderAdmin);
  router.get('/api/admin/plugins/SmoothShorts',
             middleware.applyCSRF,
             renderAdmin);
}

/**
 * Validates that a request is meant for the plugin.
 * The [format of short URLs']{@link backend.module:settings.shortFormat} can be
 * as basic as domain.com/:hash, which could conflict with other plugin routes,
 * e.g. those from [nodebb-plugin-custom-pages]{@link https://github.com/psychobunny/nodebb-plugin-custom-pages}.
 * @memberOf backend.SmoothShorts
 * @type   {middleware}
 * @param  {request}    req  - Express request instance
 * @param  {response}   res  - Express response instance
 * @param  {Function}   next
 */
function validateHash(req, res, next) {
  return next(/^[\dabcdef]{8}$/.test(req.params.hash) ? void 0 : 'route');
}

/**
 * Gathers data for and renders ACP page
 * @memberOf backend.SmoothShorts
 * @param  {request}    req  - Express request instance
 * @param  {response}   res  - Express response instance
 * @param  {Function}   next
 */
function renderAdmin(req, res, next) {
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
    var data = {
      // left side, "Settings"
      useModKey: settings.local.useModKey,
      modKey: {},
      shortFormat: settings.local.shortFormat,
      shortFormatDefault: nconf.get('url').replace(/http[s]?:\/\//, '') + '/ss/:hash',
      copyButtonClass: settings.local.copyButtonClass,
      // right side, "Status"
      postCount: result.postCount,
      postHashCount: result.postHashCount,
      topicCount: result.topicCount,
      topicHashCount: result.topicHashCount,
      postStatus: (result.postCount !== result.postHashCount) ? 'cout-warn' : '',
      topicStatus: (result.topicCount !== result.topicHashCount) ? 'cout-warn' : ''
    };
    data.modKey[settings.local.modKey] = true;
    res.render('admin/plugins/smoothshorts/index', data);
  });
}

module.exports = SmoothShorts;
