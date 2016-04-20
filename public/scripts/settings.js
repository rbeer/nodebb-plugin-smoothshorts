/* global define, socket */

define('plugins/smoothshorts/settings', function() {
  'use strict';

  var settings = {
    modKey: '',
    shortFormat: '',
    copyButtonClass: 'fa-external-link'
  };

  settings.load = function(cb) {
    socket.emit('plugins.SmoothShorts.getConfig', function(data) {
      settings.modKey = data.modKey;
      settings.shortFormat = data.shortFormat;
      settings.copyButtonClass = data.copyButtonClass;
      return cb();
    });
  };

  return settings;

});
