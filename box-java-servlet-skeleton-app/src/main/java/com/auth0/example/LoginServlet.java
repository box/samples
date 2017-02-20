package com.auth0.example;

import com.auth0.NonceGenerator;
import com.auth0.NonceStorage;
import com.auth0.RequestNonceStorage;
import com.box.sdk.*;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class LoginServlet extends HttpServlet {

    private final NonceGenerator nonceGenerator = new NonceGenerator();

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        if (!"/favicon.ico".equals(request.getServletPath())) {
            BoxAPIConnection adminClient = BoxHelper.adminClient();

            BoxUser.Info userInfo = BoxUser.getCurrentUser(adminClient).getInfo();
            request.setAttribute("connectMessage", "Successfully connected as " + userInfo.getLogin());

            String nonce = nonceGenerator.generateNonce();
            NonceStorage nonceStorage = new RequestNonceStorage(request);
            nonceStorage.setState(nonce);
            request.setAttribute("state", nonce);
            request.setAttribute("callbackUrl", buildUrl(request,"/callback"));
            request.getRequestDispatcher("login.jsp").forward(request, response);
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private String buildUrl(HttpServletRequest request, String relativePath) {

        String scheme      =    request.getScheme();
        String serverName  =    request.getServerName();
        int serverPort     =    request.getServerPort();
        String contextPath =    request.getContextPath();

        // Reconstruct original requesting URL
        StringBuffer url =  new StringBuffer();
        url.append(scheme).append("://").append(serverName);

        if ((serverPort != 80) && (serverPort != 443)) {
            url.append(":").append(serverPort);
        }

        url.append(contextPath).append(relativePath);

        return url.toString();

    }

}
