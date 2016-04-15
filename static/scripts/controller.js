/* global app, socket, config */
$(document).ready(function() {
  'use strict';

  var useModKey = document.getElementById('useModKey');
  var ddModKey = document.getElementById('modKey');
  var useDomain = document.getElementById('useDomain');
  var txtDomain = document.getElementById('domain');
  var csrf = document.getElementById('csrfToken');

  var btnHash = document.getElementById('btnHash');
  /* not yet implemented - stay tuned for 0.2.0! :)
  var btnDel = document.getElementById('btnDel');
  */
  var btnSave = document.getElementById('btnSave');

  var counter = {
    topicTotal: document.getElementById('topicCount'),
    topic: document.getElementById('topicHashCount'),
    topicWell: document.getElementById('topicWell'),
    postTotal: document.getElementById('postCount'),
    post: document.getElementById('postHashCount'),
    postWell: document.getElementById('postWell')
  };

  useModKey.addEventListener('click', function handleUseModKey(evt) {
    ddModKey.disabled = !evt.target.checked;
  });
  useDomain.addEventListener('click', function handleUseDomain(evt) {
    txtDomain.disabled = !evt.target.checked;
  });
  btnSave.addEventListener('click', function(e) {
    $.post(config.relative_path + '/api/admin/plugins/smoothshorts/save', {
      _csrf: csrf.value,
      useModKey: useModKey.checked,
      modKey: ddModKey.selectedOptions.item(0).value.toLowerCase(),
      useDomain: useDomain.checked,
      domain: txtDomain.value
    }, function(data) {
      if (data === 'OK') {
        app.alertSuccess('Settings saved.');
      } else {
        app.alertError('Couldn\'t save settings.');
      }
    });
    e.preventDefault();
  });
  btnHash.addEventListener('click', function(e) {
    socket.emit('admin.plugins.SmoothShorts.hashMissing', function(err) {
      if (err) {
        return app.alertError(err.message);
      }
    });
  });

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
});
