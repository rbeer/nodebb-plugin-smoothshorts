/* global define socket */

define('plugins/smoothshorts/settings', function() {
  
  /**
   * Provides plugin's settings
   * @exports plugins/smoothshorts/settings
   * @namespace settings
   */
  var settings = {
    /**
     * Modifier key (ctrl, alt or shift) to enable URL replacement
     * @type {string}
     */
    modKey: '',
    /**
     * Short URLs will use this domain, if set
     * @type {string}
     */
    forcedDomain: ''
  };

  /**
   * Load settings from backend
   * @memberOf settings
   * @param  {Function} cb - Called when settings have been received
   */
  settings.load = function(cb) {
    socket.emit('plugins.SmoothShorts.getConfig', function(data) {
      settings.modKey = data.modKey;
      settings.forcedDomain = data.forcedDomain;
      return cb();
    });
  };

  return settings;

});
