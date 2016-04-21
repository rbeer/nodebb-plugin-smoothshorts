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

    function restoreOriginalURL() {
      if (cmenu.menuCalled) {
        cmenu.lastCalledOn.href = cmenu.lastOriginalURL;
        cmenu.lastOriginalURL = '';
        cmenu.menuCalled = false;
        cmenu.lastCalledOn = null;
      }
    }

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
