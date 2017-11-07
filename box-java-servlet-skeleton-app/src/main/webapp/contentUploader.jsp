<jsp:include page="top.jsp" />

<h2>Your Dashboard</h2>
<hr />
<jsp:include page="nav.jsp" />
<div id="box-uploader" class="container-fluid">
</div>
<jsp:include page="boxUIElements.jsp" />
<script type="text/javascript">
    var accessToken = "${accessToken}";
    var folderId = "${rootFolder.getID()}";
    var uploader = new Box.ContentUploader();
    uploader.show(folderId, accessToken, {
        container: '#box-uploader'
    });
</script>
<jsp:include page="bottom.jsp" />