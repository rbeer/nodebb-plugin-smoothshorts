/* global define */

(function() {

  var deps = [
    'plugins/smoothshorts/helper',
    'plugins/smoothshorts/settings'
  ];

  define('plugins/smoothshorts/contextmenu', deps, function(helper, settings) {

    var cmenu = {
      menuCalled: false,
      lastCalledOn: null,
      lastOriginalURL: ''
    };

    cmenu.setHooks = function(HashedObject) {
      HashedObject.anchors.forEach(function(obj) {
        obj.addEventListener('contextmenu', replaceWithShortURL, false);
      });
      document.addEventListener('mousedown', restoreOriginalURL, false);
    };

    // restore original URL on the link, that has
    // been right clicked to open the context menu.
    // the 'mousedown' handler also fires when a c-menu call
    // follows a c-menu call, since this also qualifies as a
    // (right button) 'mousedown'. Neato, isn't it? :]
    function restoreOriginalURL(event) {
      if (cmenu.menuCalled) {
        cmenu.lastCalledOn.href = cmenu.lastOriginalURL;
        cmenu.lastOriginalURL = '';
        cmenu.menuCalled = false;
        cmenu.lastCalledOn = null;
      }
    }

    // replace href on the link that has been
    // right-clicked to open the c-menu
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
