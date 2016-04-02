/* global define */

define('plugins/smoothshorts/helper', function() {
  'use strict';

  var helper = {};

  helper.ArrayFromNodeList = function(linkNodes) {
    if (!Array.from) {
      var linksArray = [];
      for (var i = 0; i < linkNodes.length; i++) {
        linksArray.push(linkNodes.item(i));
      }
      return linksArray;
    } else {
      return Array.from(linksNodes);
    }
  };

  return helper;

});