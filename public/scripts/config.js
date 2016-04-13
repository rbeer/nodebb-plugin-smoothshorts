/* global define socket */

define('plugins/smoothshorts/config', ['translator'], function(i18n) {
  var ssConfig = {
    // modifier key (ctrl, alt or shift) to enable uri replacement
    modKey: '',
    // Short URLs will use this domain, if set
    forcedDomain: ''
  };

  ssConfig.load = function(cb) {
    socket.emit('plugins.SmoothShorts.getConfig', function(config) {
      ssConfig.modKey = config.modKey;
      ssConfig.forcedDomain = config.forcedDomain;
      return cb();
    });
  };

  return ssConfig;

});
