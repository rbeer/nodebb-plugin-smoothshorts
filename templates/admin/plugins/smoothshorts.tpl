<style>
.cout-warn {
  border-left-width: 5px;
  border-left-color: #D52222;
  border-right-width: 5px;
  border-right-color: #D52222;
}
.cout {
  -webkit-transition: border 1s;
  transition: border 1s;
}
</style>

<div class="row">
  <div class="col-lg-8">
    <div class="panel panel-default">
      <div class="panel-heading">Settings</div>
      <div class="panel-body">
        <form>
          <div class="form-group">
          <label for="modKey">Modifier Key</label><br />
          <p>User has to hold modkey while right clicking in order to replace the link.</p>
            <div class="input-group">
              <span class="input-group-addon">
                <label style="margin-bottom: -1px;">
                  <input type="checkbox" id="useModKey"<!-- IF useModKey --> checked<!-- ENDIF useModKey -->>
                </label>
              </span>
              <select class="form-control" id="modKey"<!-- IF !useModKey --> disabled<!-- ENDIF !useModKey -->>
                <option<!-- IF modKey.ctrl --> selected<!-- ENDIF modKey.ctrl -->>Ctrl</option>
                <option<!-- IF modKey.alt --> selected<!-- ENDIF modKey.alt -->>Alt</option>
                <option<!-- IF modKey.shift --> selected<!-- ENDIF modKey.shift -->>Shift</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="domain">Force Domain</label>
            <p>Force short urls to use this domain, no matter which the user used to visit your NodeBB.</p>
            <div class="input-group">
              <span class="input-group-addon">
                <label style="margin-bottom: -1px;">
                  <input type="checkbox" id="useDomain"<!-- IF useDomain --> checked<!-- ENDIF useDomain -->>
                </label>
              </span>
              <input type="text" class="form-control" id="domain" value="{forcedDomain}"<!-- IF !useDomain --> disabled<!-- ENDIF !useDomain -->/>
            </div>
          </div>
          <input id="csrfToken" type="hidden" value="{csrf}" />
          <button class="btn btn-primary btn-md" id="btnSave">Save Settings</button>
        </form>
      </div>
    </div>
  </div>
  <div class="col-lg-4 acp-sidebar">
    <div class="panel panel-default">
      <div class="panel-heading">Status</div>
      <div class="panel-body">
        <div class="row well well-sm cout {topicStatus}" id="topicWell">
          <div class="col-sm-6 col-xs-12">
            Topics:<br />
            <span id="topicCount" class="badge">{topicCount}</span>
          </div>
          <div class="col-sm-6 col-xs-12">
            Hashed:<br />
            <span id="topicHashCount" class="badge">{topicHashCount}</span>
          </div>
        </div>
        <div class="row well well-sm cout {postStatus}" id="postWell">
          <div class="col-sm-6 col-xs-12">
            Posts:<br />
            <span id="postCount" class="badge">{postCount}</span>
          </div>
          <div class="col-sm-6 col-xs-12">
            Hashed:<br />
            <span id="postHashCount" class="badge">{postHashCount}</span>
          </div>
        </div>
        <div class="progress hidden">
          <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;">0%</div>
        </div>
        <div id="doStatus"></div>
        <button class="btn btn-success btn-md" id="btnHash">Hash Missing</button>
        <!-- not yet implemented - stay tuned for 0.2.0! :)
        <button class="btn btn-danger btn-md" id="btnDel">Delete Unused</button>
        -->
      </div>
    </div>
  </div>
</div>

<script type="text/javascript">
'use strict';
/* globals app, socket */
$(document).ready(function() {

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
      _csrf : csrf.value,
      useModKey: useModKey.checked,
      modKey : ddModKey.selectedOptions.item().value.toLowerCase(),
      useDomain : useDomain.checked,
      domain: txtDomain.value
    }, function(data) {
      if (data === 'OK') {
        app.alertSuccess('Settings saved.');
      } else {
        app.alertError('Couldn\'t save settings.')
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
  /* not yet implemented - stay tuned for 0.2.0! :)
  btnDel.addEventListener('click', function(e) {
    socket.emit('admin.plugins.SmoothShorts.deleteUnused', function(err) {
      if (err) {
        return app.alertError(err.message);
      }
    });
  });
  */

  function handleNewHash(data) {
    var target = counter[data.type];
    var total = counter[data.type + 'Total'];
    target.innerText = parseInt(target.innerText, 10) + 1;
    if (target.innerText === total.innerText) {
      counter[data.type + 'Well'].classList.remove('cout-warn');
      app.alertSuccess('All ' + data.type + ' hashed.')
    }
  }
  socket.on('event:smoothshorts.newhash', handleNewHash);
});

</script>
