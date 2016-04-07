/* global define */

define('plugins/smoothshorts/helper', function() {
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

  return helper;

});
