/* global define, ajaxify, app */

(function() {

  var deps = [
    'plugins/smoothshorts/settings',
    'plugins/smoothshorts/helper'
  ];

  define('plugins/smoothshorts/hashed/post', deps, function(settings, helper) {
    'use strict';

    /**
     * Represents a shortened post URL.
     * This URL can belong to multiple HTMLAnchorElements in the DOM.
     * @constructs client.HashedPost
     * @param {!Object} data
     * @param {!string} data.pid
     * @param {?string} data.url
     * @param {?number} data.index
     * @param {!Object} data.topicData
     * @param {!string} data.topicData.title
     * @param {?string} data.topicData.slug
     */
    var HashedPost = function(data) {

      /**
       * Posts's URL
       * @instance
       * @type {string}
       */
      this.url = data.url || '/topic/' + data.topicData.slug + '/' + data.index;
      /**
       * Post's ID
       * @instance
       * @type {number}
       */
      this.pid = data.pid;
      /**
       * Index of post in its topic
       * @instance
       * @type {number}
       */
      this.index = !isNaN(data.index) ? data.index : parseInt(data.url.match(/\d*(?:#.*)?$/), 10);
      /**
       * Anchor elements using post's URL
       * @instance
       * @type {Array.<HTMLAnchorElement>}
       */
      this.anchors = getAnchors(this.url, data.topicData.title);
      /**
       * Hash used for this post's short URL
       * @instance
       * @type {string}
       */
      this.hash = null;
      /**
       * smoothshorts/copybutton component
       * @instance
       * @type {HTMLDivElement}
       */
      this.button = null;
      /**
       * Text input element to copy short URL from
       * @instance
       * @type {HTMLInputElement}
       */
      this.shortUrlContainer = null;
      return this;
    };

    /**
     * Adds data-smoothhash="[hash]{@link client.HashedPost#hash}" to
     * all [anchors]{@link client.HashedPost#anchors}
     * @instance
     * @memberOf client.HashedPost
     * @todo Extract superclass - DRY with {@link HashedTopic#addHashToAnchor}
     */
    HashedPost.prototype.addHashToAnchor = function() {
      var self = this;
      this.anchors.forEach(function(anchor) {
        anchor.dataset.smoothhash = self.hash;
      });
    };

    /**
     * Inserts instances [button]{@link client.HashedPost#button} directly
     * after all [anchors]{@link client.HashedPost#anchors}
     * @instance
     * @memberOf client.HashedPost
     * @param {client.controller.buttonClickDelegate} handler - Called on click
     */
    HashedPost.prototype.addButton = function(handler) {
      var self = this;
      var buttonData = {
        shortUrl: helper.buildShortURL(this.hash),
        copyButtonClass: settings.copyButtonClass
      };
      app.parseAndTranslate('smoothshorts/copybutton', buttonData, function($element) {
        $(self.anchors[0]).after($element);
        $element.children('i').tooltip();
        self.button = $element[0];
        self.shortUrlContainer = self.button.querySelector('input');
        self.button.addEventListener('click', handler.call(null, self));
      });
    };

    /**
     * Performs tests (e.g. 'copy' command availabilty) whether
     * [button]{@link client.HashedPost#button} should be added or not.
     * @instance
     * @memberOf client.HashedPost
     * @return {bool} False as soon as one test fails
     */
    HashedPost.prototype.shouldHaveButton = function() {
      var tplRegX = /^topic$|(?:account|groups)\/(?:posts|profile|best|(?:up|down)voted|details|favourites)/;
      var itShould = true;
      switch(false) {
        case (itShould = document.queryCommandSupported('copy')): break;
        case (itShould = tplRegX.test(ajaxify.data.template.name)): break;
      }
      return itShould;
    };

    /**
     * Tests whether instance already has a button
     * @instance
     * @memberOf client.HashedPost
     * @return {Boolean}
     */
    HashedPost.prototype.hasButton = function() {
      return !!this.button;
    };

    /**
     * Collects anchor elements from DOM and stores them
     * in instances [anchors]{@link client.HashedPost#anchors}
     * @inner
     * @memberOf client.HashedPost
     * @param {string} url        - URL to find anchors
     * @param {string} topicTitle - Title of post's topic to filter topic links
     * @todo Extract superclass - DRY with {@link client.HashedTopic~getAnchors}
     */
    function getAnchors(url, topicTitle) {
      var anchors = document.querySelectorAll(':not([component="notifications/list"]) a[href="' + url + '"]');
      return helper.ArrayFromNodeList(anchors).filter(function(anchor) {
        return anchor.textContent !== topicTitle;
      });
    }

    return HashedPost;

  });
})();
