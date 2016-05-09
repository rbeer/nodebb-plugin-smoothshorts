'use strict';

const PluginSocket = require.main.require('./src/socket.io/plugins');
const AdminSocket = require.main.require('./src/socket.io/admin');

const sockets = require('./sockets');
const settings = require('./settings');
const hashing = require('./hashing');
const routes = require('./routes');
// var services = require('./services');

let SmoothShorts = {
  admin: {},
  purgePost: hashing.purgePost,
  purgeTopic: hashing.purgeTopic,
  shortenPost: hashing.shortenPost,
  shortenTopic: hashing.shortenTopic
};

SmoothShorts.init = function(app, cb) {
  settings.load(function(err) {
    if (err) {
      return cb(err);
    }
    routes.initRoutes(app.router, app.middleware);
    openSockets();
    return cb(null, app);
  });
};

SmoothShorts.prepareHotSwap = routes.prepareHotSwap;

SmoothShorts.admin.addMenuItem = function(custom_header, cb) {
  custom_header.plugins.push({
    route: '/plugins/smoothshorts',
    icon: 'fa-location-arrow',
    name: 'SmoothShorts'
  });
  cb(null, custom_header);
};

function openSockets() {
  PluginSocket.SmoothShorts = sockets.plugin;
  AdminSocket.plugins.SmoothShorts = sockets.admin;
}

module.exports = SmoothShorts;
