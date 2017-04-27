//
//  BoxAccessTokenDelegate.swift
//  BoxPlatformSample
//
//  Created by Allen-Michael Grobelny on 1/9/17.
//  Copyright © 2017 Allen-Michael Grobelny. All rights reserved.
//

import BoxContentSDK

class BoxAccessTokenDelegate {
    
    static func retrieveBoxAccessToken(auth0AccessToken: String, completion: ((String?, Date?, Error?) -> Void)!) {
        //Change this value to your own webtask
        let refreshUrl: String = "https://allenmsxbg.us.webtask.io/auth0-box-platform/delegation"
        
        guard let url = URL(string: refreshUrl) else {
            print("Error: cannot create URL")
            return
        }
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "GET"
        urlRequest.setValue("Bearer \(auth0AccessToken)", forHTTPHeaderField: "Authorization")
        let sessionConfig = URLSessionConfiguration.default
        let session = URLSession(configuration: sessionConfig)
        let task = session.dataTask(with: urlRequest, completionHandler: { (data, response, error) in
            // check for any errors
            guard error == nil else {
                print("error calling refresh service")
                print(error!)
                return
            }
            // make sure we got data
            guard let responseData = data else {
                print("Error: did not receive data")
                return
            }
            //            // parse the result as JSON, since that's what the API provides
            do {
                guard let boxToken = try JSONSerialization.jsonObject(with: responseData, options: []) as? [String: AnyObject] else {
                    print("error trying to convert data to JSON")
                    return
                }
                // now we have the todo, let's just print it to prove we can access it
                print("The access token is: " + boxToken.description)
                for key in boxToken.keys {
                    print("Token Key")
                    print(key)
                }
                // the todo object is a dictionary
                // so we just access the title using the "title" key
                // so check for a title and print it if we have one
                guard let accessToken = boxToken["access_token"] as? String else {
                    print("Could not get access token from JSON")
                    return
                }
                print("The token is: " + accessToken)
                let expirationDate = Date.init(timeIntervalSinceNow: 3300)
                completion(accessToken, expirationDate, nil)
            } catch  {
                print("error trying to convert data to JSON")
                return
            }
        })
        task.resume()
    }
}
