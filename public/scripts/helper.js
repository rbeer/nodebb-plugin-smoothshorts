/* global define, ajaxify */

(function() {
  /**
   * Provides helper functions (for e.g. [].map, [].filter)
   * @memberOf client
   * @module helper
   */
  define('plugins/smoothshorts/helper', ['plugins/smoothshorts/settings'], function(settings) {
    'use strict';

    /** @alias module:helper */
    var helper = {};

    /**
     * Polyfill for Array.from
     * @memberOf client.module:helper
     * @param {NodeList} nodeList - List of HTMLElements
     * @return {Array}
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
     * Maps [TopicData]{@link client.controller~TopicData} into [HashedTopic]{@link client.HashedTopic} objects
     * @memberOf client.module:helper
     * @param  {client.controller~TopicData} topic
     * @param  {client.HashedTopic} HashedTopic - NOT an instance!
     * @return {client.HashedTopic}             - New HashedTopic instance
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
     * Maps [PostData]{@link client.controller~PostData} into [HashedPost]{@link client.HashedPost} objects
     * @memberOf client.module:helper
     * @param  {client.controller~PostData} post
     * @param  {client.HashedPost} HashedPost - NOT an instance!
     * @return {client.HashedPost}            - New HashedPost instance
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
     * Maps [TeaserData]{@link client.controller~TeaserData} into [HashedPost]{@link client.HashedPost} objects
     * @memberOf client.module:helper
     * @param  {client.controller~TeaserData} topic
     * @param  {client.HashedPost} HashedPost - NOT an instance!
     * @return {client.HashedPost}            - New HashedPost instance
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
     * Filters [TopicData]{@link client.controller~TopicData} or [CategoryData]{@link client.controller~CategoryData} objects without [TeaserData]{@link client.controller~TeaserData} member
     * @memberOf client.module:helper
     * @param  {client.controller~TopicData|client.controller~CategoryData} obj [description]
     * @return {bool}
     */
    helper.teaserFilter = function(obj) {
      return !!obj.teaser;
    };

    /**
     * Builds short URL from [hash]{@link client.HashedPost#hash}, using
     * [shortFormat]{@link client.module:settings.shortFormat}
     * @memberOf client.module:helper
     * @param  {client.HashedPost#hash|client.HashedTopic#hash} hash
     * @return {string}
     */
    helper.buildShortURL = function(hash) {
      return location.protocol + '//' + settings.shortFormat.replace(':hash', hash);
    };

    return helper;

  });
});
