package com.auth0.example;

import com.box.sdk.BoxFile;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

public class ThumbnailServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        String boxId = request.getParameter("id");

        BoxFile file = new BoxFile(BoxHelper.userClient(request), boxId);
        byte[] thumbBytes = file.getThumbnail(BoxFile.ThumbnailFileType.PNG,256,256,256,256);

        response.setContentType("image/png");

        OutputStream out = response.getOutputStream();
        out.write(thumbBytes);
        out.close();
    }
}
