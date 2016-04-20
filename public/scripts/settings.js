/* global define, socket */

define('plugins/smoothshorts/settings', function() {
  var settings = {
    modKey: '',
    forcedDomain: ''
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
