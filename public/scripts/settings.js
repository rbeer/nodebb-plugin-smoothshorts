/* global define, socket */

/**
 * Provides plugin's settings
 * @memberOf client
 * @module settings
 */
define('plugins/smoothshorts/settings', function() {
  'use strict';

  /** @alias module:settings */
  var settings = {
    /**
     * Modifier key (ctrl, alt or shift) to enable URL replacement
     * @memberOf client.module:settings
     * @type {string}
     */
    modKey: '',
    /**
     * Short URLs will be built with this format
     * @memberOf client.module:settings
     * @type {string}
     * @example
     * 'short.com/ss/:hash'
     * 'short.com/:hash'
     * 'short.com/:hash/yolo'
     */
    shortFormat: '',
    /**
     * CSS class name for copy button icon
     * @memberOf client.module:settings
     * @type {String}
     * @default fa-external-link
     */
    copyButtonClass: 'fa-external-link'
  };

  /**
   * Load settings from backend
   * @memberOf client.module:settings
   * @param  {Function} cb - Called when settings have been received
   */
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
