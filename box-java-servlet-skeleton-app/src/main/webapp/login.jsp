<jsp:include page="top.jsp"/>

    <script type="text/javascript">
      var lock = new Auth0Lock('<%= application.getInitParameter("auth0.client_id")%>','<%= application.getInitParameter("auth0.domain") %>');

        function signin() {
            lock.show({
                callbackURL:    '${callbackUrl}',
                responseType: 'code',
                authParams: {
                    state: '${state}',
                    scope: 'openid name email picture'
                }
            });
        }
    </script>

    <% if ( request.getParameter("error") != null ) { %>
        <%-- TODO Escape and encode ${param.error} properly. It can be done using jstl c:out. --%>
        <span style="color: red;">${param.error}</span>
    <% } %>
    <h3><i class="fa fa-exclamation-circle"></i> ${connectMessage} </h3>
    <div class="row signin-button">
        <div class="col-md-4"></div>
        <div class="col-md-4">
            <button onclick="signin()" class="btn btn-primary btn-lg btn-login btn-block" >Sign In</button>
        </div>
        <div class="col-md-4"></div>
    </div>
<jsp:include page="bottom.jsp"/>
