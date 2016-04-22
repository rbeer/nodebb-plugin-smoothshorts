/* global define */

(function() {

  var deps = [
    'plugins/smoothshorts/helper',
    'plugins/smoothshorts/settings'
  ];

  /**
   * Provides context menu method
   * @memberOf client
   * @module contextmenu
   */
  define('plugins/smoothshorts/contextmenu', deps, function(helper, settings) {

    /** @alias module:contextmenu */
    var cmenu = {

      /**
       * Indicates whether context menu is open
       * @memberof client.module:contextmenu
       * @type {Boolean}
       * @default false
       */
      menuCalled: false,
      /**
       * Element context menu has been called on
       * @memberof client.module:contextmenu
       * @type {HTMLAnchorElement}
       * @default null
       */
      lastCalledOn: null,
      /**
       * href value to restore on [lastCalledOn]{@link client.module:contextmenu.lastCalledOn}
       * @memberof client.module:contextmenu
       * @type {String}
       */
      lastOriginalURL: ''
    };

    /**
     * Sets hooks 'contextmenu' on given [HashedPost]{@link client.HashedPost}|[HashedTopic]{@link client.HashedTopic}'s anchors
     * and 'mousedown' on document.
     * @memberof client.module:contextmenu
     * @param {(HashedPost|HashedTopic)} HashedObject
     */
    cmenu.setHooks = function(HashedObject) {
      HashedObject.anchors.forEach(function(obj) {
        obj.addEventListener('contextmenu', replaceWithShortURL, false);
      });
      document.addEventListener('mousedown', restoreOriginalURL, false);
    };

    /**
     * Restores [lastOriginalURL]{@link client.module:contextmenu.lastOriginalURL}
     * on [lastCalledOn]{@link client.module:contextmenu.lastCalledOn}
     * @memberof client.module:contextmenu
     * @inner
     */
    function restoreOriginalURL() {
      if (cmenu.menuCalled) {
        cmenu.lastCalledOn.href = cmenu.lastOriginalURL;
        cmenu.lastOriginalURL = '';
        cmenu.menuCalled = false;
        cmenu.lastCalledOn = null;
      }
    }

    /**
     * Replaces href of an anchor with short URL.
     * @memberof client.module:contextmenu
     * @inner
     * @param  {MouseEvent} event
     */
    function replaceWithShortURL(event) {
      var hash;
      var clickedAnchor = event.target.dataset.smoothhash ?
                          event.target :
                          $(event.target).parents('[data-smoothhash]')[0];
      if ((settings.modKey !== '' && !event[settings.modKey + 'Key']) || !clickedAnchor) {
        return;
      }
      hash = clickedAnchor.dataset.smoothhash;
      cmenu.menuCalled = true;
      cmenu.lastCalledOn = clickedAnchor;
      cmenu.lastOriginalURL = cmenu.lastCalledOn.href;
      cmenu.lastCalledOn.href = helper.buildShortURL(hash);
    }

    return cmenu;

  });
})();
