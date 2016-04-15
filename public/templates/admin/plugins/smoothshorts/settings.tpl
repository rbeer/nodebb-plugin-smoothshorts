<div class="panel-heading">Settings</div>
<div class="panel-body">
  <form>
    <div class="form-group">
    <label for="modKey">Modifier Key</label><br />
    <p>User has to hold the modifier key while right clicking a link in order to replace its URL.</p>
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
      <p>Force short URLs to use this domain, no matter which the user used to visit your NodeBB.</p>
      <div class="input-group">
        <span class="input-group-addon">
          <label style="margin-bottom: -1px;">
            <input type="checkbox" id="useDomain"<!-- IF useDomain --> checked<!-- ENDIF useDomain -->>
          </label>
        </span>
        <input type="text" class="form-control" id="domain" placeholder="short.com" value="{forcedDomain}"<!-- IF !useDomain --> disabled<!-- ENDIF !useDomain -->/>
      </div>
    </div>
    <button class="btn btn-primary btn-md" id="btnSave">Save Settings</button>
  </form>
</div>