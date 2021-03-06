'use strict';

const async = require.main.require('async');
const express = require.main.require('express');
const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const hotswap = require.main.require('./src/hotswap');

const settings = require('./settings');
const hashing = require('./hashing');

let routes = {
  coreMiddleware: null
};

routes.initRoutes = function initRoutes(router, middleware) {
  router.get('/admin/plugins/smoothshorts',
             middleware.applyCSRF, middleware.admin.buildHeader,
             renderAdmin);
  router.get('/api/admin/plugins/SmoothShorts',
             middleware.applyCSRF,
             renderAdmin);
  routes.coreMiddleware = middleware;
  routes.hotswapHashRoute();
};

routes.prepareHotSwap = function prepareHotSwap(ids, cb) {
  ids.push('smoothshorts');
  cb(null, ids);
};

routes.hotswapHashRoute = function hotswapHashRoute() {
  let hashRouter = express.Router();
  let routeHelpers = require.main.require('./src/routes/helpers');
  let format = settings.local.shortFormat;
  let path = !format ? '/ss/:hash' : format.slice(format.indexOf('/'));

  hashRouter.hotswapId = 'smoothshorts';
  routeHelpers.setupPageRoute(hashRouter, path, routes.coreMiddleware, [validateHash], hashing.resolveHash);

  hotswap.replace('smoothshorts', hashRouter);
  winston.info('[plugins:SmoothShorts] Listening for short URLs on:', path);
};

function validateHash(req, res, next) {
  return next(/^[\dabcdef]{7,8}$/.test(req.params.hash) ? void 0 : 'route');
}

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

module.exports = routes;
