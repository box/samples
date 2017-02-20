package com.auth0.example;

import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFile;
import com.box.sdk.BoxFolder;
import com.box.sdk.BoxItem;
import com.helpers.BoxHelper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DashboardServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        BoxHelper.prepareBoxUser(request);

        BoxAPIConnection userClient = BoxHelper.userClient(request);

        List<BoxFolder.Info> folders = new ArrayList<BoxFolder.Info>();
        List<BoxFile.Info> files = new ArrayList<BoxFile.Info>();

        BoxFolder rootFolder = BoxFolder.getRootFolder(userClient);
        for (BoxItem.Info itemInfo : rootFolder) {
            if (itemInfo instanceof BoxFile.Info){
                files.add((BoxFile.Info)itemInfo);
            }
            else if (itemInfo instanceof BoxFolder.Info){
                folders.add((BoxFolder.Info)itemInfo);
            }
        }

        request.setAttribute("files", files);
        request.setAttribute("folders", folders);
        request.setAttribute("accessToken", userClient.getAccessToken());

        request.getRequestDispatcher("dashboard.jsp").forward(request, response);
    }
}
