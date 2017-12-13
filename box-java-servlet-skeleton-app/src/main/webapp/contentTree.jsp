<jsp:include page="top.jsp" />

<h2>Your Dashboard</h2>
<hr />
<jsp:include page="nav.jsp" />
<div id="box-tree" class="container-fluid">
</div>
<jsp:include page="boxUIElements.jsp" />
<script type="text/javascript">
    var accessToken = "${accessToken}";
    var folderId = "${rootFolder.getID()}";
    var fileTree = new Box.ContentTree();
    fileTree.show(folderId, accessToken, {
        container: '#box-tree'
    });
</script>
<jsp:include page="bottom.jsp" />