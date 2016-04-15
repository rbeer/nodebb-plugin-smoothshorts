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

<link rel="stylesheet" type="text/css" href="{relative_path}/plugins/nodebb-plugin-smoothshorts/css/admin.css">
<script src="{relative_path}/plugins/nodebb-plugin-smoothshorts/scripts/controller.js" type="text/javascript" charset="utf-8"></script>
