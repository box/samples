package com.helpers;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigHelper {

    private static Object syncObject = new Object();
    private static Properties properties = null;

    public static Properties Properties(){
        synchronized (syncObject){
            if (properties ==null){
                Properties prop = new Properties();
                try {
                    InputStream input = new FileInputStream("config.properties");
                    prop.load(input);
                    input.close();
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                properties = prop;
            }

            return properties;
        }
    }
}
