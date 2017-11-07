package com.box.example;

import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFolder;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class LogoutServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        BoxHelper.revokeToken(request.getParameter("accessToken"));
        HttpSession session = request.getSession();
        session.invalidate();
        response.sendRedirect("/login");
    }
}