package com.box.example;

import com.auth0.AuthenticationController;
import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxUser;
import com.helpers.BoxHelper;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class LoginServlet extends HttpServlet {

    private AuthenticationController authenticationController;
    private String domain;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        domain = config.getServletContext().getInitParameter("com.auth0.domain");
        try {
            authenticationController = AuthenticationControllerProvider.getInstance(config);
        } catch (UnsupportedEncodingException e) {
            throw new ServletException(
                    "Couldn't create the AuthenticationController instance. Check the configuration.", e);
        }
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse res)
            throws ServletException, IOException {
        String redirectUri = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort() + "/callback";
        BoxAPIConnection adminClient = BoxHelper.adminClient();

        BoxUser.Info userInfo = BoxUser.getCurrentUser(adminClient).getInfo();
        System.out.println("Successfully connected as " + userInfo.getLogin());
        String authorizeUrl = authenticationController.buildAuthorizeUrl(req, redirectUri)
                .withAudience(String.format("https://%s/userinfo", domain))
                .withScope("openid email")
                .build();
        res.sendRedirect(authorizeUrl);
    }

}
