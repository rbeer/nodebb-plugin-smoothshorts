/* global define socket */

define('plugins/smoothshorts/sockets', function() {
  'use strict';

  var sockets = {};

  sockets.getHashes = function(type, hashedObjects, cb) {
    var ids = hashedObjects.map(function(obj) {
      return obj[getHashesType[type][1]];
    });
    socket.emit('plugins.SmoothShorts.' + getHashesType[type][0], ids, function(err, hashes) {
      if (err) {
        return console.error(err);
      }
      cb(type, hashedObjects.map(function(obj, idx) {
        obj.hash = hashes[idx].hash;
        return obj;
      }));
    });
  };

  var getHashesType = {
    posts: ['getPostHashes', 'pid'],
    topics: ['getTopicHashes', 'tid']
  };

  return sockets;

});
