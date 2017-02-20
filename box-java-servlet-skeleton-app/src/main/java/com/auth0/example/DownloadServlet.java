package com.auth0.example;

import com.box.sdk.BoxFile;
//import com.helpers.BoxDevEditionHelper;
import com.helpers.BoxHelper;
import com.mashape.unirest.http.exceptions.UnirestException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URL;

public class DownloadServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        String boxId = request.getParameter("id");

        URL downloadUrl;

        BoxFile boxFile = new BoxFile(BoxHelper.userClient(request), boxId);
        downloadUrl = boxFile.getDownloadURL();
        response.sendRedirect(downloadUrl.toString());
    }
}
