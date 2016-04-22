/**
 * Reports that NodeBB is in startup sequence. Used to initialise plugins
 * @event nodebb-core."static:app.load"
 * @property {app}      app - Express app object for access to router, middlewares, etc.
 * @property {function} cb  - Expects to be called with updated app object
 * @example
 * // listener
 * function init(app, cb) {
 *   app.router.get('/foo/:bar', app.middleware.handleRoute);
 *   try {
 *     couldFail();
 *   } catch (err) {
 *     return cb(err);
 *   }
 *   cb(null, app);
 * }
 *
 * // plugin.json
 * "hooks": [
 *   { "hook": "static:app.load", "method": "init" }
 * ]
 */

/**
 * Reports that NodeBB is ready to accept custom ACP menu items
 * @event nodebb-core."filter:admin.header.build"
 * @property {Object}         custom_header
 * @property {Array.<Object>} custom_header.plugins - Plugin menu entries; see example for structure
 * @property {function}       cb                    - Expects to be called with updated custom_header object
 * @example
 * // listener
 * function addMenuItem(custom_header, cb) {
 *   custom_header.plugins.push({
 *     route: '/plugins/smoothshorts', // Path for menu entry, relative to /admin/
 *     icon: 'fa-location-arrow',      // Fontawesome class name for icon shown on menu entry (legacy! <= NodeBB 0.7.x)
 *     name: 'SmoothShorts'            // Text shown on menu entry
 *   });
 *   cb(null, custom_header);
 * };
 *
 * // plugin.json
 * "hooks": [
 *   { "hook": "filter:admin.header.build", "method": "addMenuItem" }
 * ]
 */

/**
 * Emitted when a new topic is being saved
 * @event nodebb-core."action:topic.save"
 * @example
 * // listener
 * function topicSaveHandler(topicData) {
 *   pluginMagic(topicData.title, topicData.tid, topicData.uid, function(err) {
 *     if(err) {
 *       return console.error(err);
 *     }
 *     console.debug(`User ID ${topicData.uid} just yanked ${topicData.title} out of a hat! Magic be magical!`);
 *   });
 * }
 *
 * // plugin.json
 * "hooks": [
 *   { "hook": "action:topic.save", "method": "topicSaveHandler" },
 * ]
 */

/**
 * Emitted when a topic is being purged (i.e. deleted from DB)
 * @event nodebb-core."action:topic.purge"
 * @example
 * // listener
 * function topicPurgeHandler(tid) {
 *   console.debug(`Topic with id ${tid} has been purged`);
 * }
 * // plugin.json
 * "hooks": [
 *   { "hook": "action:topic.purge", "method": "topicPurgeHandler" },
 * ]
 */

/**
 * Emitted when a new post is being saved
 * @event nodebb-core."action:post.save"
 * @example
 * // listener
 * function postSaveHandler(postData) {
 *   pluginMagic(postData.content, postData.pid, function(err) {
 *     if(err) {
 *       return console.error(err);
 *     }
 *     console.debug(`... and all the sudden ${postData.tid} has a post more. *poof*!`);
 *   });
 * }
 *
 * // plugin.json
 * "hooks": [
 *   { "hook": "action:post.save", "method": "postSaveHandler" },
 * ]
 */

/**
 * Emitted when a post is being purged (i.e. deleted from DB)
 * @event nodebb-core."action:post.purge"
 * @example
 * // listener
 * function postPurgeHandler(pid) {
 *   console.debug(`Post with id ${pid} has been deleted`);
 * }
 *
 * // plugin.json
 * "hooks": [
 *   { "hook": "action:post.purge", "method": "postPurgeHandler" },
 * ]
 */
