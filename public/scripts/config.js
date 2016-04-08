/* global define socket */

define('plugins/smoothshorts/config', function() {
  var ssConfig = {
    fallback: true,
    // modifier key (ctrl, alt or shift) to enable uri replacement
    modKey: '',
    // Short URLs will use this domain, if set
    forcedDomain: ''
  };

  ssConfig.load = function(cb) {
    socket.emit('plugins.SmoothShorts.getConfig', function(config) {
      ssConfig.modKey = config.modKey;
      ssConfig.forcedDomain = config.forcedDomain;
      console.debug('Config:', config);
      return cb();
    });
  };

  return ssConfig;

});
