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
      <label for="shortFormat">URL Format</label>
      <p>Here you can define the format of your short URLs.<br />
      Use ':hash' to insert post/topic hash, leave blank to use the default!</p>
      <div class="input-group">
        <span class="input-group-addon">
          <span>http(s)://</span>
        </span>
        <input type="text" class="form-control" id="shortFormat" placeholder="{shortFormatDefault}" value="{shortFormat}" data-toggle="tooltip" />
      </div>
    </div>
    <div class="form-group">
      <label>Copy Button</label>
      <p>Select the icon shown on the button:</p>
      <button class="btn btn-default btn-md btn-copy" id="copyButtonIcon"><i class="fa fa-2x {copyButtonClass}"></i></button>
    </div>
    <hr />
    <button class="btn btn-primary btn-md" id="btnSave">Save Settings</button>
  </form>
</div>
