//
//  SessionManager.swift
//  BoxPlatformSample
//
//  Created by Allen-Michael Grobelny on 4/12/17.
//  Copyright © 2017 Allen-Michael Grobelny. All rights reserved.
//

import Foundation
import SimpleKeychain
import Auth0

enum SessionManagerError: Error {
    case noAccessToken
    case noIdToken
    case noProfile
    case missingAppUserId
}

class SessionManager {
    static let shared = SessionManager()
    let keychain = A0SimpleKeychain(service: "Auth0")
    
    var profile: Profile?
    
    private init () { }
    
    func storeTokens(_ accessToken: String, idToken: String) {
        self.keychain.setString(accessToken, forKey: "access_token")
        self.keychain.setString(idToken, forKey: "id_token")
    }
    
    func retrieveProfile(_ callback: @escaping (Error?) -> ()) {
        guard let accessToken = self.keychain.string(forKey: "access_token") else {
            return callback(SessionManagerError.noAccessToken)
        }
        print("access token")
        print(accessToken)
        Auth0.authentication()
            .userInfo(token: accessToken)
            .start { result in
                switch(result) {
                case .success(let profile):
                    self.profile = profile
                    callback(nil)
                case .failure(let error):
                    callback(error)
                }
        }
    }
    
    func getIdToken() -> String {
        guard let idToken = self.keychain.string(forKey: "id_token") else {
            return ""
        }
        print("ID Token from keychain")
        print(idToken)
        return idToken
    }
    
    func retrieveAppUserId(_ callback: @escaping (Error?, String?) -> ()) {
        guard let idToken = self.keychain.string(forKey: "id_token") else {
            return callback(SessionManagerError.noIdToken, nil)
        }
        guard let userId = profile?.id else {
            return callback(SessionManagerError.noProfile, nil)
        }
        Auth0
            .users(token: idToken)
            .get(userId, fields: [], include: true)
            .start { result in
                switch result {
                case .success(let user):
                    guard
                        let appMetadata = user["app_metadata"] as? [String: Any],
                        let appUserId = appMetadata["box_appuser_id"] as? String
                        else {
                            return callback(SessionManagerError.missingAppUserId, nil)
                        }
                        print("App Metadata")
                        print(appMetadata)
                        print("App User ID")
                        print(appUserId)
                        callback(nil, appUserId)
                        break
                case .failure(let error):
                    callback(error, nil)
                    break
                }
        }
    }
    
    func logout() {
        self.keychain.clearAll()
    }
    
}
