/* global define */

define('plugins/smoothshorts/hashed/topic', ['plugins/smoothshorts/helper'], function(helper) {
  'use strict';

  /**
   * Represents a shortened topic URL.
   * This URL can belong to multiple HTMLAnchorElements in the DOM.
   * @constructs client.HashedTopic
   * @param {!Object} data
   * @param {!string} data.slug
   * @param {!string} data.tid
   * @param {!string} data.postcount
   * @param {!string} data.title
   */
  var HashedTopic = function(data) {
    /**
     * Topic's URL
     * @instance
     * @type {string}
     */
    this.url = '/topic/' + data.slug;
    /**
     * Topic's ID
     * @instance
     * @type {number}
     */
    this.tid = data.tid;
    /**
     * Anchor elements using topic's URL
     * @instance
     * @type {Array.<HTMLAnchorElement>}
     */
    this.anchors = getAnchors(this.url, data.postcount, data.title);
    /**
     * Hash used for this topic's short URL
     * @instance
     * @type {string}
     */
    this.hash = null;
    return this;
  };

  /**
   * Adds data-smoothhash="[hash]{@link client.HashedTopic#hash}" to
   * all [anchors]{@link client.HashedTopic#anchors}
   * @instance
   * @memberOf client.HashedTopic
   * @todo Extract superclass - DRY with {@link client.HashedPost#addHashToAnchor}
   */
  HashedTopic.prototype.addHashToAnchor = function() {
    var self = this;
    this.anchors.forEach(function(anchor) {
      anchor.dataset.smoothhash = self.hash;
    });
  };

  /**
   * Collects anchor elements from DOM and stores them
   * in instances [anchors]{@link client.HashedTopic#anchors}
   * @inner
   * @memberOf client.HashedTopic
   * @param {!string} url       - URL to find anchors
   * @param {!string} postcount - Topic's postcount to filter out something - forgot what, though; might even be deprecated... ^_^
   * @param {!string} title     - Topic's title to filter out false selector positives
   * @todo Extract superclass - DRY with {@link client.HashedPost~getAnchors}
   */
  function getAnchors(url, postcount, title) {
    var anchors = document.querySelectorAll('[component="category/topic"] a');
    return helper.ArrayFromNodeList(anchors).filter(function(element) {
      return (postcount === '1' && element.getAttribute('href') === url) ||
             (element.textContent.trim() === title);
    });
  }

  return HashedTopic;

});
