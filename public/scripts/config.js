/* global define socket config */

define('plugins/smoothshorts/config', ['translator'], function(i18n) {
  var ssConfig = {
    i18nStrings: null,
    fallback: true,
    // modifier key (ctrl, alt or shift) to enable uri replacement
    modKey: '',
    // Short URLs will use this domain, if set
    forcedDomain: ''
  };

  ssConfig.load = function(cb) {

    var done = 0;
    var loaded = function() {
      done++;
      if (done === 2) {
        console.debug('Config:', ssConfig);
        cb();
      }
    };
    socket.emit('plugins.SmoothShorts.getConfig', function(config) {
      ssConfig.modKey = config.modKey;
      ssConfig.forcedDomain = config.forcedDomain;
      return loaded();
    });
    i18n.getTranslations(config.userLang, 'smoothshorts', function(strings) {
      ssConfig.i18nStrings = strings;
      return loaded();
    });
  };

  return ssConfig;

});
