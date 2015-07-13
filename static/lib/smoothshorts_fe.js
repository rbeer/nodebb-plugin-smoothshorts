'use strict';

/*global socket*/

(function(window) {
  var SmoothShorts = window.SmoothShorts = {

    init: function() {
      // the link that has been right clicked when the
      // context menu (rightclick on link) got called
      this.lastTarget = null;
      // original URL for restoring
      this.originalURL = '';
      // flag, whether the context menu was opened
      this.menuCalled = false;
      // modifier key (ctrl, alt or shift) to enable uri replacement
      this.modKey = '';
      // Short URLs will use this domain, if set
      this.forcedDomain = '';

      socket.emit('plugins.SmoothShorts.getConfig', function(config) {
        SmoothShorts.modKey = config.modKey;
        SmoothShorts.forcedDomain = config.forcedDomain;
      });

      $(window).on('action:ajaxify.contentLoaded', this.parseLinks);
      $(window).on('action:posts.loaded', this.parseLinks);
      return this;
    },
    parseLinks: function(evt, data) {
      var sel = '';   // query selector
      var doms;       // DOM elements found by 'sel'
      var ids = [];   // topic or post ids
      var i = 0;      // for counter
      if (data.tpl === 'category') {
        /* hash topics in category listings */
        // get all topic ids
        sel = '[data-tid]';
        doms = document.querySelectorAll(sel);
        for (i = doms.length - 1; i >= 0; i--) {
          ids.push(doms[i].dataset.tid);
        }
        socket.emit('plugins.SmoothShorts.getTopicHashs', ids,
                    function(err, backData) {
                      if (err) {
                        return console.error(err);
                      } else {
                        SmoothShorts.assignHashs('category', backData);
                      }
                    });
        SmoothShorts.setHooks();
      } else if (data.tpl === 'topic') {
        /* hash posts inside topics */
        // get all post ids
        sel = '[data-pid]';
        doms = document.querySelectorAll(sel);
        for (i = doms.length - 1; i >= 0; i--) {
          ids.push(doms[i].dataset.pid);
        }
        socket.emit('plugins.SmoothShorts.getPostHashs', ids,
                    function(err, backData) {
                      if (err) {
                        return console.error(err);
                      } else {
                        SmoothShorts.assignHashs('topic', backData);
                      }
                    });
        SmoothShorts.setHooks();
      } else if (data.posts) {
        /* hash posts on inf-scroll */
        sel = '[data-pid]:not([data-smoothhash])';
        doms = document.querySelectorAll(sel);
        for (i = doms.length - 1; i >= 0; i--) {
          ids.push(doms[i].dataset.pid);
        }
        socket.emit('plugins.SmoothShorts.getPostHashs', ids,
                    function(err, backData) {
                      if (err) {
                        return console.error(err);
                      } else {
                        SmoothShorts.assignHashs('topic', backData);
                      }
                    });
      }
    },
    setHooks: function() {
      document.addEventListener('contextmenu',
                                SmoothShorts.replaceWithShortURL,
                                false);
      document.addEventListener('mousedown',
                                SmoothShorts.restoreOriginalURL,
                                false);
    },
    assignHashs: function(type, hashs) {
      var linkSelector = '';
      var linkDOM;
      var i = 0;
      if (type === 'category') {
        for (i = hashs.length - 1; i >= 0; i--) {
          linkSelector = '[data-tid="' + hashs[i].tid + '"] [itemprop="url"]';
          linkDOM = document.querySelector(linkSelector);
          // leave topics without hash alone
          if (hashs[i].hash !== void 0) {
            linkDOM.dataset.smoothhash = hashs[i].hash;
          }
        }
      } else if (type === 'topic') {
        for (i = hashs.length - 1; i >= 0; i--) {
          linkSelector = '[data-pid="' + hashs[i].pid + '"] .permalink';
          linkDOM = document.querySelector(linkSelector);
          // some themes don't have permalinks for posts
          // and leave posts without hash alone
          if (hashs[i].hash !== void 0 && linkDOM) {
            linkDOM.dataset.smoothhash = hashs[i].hash;
          }
        }
      }
    },
    // restore original URL on the link, that has
    // been right clicked to open the context menu.
    // the 'mousedown' handler also fires when a c-menu call
    // follows a c-menu call, since this also qualifies as a
    // (right button) 'mousedown'. Neato, isn't it? :]
    restoreOriginalURL: function(evt) {
      if (SmoothShorts.menuCalled) {
        SmoothShorts.lastTarget.href = SmoothShorts.originalURL;
        SmoothShorts.menuCalled = false;
      }
    },

    // replace href on the link that has been
    // right-clicked to open the c-menu
    replaceWithShortURL: function(evt) {
      var target;
      if (SmoothShorts.modKey !== '' &&
          !evt[SmoothShorts.modKey + 'Key']) {
        return;
      }
      if (evt.target.tagName === 'A') {
        target = evt.target;
      } else if (evt.target.parentElement.tagName === 'A' &&
                 evt.target.parentElement.dataset.smoothhash) {
        target = evt.target.parentElement;
      } else {
        return;
      }
      if (target.dataset.smoothhash !== void 0) {
        SmoothShorts.menuCalled = true;
        SmoothShorts.lastTarget = target;
        SmoothShorts.originalURL = target.href;
        SmoothShorts.lastTarget.href =
          SmoothShorts.prepareUrl(target.dataset.smoothhash);
      }
    },
    prepareUrl: function(hash) {
      if (SmoothShorts.forcedDomain !== '') {
        return '//' + SmoothShorts.forcedDomain + '/ss/' + hash;
      } else {
        return '/ss/' + hash;
      }
    }
  }.init();
}(window));
