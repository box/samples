package com.helpers;

import com.auth0.Auth0User;
import com.box.sdk.*;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class BoxHelper {

    final static String ENTERPRISE_ID = ConfigHelper.Properties().getProperty("boxEnterpriseId");
    final static String CLIENT_ID = ConfigHelper.Properties().getProperty("boxClientId");
    final static String CLIENT_SECRET = ConfigHelper.Properties().getProperty("boxClientSecret");
    final static String PRIVATE_KEY_FILE = ConfigHelper.Properties().getProperty("boxPrivateKeyFile");
    final static String PRIVATE_KEY_PASSWORD = ConfigHelper.Properties().getProperty("boxPrivateKeyPassword");
    final static String PUBLIC_KEY_ID = ConfigHelper.Properties().getProperty("boxPublicKeyId");

    final static String BOX_USER_ID_KEY = "box_id";
    final static int MAX_CACHE_ENTRIES = 100;

    static IAccessTokenCache accessTokenCache;
    static JWTEncryptionPreferences jwtEncryptionPreferences;

    static {
        String privateKey;
        try {
            privateKey = new String(Files.readAllBytes(Paths.get(PRIVATE_KEY_FILE)));
        } catch (Exception ex) {
            throw new BoxAPIException("Unable to read private key file: " + PRIVATE_KEY_FILE);
        }

        jwtEncryptionPreferences = new JWTEncryptionPreferences();
        jwtEncryptionPreferences.setPublicKeyID(PUBLIC_KEY_ID);
        jwtEncryptionPreferences.setPrivateKey(privateKey);
        jwtEncryptionPreferences.setPrivateKeyPassword(PRIVATE_KEY_PASSWORD);
        jwtEncryptionPreferences.setEncryptionAlgorithm(EncryptionAlgorithm.RSA_SHA_256);

        accessTokenCache = new InMemoryLRUAccessTokenCache(MAX_CACHE_ENTRIES);
    }

    public static BoxAPIConnection adminClient(){
        BoxDeveloperEditionAPIConnection adminClient = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(
                ENTERPRISE_ID, CLIENT_ID, CLIENT_SECRET, jwtEncryptionPreferences, accessTokenCache);

        return adminClient;
    }

    public static BoxAPIConnection userClient(HttpServletRequest request){
        return userClient(boxIdFromRequest(request));
    }

    public static BoxAPIConnection userClient(String userId){
        BoxDeveloperEditionAPIConnection userClient = BoxDeveloperEditionAPIConnection.getAppUserConnection(
                userId, CLIENT_ID, CLIENT_SECRET, jwtEncryptionPreferences, accessTokenCache);

        return userClient;
    }

    public static void prepareBoxUser(HttpServletRequest request){

        String boxId = boxIdFromRequest(request);

        //if boxId is still not found that means we need to create a Box app user and associate with the Auth0 user
        if (boxId==null){
            CreateUserParams params = new CreateUserParams();
            params.setSpaceAmount(1073741824); //1 GB
            BoxUser.Info user = BoxUser.createAppUser(adminClient(), Auth0User.get(request).getEmail(), params);
            boxId = user.getID();

            try {
                updateAuth0Metadata(request, boxId);
            } catch (UnirestException e) {
                e.printStackTrace();
            }

            BoxAPIConnection boxUserClient = userClient(boxId);

            BoxFolder.getRootFolder(boxUserClient).createFolder("Test Folder");

            InputStream file = request.getServletContext().getResourceAsStream("/assets/test.txt");
            BoxFolder.getRootFolder(boxUserClient).uploadFile(file,"test.txt");
        }

        request.getSession().setAttribute(BOX_USER_ID_KEY, boxId);
    }

    private static String boxIdFromRequest(HttpServletRequest request){
        //first look in the session
        String boxId = (String)request.getSession().getAttribute(BOX_USER_ID_KEY);

        //if we don't find in the session then look on the Auth0 user
        if (boxId==null) {
            Auth0User user = Auth0User.get(request);
            try {
                boxId = user.getProperty(BOX_USER_ID_KEY);
            } catch (Exception ex) {
                //ex.printStackTrace();
            }
        }

        return boxId;
    }

    private static void updateAuth0Metadata(HttpServletRequest request, String boxId) throws UnirestException {
        HttpResponse<JsonNode> jsonResponse;
        jsonResponse = Unirest.post("https://platform-demo-training.auth0.com/oauth/token")
                .header("accept", "application/json")
                .field("client_id", request.getServletContext().getInitParameter("auth0.client_id"))
                .field("client_secret", request.getServletContext().getInitParameter("auth0.client_secret"))
                .field("grant_type", "client_credentials")
                .asJson();

        String accessToken = jsonResponse.getBody().getObject().getString("access_token");
        String patchUrl = "https://platform-demo-training.auth0.com/api/users/" + Auth0User.get(request).getUserId() + "/metadata";
        Unirest.patch(patchUrl)
                .header("Authorization", "Bearer " + accessToken)
                .header("accept", "application/json")
                .field("boxId", boxId)
                .asString();
    }

}
