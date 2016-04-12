/* global define socket */

define('plugins/smoothshorts/config', ['translator'], function(i18n) {
  var ssConfig = {
    fallback: true,
    // modifier key (ctrl, alt or shift) to enable uri replacement
    modKey: '',
    // Short URLs will use this domain, if set
    forcedDomain: '',
    // support introduced in https://github.com/NodeBB/NodeBB/commit/31815f7d226243411468d6ef230a5f1968b47dcd
    // tagged for NodeBB v1.0.3
    // workaround for full compatibility in the making :)
    noTeaserInfo: '[plugins:smoothshorts] This NodeBB version doesn\'t support teasers to be shortened, sorry :/\nYou can still visit the post itself and copy the short url from there! :D'
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
