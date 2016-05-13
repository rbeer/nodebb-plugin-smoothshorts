'use strict';

const winston = require.main.require('winston');

const ServiceModule = require('./servicemodule');
const settings = require('./settings');

let services = {
  loadedModules: [
/*
    {
      id: 'nodebb-plugin-shorturls-googl',                   // build from settings.serviceModules
      name: 'Goo.gl',                                        // from plugin
      info: 'Google\'s URL shortener service',               // from plugin
      apiKey: 'AIzaSyA2wTny5ZH2JGy55XURsDMlGjqXIhBtGnY',     // from DB
      getShort: function(longURL, key) => {string} shortURL, // from plugin
    }
*/
  ]
};

services.loadInstalled = function() {
  settings.local.services.forEach(service => {
    try {
      let serviceModule = new ServiceModule(service);
      services.loadedModules.push(serviceModule);
    } catch (err) {
      return winston.warn(`[plugins:SmoothShorts] ${err.message}`);
    }
  });
  console.log(services.loadedModules);
};

/*function readPackage(serviceId) {
  try {
    let pkg = require('./node_modules/nodebb-plugin-shorturls-googl');
  } catch (err) {
    console.error(err);
  }
}*/

services.installModule = function() {};

module.exports = services;
