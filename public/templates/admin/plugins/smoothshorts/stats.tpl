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