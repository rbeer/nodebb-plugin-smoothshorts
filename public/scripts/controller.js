/* global require ajaxify app */

(function() {
  'use strict';

  var deps = [
    'plugins/smoothshorts/config',
    'plugins/smoothshorts/helper',
    'plugins/smoothshorts/sockets',
    'plugins/smoothshorts/contextmenu',
    'plugins/smoothshorts/hashed/post',
    'plugins/smoothshorts/hashed/topic'
  ];

  require(deps, function(config, helper, sockets, cmenu, HashedPost, HashedTopic) {

    function parseAjaxifyData() {
      var data = ajaxify.data;
      var dataKey = data.topics ? 'topics' : data.categories ? 'categories' : null;
      if (data.posts) {
        sockets.getHashes('posts', data.posts.map(mapHelperDelegate('posts')), addHashes);
      } else if (dataKey) {
        if (canShortenTeaser(data[dataKey])) {
          sockets.getHashes('posts', data[dataKey].filter(helper.teaserFilter).map(mapHelperDelegate('teaser')), addHashes);
        } else {
          console.info(config.noTeaserInfo);
        }
        if (dataKey === 'topics') {
          sockets.getHashes('topics', data[dataKey].map(mapHelperDelegate('topics')), addHashes);
        }
      }
    }

    function canShortenTeaser(entries) {
      return entries.reduce(function(reduced, current) {
        return reduced || (current.teaser && current.teaser.pid !== void 0);
      }, false);
    }

    function mapHelperDelegate(type) {
      return function mapHelper(mapObj) {
        var fn = helper[type + 'Map'];
        return fn(mapObj, type === 'topics' ? HashedTopic : HashedPost);
      };
    }

    function addOnScrollLoad(event, data) {
      var type = event.type.split(':')[1];
      sockets.getHashes(type, data[type].map(mapHelperDelegate(type)), addHashes);
    }

    function addHashes(type, hashedObjects) {
      hashedObjects.forEach(function(obj) {
        obj.addHashToAnchor();
        cmenu.setHooks(obj);
        if (obj instanceof HashedPost && obj.shouldHaveButton() && !obj.hasButton()) {
          obj.addButton(buttonClickDelegate);
        }
      });
    }

    function buttonClickDelegate(hashedPost) {
      var copyShortUrl = function() {
        var isCopied, msg;
        var url = hashedPost.shortUrlContainer.value;
        hashedPost.shortUrlContainer.select();
        isCopied = document.execCommand('copy');
        require(['translator'], function(translator) {
          var stringTag = translator.compile('smoothshorts:hashbutton.' +
                                             (isCopied ? 'success' : 'error'),
                                             (isCopied ? url : void 0));

          translator.translate(stringTag, 'en_GB', function(message) {
            if (isCopied) {
              app.alertSuccess(message);
            } else {
              app.alertError(message);
            }
          });
        });
      };
      return copyShortUrl;
    }

    function init() {

      $(window).on('action:ajaxify.contentLoaded', parseAjaxifyData);
      $(window).on('action:topics.loaded action:posts.loaded', addOnScrollLoad);
      parseAjaxifyData();
    }

    // ENTRY POINT
    config.load(init);
  });

})();
