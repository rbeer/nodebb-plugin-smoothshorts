/* global define, socket */

/**
 * Provides socket.io connections to backend
 * @memberOf client
 * @module sockets
 */
define('plugins/smoothshorts/sockets', function() {
  'use strict';

  /** @alias module:sockets */
  var sockets = {};

  /**
   * Requests hashes
   * @memberOf client.module:sockets
   * @param  {client.controller~hashedType}  type
   * @param  {Array<client.HashedPost|client.HashedTopic>} hashedObjects - Objects to get hashes for
   * @param  {client.controller~addHashes}   cb
   */
  sockets.getHashes = function(type, hashedObjects, cb) {
    var ids = hashedObjects.map(function(obj) {
      return obj[getHashesType[type]];
    });
    socket.emit('plugins.SmoothShorts.getHashes', {
      ids: ids,
      type: type
    }, function(err, hashes) {
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
    posts: 'pid',
    topics: 'tid'
  };

  return sockets;

});
