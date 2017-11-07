package com.box.example;

import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFolder;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class DashboardServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        BoxHelper.prepareBoxUser(request);

        BoxAPIConnection userClient = BoxHelper.userClient(request, response);

        BoxFolder rootFolder = BoxFolder.getRootFolder(userClient);

        request.setAttribute("rootFolder", rootFolder);
        request.setAttribute("accessToken", userClient.getAccessToken());

        request.getRequestDispatcher("dashboard.jsp").forward(request, response);
    }
}
