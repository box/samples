package com.box.example;

import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFolder;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ContentPickerServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        BoxAPIConnection userClient = BoxHelper.userClient(request, response);
        BoxFolder rootFolder = BoxFolder.getRootFolder(userClient);

        request.setAttribute("rootFolder", rootFolder);
        request.setAttribute("accessToken", userClient.getAccessToken());
        request.getRequestDispatcher("contentPicker.jsp").forward(request, response);
    }
}