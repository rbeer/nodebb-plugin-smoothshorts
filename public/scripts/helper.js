/* global define, ajaxify */

define('plugins/smoothshorts/helper', ['plugins/smoothshorts/settings'], function(settings) {
  'use strict';

  var helper = {};

  helper.ArrayFromNodeList = function(nodeList) {
    if (!Array.from) {
      var nodeArray = [];
      for (var i = 0; i < nodeList.length; i++) {
        nodeArray.push(nodeList.item(i));
      }
      return nodeArray;
    } else {
      return Array.from(nodeList);
    }
  };

  helper.topicsMap = function(topic, HashedTopic) {
    return new HashedTopic({
      slug: topic.slug,
      tid: topic.tid,
      postcount: topic.postcount,
      title: topic.title
    });
  };

  helper.postsMap = function(post, HashedPost) {
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
  };

  helper.teaserMap = function(topic, HashedPost) {
    return new HashedPost({
      pid: topic.teaser.pid,
      url: topic.teaser.url,
      index: topic.teaser.index,
      topicData: {
        title: topic.title,
        slug: topic.slug
      }
    });
  };

  helper.lavenderTeaserMap = function(category, HashedTopic) {
    var topic = category.posts[0].topic;
    topic.tid = topic.slug.split('/')[0];
    topic.postcount = 1;
    return helper.topicsMap(topic, HashedTopic);
  };

  helper.teaserFilter = function(obj) {
    return !!obj.teaser;
  };

  helper.buildShortURL = function(hash) {
    return location.protocol + '//' + settings.shortFormat.replace(':hash', hash);
  };

  return helper;

});
