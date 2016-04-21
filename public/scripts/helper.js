/* global define, ajaxify */

define('plugins/smoothshorts/helper', ['plugins/smoothshorts/settings'], function(settings) {
  'use strict';

  /**
   * Provides helper functions (for e.g. [].map, [].filter)
   * @exports plugins/smoothshorts/helper
   * @namespace helper
   */
  var helper = {};

  /**
   * Polyfill for Array.from
   * @memberOf helper
   * @static
   * @param {NodeList} nodeList - List of HTMLAnchorElements
   */
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

  /**
   * Maps controller~TopicData into HashedTopic objects
   * @memberOf helper
   * @static
   * @param  {controller~TopicData} topic
   * @param  {HashedTopic} HashedTopic - NOT an instance!
   * @return {HashedTopic}             - New HashedTopic instance
   */
  helper.topicsMap = function(topic, HashedTopic) {
    return new HashedTopic({
      slug: topic.slug,
      tid: topic.tid,
      postcount: topic.postcount,
      title: topic.title
    });
  };

  /**
   * Maps controller~PostData into HashedPost objects
   * @memberOf helper
   * @static
   * @param  {controller~PostData} post
   * @param  {HashedPost} HashedPost - NOT an instance!
   * @return {HashedPost}            - New HashedPost instance
   */
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

  /**
   * Maps controller~TeaserData into HashedPost objects
   * @memberOf helper
   * @static
   * @param  {controller~TeaserData} topic
   * @param  {HashedPost} HashedPost - NOT an instance!
   * @return {HashedPost}            - New HashedPost instance
   */
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

  /**
   * Filters out TopicData or CategoryData objects without TeaserData member
   * @memberOf helper
   * @static
   * @param  {controller~TopicData|controller~CategoryData} obj [description]
   * @return {bool}
   */
  helper.teaserFilter = function(obj) {
    return !!obj.teaser;
  };

  /**
   * Builds short URL from [hash]{@link HashedPost#hash} and
   * [forcedDomain]{@link settings.forcedDomain} or current location.host
   * @inner
   * @memberOf helper
   * @param  {HashedPost#hash|HashedTopic#hash} hash - Instances hash
   * @return {string}
   */
  helper.buildShortURL = function(hash) {
    return location.protocol + '//' + settings.shortFormat.replace(':hash', hash);
  };

  return helper;

});
