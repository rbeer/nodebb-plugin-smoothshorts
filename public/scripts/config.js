/* global define socket */

define('plugins/smoothshorts/settings', function() {
  var settings = {
    // modifier key (ctrl, alt or shift) to enable uri replacement
    modKey: '',
    // Short URLs will use this domain, if set
    forcedDomain: ''
  };

  settings.load = function(cb) {
    socket.emit('plugins.SmoothShorts.getConfig', function(data) {
      settings.modKey = data.modKey;
      settings.forcedDomain = data.forcedDomain;
      return cb();
    });
  };

  return settings;

});
