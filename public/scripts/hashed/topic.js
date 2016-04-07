/* global define */

define('plugins/smoothshorts/hashed/topic', ['plugins/smoothshorts/helper'], function(helper) {
  'use strict';

  /**
   * Data object for HashedTopic constructor
   * @typedef {HashedTopicData}
   * @property {!string} slug
   * @property {!string} tid
   * @property {!string} postcount
   * @property {!string} title
   */

  var HashedTopic = function(data) {
    this.url = '/topic/' + data.slug;
    this.tid = data.tid;
    this.anchors = getAnchors(this.url, data.postcount, data.title);
    this.hash = null;
    return this;
  };

  HashedTopic.prototype.addHashToAnchor = function() {
    var self = this;
    this.anchors.forEach(function(anchor) {
      anchor.dataset.smoothhash = self.hash;
    });
  };

  function getAnchors(url, postcount, title) {
    var anchors = document.querySelectorAll('[component="category/topic"] a');
    return helper.ArrayFromNodeList(anchors).filter(function(element) {
      return (postcount === '1' && element.getAttribute('href') === url) ||
             (element.textContent === title);
    });
  }

  return HashedTopic;

});
