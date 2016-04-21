/* global define, socket */

define('plugins/smoothshorts/sockets', function() {
  'use strict';

  /**
   * Provides socket.io connections to backend
   * @exports plugins/smoothshorts/sockets
   * @namespace sockets
   */
  var sockets = {};

  /**
   * Requests hashes
   * @memberOf sockets
   * @static
   * @param  {controller~hashedType}  type
   * @param  {HashedPost|HashedTopic} hashedObjects - Objects to get hashes for
   * @param  {controller~addHashes}   cb
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
