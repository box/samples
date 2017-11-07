<jsp:include page="top.jsp" />

<h2>Your Dashboard</h2>
<hr />
<jsp:include page="nav.jsp" />
<div id="box-picker" class="container-fluid">
</div>
<jsp:include page="boxUIElements.jsp" />
<script type="text/javascript">
    var accessToken = "${accessToken}";
    var folderId = "${rootFolder.getID()}";
    var filePicker = new Box.FilePicker();
    filePicker.show(folderId, accessToken, {
        container: '#box-picker'
    });
</script>
<jsp:include page="bottom.jsp" />