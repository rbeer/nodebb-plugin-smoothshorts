/* global define ajaxify app */

(function() {

  var deps = [
    'plugins/smoothshorts/settings',
    'plugins/smoothshorts/helper'
  ];

  define('plugins/smoothshorts/hashed/post', deps, function(settings, helper) {
    'use strict';

    /**
     * Data object for HashedPost constructor
     * @typedef {HashedPostData}
     * @property {!string} pid
     * @property {?string} url
     * @property {?number} index
     * @property {!Object} topicData
     * @property {!string} topicData.title
     * @property {?string} topicData.slug
     */

    var HashedPost = function(data) {
      this.url = data.url || '/topic/' + data.topicData.slug + '/' + data.index;
      this.pid = data.pid;
      this.index = !isNaN(data.index) ? data.index : data.url.match(/\d*(?:#.*)?$/);
      this.anchors = getAnchors(this.url, data.topicData.title);
      this.hash = null;
      this.button = null;
      this.shortUrlContainer = null;
      return this;
    };

    HashedPost.prototype.addHashToAnchor = function() {
      var self = this;
      this.anchors.forEach(function(anchor) {
        anchor.dataset.smoothhash = self.hash;
      });
    };

    HashedPost.prototype.addButton = function(handler) {
      var self = this;
      var buttonData = { shortUrl: buildShortUrl(this.hash) };
      app.parseAndTranslate('smoothshorts/copybutton', buttonData, function($element) {
        $(self.anchors[0]).after($element);
        $element.children('i').tooltip();
        self.button = $element[0];
        self.shortUrlContainer = self.button.querySelector('input');
        self.button.addEventListener('click', handler.call(null, self));
      });
    };

    HashedPost.prototype.shouldHaveButton = function() {
      var tplRegX = /^topic$|(?:account|groups)\/(?:posts|profile|best|(?:up|down)voted|details|favourites)/;
      var itShould = true;
      switch(false) {
        case (itShould = document.queryCommandSupported('copy')): break;
        case (itShould = tplRegX.test(ajaxify.data.template.name)): break;
      }
      return itShould;
    };

    HashedPost.prototype.hasButton = function() {
      return !!this.button;
    };

    function buildShortUrl(hash) {
      var origin = settings.forcedDomain ?
                   location.origin.replace(location.host, settings.forcedDomain) :
                   location.origin;
      var path = '/ss/' + hash;
      return origin + path;
    }

    function getAnchors(url, topicTitle) {
      var anchors = document.querySelectorAll(':not([component="notifications/list"]) a[href="' + url + '"]');
      return helper.ArrayFromNodeList(anchors).filter(function(anchor) {
        return anchor.textContent !== topicTitle;
      });
    }

    return HashedPost;

  });
})();
