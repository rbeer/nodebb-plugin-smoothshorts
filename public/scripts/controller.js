/* global require ajaxify */

(function() {
  'use strict';

  var deps = [
    'plugins/smoothshorts/config',
    'plugins/smoothshorts/dom',
    'plugins/smoothshorts/sockets',
    'plugins/smoothshorts/hashed/post',
    'plugins/smoothshorts/hashed/topic'
  ];

  require(deps, function(config, dom, sockets, HashedPost, HashedTopic) {

    function parseAjaxifyData() {
      var data = ajaxify.data;
      if (data.posts) {
        sockets.getHashes('posts', data.posts.map(postsMap), addHashes);
      } else {
        var dataSet = data.topics || data.categories;
        if (dataSet) {
          sockets.getHashes('posts', dataSet.filter(teaserFilter).map(teaserMap), addHashes);
        }
        if (data.topics) {
          sockets.getHashes('topics', dataSet.map(topicsMap), addHashes);
        }
      }
    }

    function topicsMap(topic) {
      console.log(topic);
      return new HashedTopic({
        slug: topic.slug,
        tid: topic.tid,
        postcount: topic.postcount,
        title: topic.title
      });
    }

    function postsMap(post) {
      var topicTitle = post.topic ? post.topic.title : ajaxify.data.title;
      var topicSlug = post.topic ? post.topic.slug : ajaxify.data.slug;
      var index = post.topic ? post.index : post.index + 1;
      return new HashedPost({
        pid: post.pid,
        url: null,
        index: index,
        topicData: {
          title: topicTitle,
          slug: topicSlug
        }
      });
    }

    function teaserMap(topic) {
      return new HashedPost({
        pid: topic.teaser.pid,
        url: topic.teaser.url,
        index: topic.teaser.index,
        topicData: {
          title: topic.title,
          slug: topic.slug
        }
      });
    }

    function teaserFilter(obj) {
      return !!obj.teaser;
    }

    function addHashes(type, hashedObjects) {
      hashedObjects.forEach(function(obj) {
        obj.addHashToAnchor();
        if (obj instanceof HashedPost && obj.shouldHaveButton() && !obj.hasButton()) {
          obj.addButton(buttonClickDelegate);
        }
      });
    }

    function buttonClickDelegate(hashedPost) {
      var copyShortUrl = function() {
        hashedPost.shortUrlContainer.select();
        console.log(document.execCommand('copy'));
      };
      return copyShortUrl;
    }

    config.load(function() {
      $(window).on('action:ajaxify.contentLoaded', parseAjaxifyData);
    });
  });

})();
