/* global define */

define('plugins/smoothshorts/contextmenu', ['plugins/smoothshorts/settings'], function(settings) {

  /**
   * Provides context menu method
   * @exports plugins/smoothshorts/contextmenu
   * @namespace contextmenu
   */
  var cmenu = {
    /**
     * Indicates whether context menu is open
     * @memberof contextmenu
     * @type {Boolean}
     */
    menuCalled: false,
    /**
     * Element context menu has been called on
     * @memberof contextmenu
     * @type {HTMLAnchorElement}
     */
    lastCalledOn: null,
    /**
     * href value to restore on [lastCalledOn]{@link contextmenu.lastCalledOn}
     * @memberof contextmenu
     * @type {String}
     */
    lastOriginalURL: ''
  };

  /**
   * Sets hooks 'contextmenu' on given HashedPost|Topic's anchors
   * and 'mousedown' on document.
   * @memberof contextmenu
   * @param {(HashedPost|HashedTopic)} HashedObject
   */
  cmenu.setHooks = function(HashedObject) {
    HashedObject.anchors.forEach(function(obj) {
      obj.addEventListener('contextmenu', replaceWithShortURL, false);
    });
    document.addEventListener('mousedown', restoreOriginalURL, false);
  };

  /**
   * Restores [lastOriginalURL]{@link module:plugins/smoothshorts/contextmenu.lastOriginalURL}
   * on [lastCalledOn]{@link contextmenu.lastCalledOn}
   * @memberof contextmenu
   * @inner
   * @param  {MouseEvent} event
   */
  function restoreOriginalURL(event) {
    if (cmenu.menuCalled) {
      cmenu.lastCalledOn.href = cmenu.lastOriginalURL;
      cmenu.lastOriginalURL = '';
      cmenu.menuCalled = false;
      cmenu.lastCalledOn = null;
    }
  }

  /**
   * Replaces href of an anchor with short URL.
   * @memberof contextmenu
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
    cmenu.lastCalledOn.href = prepareUrl(hash);
  }

  /**
   * Builds short URL.
   * @memberof contextmenu
   * @inner
   * @param  {string} hash
   * @return {string}
   */
  function prepareUrl(hash) {
    if (settings.forcedDomain !== '') {
      return '//' + settings.forcedDomain + '/ss/' + hash;
    } else {
      return '/ss/' + hash;
    }
  }

  return cmenu;

});
