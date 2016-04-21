/* global app, socket */
$(document).ready(function() {
  'use strict';

  var useModKey = document.getElementById('useModKey');
  var ddModKey = document.getElementById('modKey');
  var shortFormat = document.getElementById('shortFormat');
  var $shortFormat = $(shortFormat);
  var copyButtonIcon = document.getElementById('copyButtonIcon');

  var btnHash = document.getElementById('btnHash');
  var btnSave = document.getElementById('btnSave');

  var counter = {
    topicTotal: document.getElementById('topicCount'),
    topic: document.getElementById('topicHashCount'),
    topicWell: document.getElementById('topicWell'),
    postTotal: document.getElementById('postCount'),
    post: document.getElementById('postHashCount'),
    postWell: document.getElementById('postWell')
  };

  useModKey.addEventListener('click', function handleUseModKey(event) {
    ddModKey.disabled = !event.target.checked;
  });

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

  btnHash.addEventListener('click', function() {
    socket.emit('admin.plugins.SmoothShorts.hashMissing', function(err) {
      if (err) {
        return app.alertError(err.message);
      }
    });
  });

  function validateShortFormat() {
    return shortFormat.value.length === 0 || shortFormat.value.indexOf(':hash') !== -1;
  }

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

  copyButtonIcon.addEventListener('click', function(event) {
    event.preventDefault();
    require(['iconSelect'], function(iconSelect) {
      iconSelect.init($(event.target.firstElementChild || event.target));
    });
  });

});
