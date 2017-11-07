<jsp:include page="top.jsp" />

<h2>Your Dashboard</h2>
<hr />
<jsp:include page="nav.jsp" />
<div id="box-explorer" class="container-fluid" min-height="2050px">
</div>
<jsp:include page="boxUIElements.jsp" />
<script type="text/javascript">
    var accessToken = "${accessToken}";
    var folderId = "${rootFolder.getID()}";
    var contentExplorer = new Box.ContentExplorer();
    contentExplorer.show(folderId, accessToken, {
        container: '#box-explorer'
    });
</script>
<jsp:include page="bottom.jsp" />