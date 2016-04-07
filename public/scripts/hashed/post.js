/* global define */

define('plugins/smoothshorts/hashed/post', ['plugins/smoothshorts/helper'], function(helper) {
  'use strict';

  /**
   * Data object for HashedPost constructor
   * @typedef {HashedPostData}
   * @property {!string} pid
   * @property {?string} url
   * @property {?number} index
   * @property {?Object} topicData
   * @property {string}  topicData.title
   * @property {string}  topicData.slug
   */

  var HashedPost = function(data) {
    this.url = data.url || '/topic/' + data.topicData.slug + '/' + data.index;
    this.pid = data.pid;
    this.index = !isNaN(data.index) ? data.index : data.url.match(/\d*(?:#.*)?$/);
    this.anchors = getAnchors(this.url, data.topicData.title);
    this.hash = null;
    this.button = createButton();
    return this;
  };

  HashedPost.prototype.addHashToAnchor = function() {
    var self = this;
    this.anchors.forEach(function(anchor) {
      anchor.dataset.smoothhash = self.hash;
    });
  };

  HashedPost.prototype.addButton = function(handler) {
    // move to template; cause i18n,
    // easier customizable for other templates, yada, yada :]
    this.anchors[0].insertAdjacentHTML('afterend', this.button.outerHTML);
    this.button = this.anchors[0].nextSibling;
    $(this.button).tooltip();
    this.button.addEventListener('click', handler);
  };

  function createButton() {
    var icon = document.createElement('i');
    icon.dataset.toggle = 'tooltip';
    icon.dataset.placement = 'top';
    icon.dataset.title = 'Click to copy this posts short url!';
    icon.className = 'fa fa-hashtag pointer hashedpost-button';
    return icon;
  }

  function getAnchors(url, topicTitle) {
    var anchors = document.querySelectorAll(':not([component="notifications/list"]) a[href="' + url + '"]');
    return helper.ArrayFromNodeList(anchors).filter(function(anchor) {
      return anchor.textContent !== topicTitle;
    });
  }

  return HashedPost;

});
