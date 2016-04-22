/* global app, socket */

$(document).ready(function() {
  'use strict';

  /**
   * @namespace controller
   * @memberOf acp
   */

  /**
   * Checkbox Element, indicating whether to use set [modifier key]{@link acp.controller.ddModKey}
   * @memberOf acp.controller
   * @type {HTMLInputElement}
   */
  var useModKey = document.getElementById('useModKey');
  /**
   * Dropdown selection Element to set (possible) modifier key
   * @see acp.controller.useModKey
   * @memberOf acp.controller
   * @type {HTMLSelectElement}
   */
  var ddModKey = document.getElementById('modKey');
  /**
   * Text input Element to define short URL format
   * @memberOf acp.controller
   * @type {HTMLInputElement}
   */
  var shortFormat = document.getElementById('shortFormat');
  /**
   * JQuery instance of [shortFormat]{@link acp.controller.shortFormat}
   * @memberOf acp.controller
   * @type {jQuery}
   */
  var $shortFormat = $(shortFormat);

  /**
   * Button to select icon for copy button
   * @memberOf acp.controller
   * @type {HTMLButtonElement}
   */
  var copyButtonIcon = document.getElementById('copyButtonIcon');
  /**
   * Button to trigger hashing of unhashed posts/topics
   * @memberOf acp.controller
   * @type {HTMLButtonElement}
   */
  var btnHash = document.getElementById('btnHash');
  /**
   * Button to save settings
   * @memberOf acp.controller
   * @type {HTMLButtonElement}
   */
  var btnSave = document.getElementById('btnSave');

  /**
   * Holds Elements for 'status' (i.e. # of hashed/unhased topics and posts)
   * @memberOf acp.controller
   * @type {Object}
   * @property {HTMLDivElement} topicTotal - Shows total # of topics
   * @property {HTMLDivElement} topic      - Shows # of hashed topics
   * @property {HTMLDivElement} topicWell  - Wraps topicTotal and topic; indicates missing hashes with red border-left/right
   * @property {HTMLDivElement} postTotal  - Shows total # of posts
   * @property {HTMLDivElement} post       - Shows # of hashed posts
   * @property {HTMLDivElement} postWell   - Wraps postsTotal and post; indicates missing hashes with red border-left/right
   */
  var counter = {
    topicTotal: document.getElementById('topicCount'),
    topic: document.getElementById('topicHashCount'),
    topicWell: document.getElementById('topicWell'),
    postTotal: document.getElementById('postCount'),
    post: document.getElementById('postHashCount'),
    postWell: document.getElementById('postWell')
  };

  /**
   * Disables/Enables [ddModKey]{@link acp.controller.ddModKey}
   * @memberOf acp.controller
   * @inner
   * @method handleUseModKey
   * @param  {MouseEvent} event
   */
  useModKey.addEventListener('click', function handleUseModKey(event) {
    ddModKey.disabled = !event.target.checked;
  });

  /**
   * Saves settings
   * @memberOf acp.controller
   * @inner
   * @method saveSettings
   * @param {MouseEvent} event
   */
  btnSave.addEventListener('click', function(event) {
    event.preventDefault();
    if (!validateShortFormat()) {
      return app.alertError('Please define the position of post/topic hash with :hash !');
    }
    socket.emit('admin.plugins.SmoothShorts.saveSettings', {
      useModKey: useModKey.checked,
      modKey: ddModKey.selectedOptions.item(0).value.toLowerCase(),
      shortFormat: shortFormat.value,
      copyButtonClass: copyButtonIcon.firstElementChild.value
    }, function(err) {
      if (err) {
        app.alertError('Couldn\'t save settings.');
        return console.error(err);
      }
      var alertOptions = {
        title: 'Settings saved',
        message: 'Please restart your NodeBB to apply the new settings!',
        clickfn: function() {
          require(['admin/modules/instance'], function(instance) {
            instance.reload();
          });
        }
      };
      app.alert(alertOptions);
    });
  });

  /**
   * Starts hashing unhashed topics/posts
   * @memberOf acp.controller
   * @inner
   * @method hashMissing
   */
  btnHash.addEventListener('click', function() {
    socket.emit('admin.plugins.SmoothShorts.hashMissing', function(err) {
      if (err) {
        return app.alertError(err.message);
      }
    });
  });

  /**
   * Checks whether acp.[controller]{@link acp.controller.shortFormat}
   * includes the `:hash` keyword
   * @inner
   * @return {bool}
   */
  function validateShortFormat() {
    return shortFormat.value.length === 0 || shortFormat.value.indexOf(':hash') !== -1;
  }

  /**
   * Updates acp.controller.counter Elements on newhash-message
   * from backend
   * @memberOf acp.controller
   * @inner
   * @param  {Object} data
   */
  function handleNewHash(data) {
    var target = counter[data.type];
    var total = counter[data.type + 'Total'];
    target.innerText = parseInt(target.innerText, 10) + 1;
    if (target.innerText === total.innerText) {
      counter[data.type + 'Well'].classList.remove('cout-warn');
      app.alertSuccess('All ' + data.type + ' hashed.');
    }
  }

  socket.on('event:smoothshorts.newhash', handleNewHash);

  $shortFormat.tooltip({
    html: true,
    placement: 'top',
    template: '<div class="format-tooltip tooltip" role="tooltip"><div class="format-tooltip-arrow tooltip-arrow"></div><div class="format-tooltip-inner tooltip-inner">Beware!</div></div>',
    title: 'Beware!<br />Changing this setting will invalidate<br />all short URLs issued so far.',
    trigger: 'focus',
    container: 'body'
  });

  $shortFormat.on('shown.bs.tooltip', function(event) {
    var mouseEnter = function() {
      window.clearTimeout(hideID);
    };
    var mouseLeave = function() {
      $shortFormat.tooltip('hide');
    };
    var scrollHide = function() {
      $shortFormat.tooltip('hide');
      window.clearTimeout(hideID);
      document.removeEventListener('scroll', scrollHide);
    };
    var formatTooltipId = event.target.attributes.getNamedItem('aria-describedby').value;
    var formatTooltip = document.getElementById(formatTooltipId);
    formatTooltip.addEventListener('mouseenter', mouseEnter);
    formatTooltip.addEventListener('mouseleave', mouseLeave);
    document.body.addEventListener('scroll', scrollHide);
    var hideID = window.setTimeout(function() {
      $shortFormat.tooltip('hide');
    }, 7000);
  });

  /**
   * Invokes module:iconSelect (NodeBB core) to change
   * copy button's icon
   * @memberOf acp.controller
   * @type {function}
   * @inner
   * @method selectIcon
   * @param {MouseEvent} event
   */
  copyButtonIcon.addEventListener('click', function(event) {
    event.preventDefault();
    require(['iconSelect'], function(iconSelect) {
      iconSelect.init($(event.target.firstElementChild || event.target));
    });
  });

});
