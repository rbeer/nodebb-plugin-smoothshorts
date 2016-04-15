/* global app, socket */
$(document).ready(function() {
  'use strict';

  var useModKey = document.getElementById('useModKey');
  var ddModKey = document.getElementById('modKey');
  var useDomain = document.getElementById('useDomain');
  var txtDomain = document.getElementById('domain');

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

  useDomain.addEventListener('click', function handleUseDomain(event) {
    txtDomain.disabled = !event.target.checked;
  });

  btnSave.addEventListener('click', function(event) {
    socket.emit('admin.plugins.SmoothShorts.saveSettings', {
      useModKey: useModKey.checked,
      modKey: ddModKey.selectedOptions.item(0).value.toLowerCase(),
      useDomain: useDomain.checked,
      forcedDomain: txtDomain.value
    }, function(err) {
      if (err) {
        app.alertError('Couldn\'t save settings.');
        return console.error(err);
      }
      app.alertSuccess('Settings saved.');
    });
    event.preventDefault();
  });

  btnHash.addEventListener('click', function(event) {
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
