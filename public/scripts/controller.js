/* global require, ajaxify, app */

(function() {
  'use strict';

  var deps = [
    'plugins/smoothshorts/settings',
    'plugins/smoothshorts/helper',
    'plugins/smoothshorts/sockets',
    'plugins/smoothshorts/contextmenu',
    'plugins/smoothshorts/hashed/post',
    'plugins/smoothshorts/hashed/topic'
  ];

  require(deps, function(settings, helper, sockets, cmenu, HashedPost, HashedTopic) {

    function parseAjaxifyData() {
      var data = ajaxify.data;
      var dataKey = data.topics ? 'topics' : data.categories ? 'categories' : null;
      var pageData = dataKey ? data[dataKey] : void 0;
      var hashedObjects = {
        posts: [],
        topics: []
      };

      if (data.children && data.children.length > 0) {
        data.children.forEach(function(child) {
          hashedObjects.posts = hashedObjects.posts.concat(child.posts.map(mapHelperDelegate('posts')));
        });
        hashedObjects.topics = hashedObjects.topics.concat(data.children.filter(helper.teaserFilter).map(mapHelperDelegate('lavenderTeaser')));
      }
      if (data.posts) {
        hashedObjects.posts = hashedObjects.posts.concat(data.posts.map(mapHelperDelegate('posts')));
      } else if (pageData) {
        ensureTeaserPids(pageData);
        hashedObjects.posts = hashedObjects.posts.concat(data[dataKey].filter(helper.teaserFilter).map(mapHelperDelegate('teaser', pageData)));
        if (dataKey === 'topics') {
          hashedObjects.topics = hashedObjects.topics.concat(data[dataKey].map(mapHelperDelegate('topics')));
        } else if(document.querySelector('[component="category/posts"].post-preview')) {
          hashedObjects.topics = hashedObjects.topics.concat(data[dataKey].filter(helper.teaserFilter).map(mapHelperDelegate('lavenderTeaser')));
        }
      }
      sockets.getHashes('topics', hashedObjects.topics, addHashes);
      sockets.getHashes('posts', hashedObjects.posts, addHashes);
    }

    function ensureTeaserPids(pageData) {
      if (teasersHavePids(pageData)) {
        return pageData;
      }
      return pageData.map(function(dataObject) {
        if (dataObject.teaser) {
          dataObject.teaser.pid = dataObject.posts[0].pid;
        }
        return dataObject;
      });
    }

    function teasersHavePids(pageData) {
      return pageData.some(function(dataObject) {
        return dataObject.teaser && dataObject.teaser.pid !== void 0;
      });
    }

    function mapHelperDelegate(type) {
      return function mapHelper(mapObj) {
        var fn = helper[type + 'Map'];
        return fn(mapObj, type === 'topics' || type === 'lavenderTeaser' ? HashedTopic : HashedPost);
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
        var isCopied;
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
    settings.load(init);
  });

})();
