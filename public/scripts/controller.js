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

    /** @namespace controller */

    /**
     * NodeBB's ajaxify.data object
     * (showing only properties plugin is working with)
     * @typedef  {Object} controller~AjaxifyData
     * @memberOf controller
     * @property {?Array.<controller~CategoryData>} categories
     * @property {?Array.<controller~PostData>}     posts
     * @property {?Array.<controller~TopicData>}    topics
     */

    /**
     * Ajaxify data, describing a teaser
     * (showing only properties plugin is working with)
     * @typedef  {Object}  controller~TeaserData
     * @memberOf controller
     * @property {?string} pid          - Introduced in NodeBB v1.0.3; earlier versions need to get it with {@link controller~ensureTeaserPids}
     * @property {string}  url          - URL to post
     */

    /**
     * Ajaxify data, describing a category
     * (showing only properties plugin is working with)
     * @typedef  {Object}                      controller~CategoryData
     * @property {Array.<controller~PostData>} posts - First entry is the teaser post. {@link controller~ensureTeaserPids} uses it, when [teaser object]{@link controller~TeaserData} has no pid.
     * @property {controller~TeaserData} teaser
     */

    /**
     * Ajaxify data, describing a topic
     * (showing only properties plugin is working with)
     * @typedef  {Object} controller~TopicData
     * @memberOf controller
     * @property {string}      slug      - Topic's URL slug
     * @property {string}      tid       - Topic's ID
     * @property {string}      postcount - Total number of posts in topic
     * @property {string}      title     - Topic's title
     * @property {?controller~TeaserData} teaser    - Topic's teaser
     */

    /**
     * Ajaxify data, describing a post
     * (showing only properties plugin is working with)
     * @typedef  {Object} controller~PostData
     * @memberOf controller
     * @property {controller~TopicData} topic - Topic the post belongs to
     * @property {number}               index - Index of post in topic
     * @property {string}               pid   - Post's ID
     */

    /**
     * Type identifier for HashedPost or HashedTopic
     * @typedef {string} controller~hashedType
     * @memberOf controller
     */

    /**
     * Parses [AjaxifyData]{@link controller~AjaxifyData} for posts/categories/topics
     * @memberOf controller
     * @inner
     */
    function parseAjaxifyData() {
      var data = ajaxify.data;
      var dataKey = data.topics ? 'topics' : data.categories ? 'categories' : null;
      var pageData = dataKey ? data[dataKey] : void 0;

      if (data.posts) {
        sockets.getHashes('posts', data.posts.map(mapHelperDelegate('posts')), addHashes);
      } else if (pageData) {
        ensureTeaserPids(pageData);
        sockets.getHashes('posts', data[dataKey].filter(helper.teaserFilter).map(mapHelperDelegate('teaser', pageData)), addHashes);
        if (dataKey === 'topics') {
          sockets.getHashes('topics', data[dataKey].map(mapHelperDelegate('topics')), addHashes);
        }
      }
    }

    /**
     * Ensures that teaser objects have a pid.
     * @memberOf controller
     * @inner
     * @param {controller~AjaxifyData} pageData
     */
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

    /**
     * Checks whether current pages teaser objects have pids
     * @memberOf controller
     * @inner
     * @param  {controller~AjaxifyData} pageData
     * @return {bool} - Result of an [].some() run. If one teaser has a pid, all do.
     */
    function teasersHavePids(pageData) {
      return pageData.some(function(dataObject) {
        return dataObject.teaser && dataObject.teaser.pid !== void 0;
      });
    }

    function mapHelperDelegate(type) {
      return function mapHelper(mapObj) {
        var fn = helper[type + 'Map'];
        return fn(mapObj, type === 'topics' ? HashedTopic : HashedPost);
      };
    }

    /**
     * Parses incoming controller~AjaxifyData when user scrolling
     * triggers loading new entries
     * @memberOf controller
     * @inner
     * @param {SomeJQueryEventObject} event
     * @param {controller~AjaxifyData} data
     */
    function addOnScrollLoad(event, data) {
      var type = event.type.split(':')[1];
      sockets.getHashes(type, data[type].map(mapHelperDelegate(type)), addHashes);
    }

    /**
     * Adds from backend received hashes to topic and post links
     * @memberOf controller
     * @inner
     * @param {controller~hashedType} type
     * @param {Array.<HashedPost|HashedTopic>} hashedObjects - Objects to add hashes for
     */
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
      /**
       * One-click button click handler
       * @memberOf controller
       * @inner
       */
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

    /**
     * Entry point; sets hooks
     * @memberOf controller
     * @inner
     */
    function init() {

      $(window).on('action:ajaxify.contentLoaded', parseAjaxifyData);
      $(window).on('action:topics.loaded action:posts.loaded', addOnScrollLoad);
      parseAjaxifyData();
    }

    // ENTRY POINT
    settings.load(init);
  });

})();
