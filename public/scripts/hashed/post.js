/* global define ajaxify */

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
    this.button = null;
    this.copyContainer = null;
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
    this.anchors[0].insertAdjacentHTML('afterend', this.button.outerHTML);
    this.button = this.anchors[0].nextSibling;
    $(this.button).tooltip();
    this.button.addEventListener('click', handler.call(null, self));
  };

  HashedPost.prototype.hasButton = function() {
    var tplRegX = /^topic$|(?:account|groups)\/(?:posts|profile|best|(?:up|down)voted|details|favourites)/;
    var elements;
    var itHas = true;

    switch(false) {
    case (itHas = document.queryCommandSupported('copy')):
      break;
    case (itHas = tplRegX.test(ajaxify.data.template.name)):
      break;
    case !!this.button:
      elements = createButtonElements(this.hash);
      this.button = elements.button;
      this.copyContainer = elements.copyContainer;
      break;
    }
    return itHas;
  };

  function createButtonElements(hash) {
    // move to template
    var icon = document.createElement('i');
    var shortUrlSpan = document.createElement('span');
    
    shortUrlSpan.className = 'shorturl-hidden';
    shortUrlSpan.innerHTML = 'http://localhost:4567/ss/' + hash;

    icon.dataset.toggle = 'tooltip';
    icon.dataset.placement = 'top';
    icon.dataset.title = 'Click to copy this posts short url!';
    icon.className = 'fa fa-hashtag pointer hashedpost-button';
    icon.appendChild(shortUrlSpan);
    return {
      button: icon,
      copyContainer: shortUrlSpan
    };
  }

  function getAnchors(url, topicTitle) {
    var anchors = document.querySelectorAll(':not([component="notifications/list"]) a[href="' + url + '"]');
    return helper.ArrayFromNodeList(anchors).filter(function(anchor) {
      return anchor.textContent !== topicTitle;
    });
  }

  return HashedPost;

});
