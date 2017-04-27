//
//  HomeController.swift
//  BoxPlatformSample
//
//  Created by Allen-Michael Grobelny on 1/9/17.
//  Copyright © 2017 Allen-Michael Grobelny. All rights reserved.
//


import UIKit
import Lock
import Auth0
import BoxContentSDK

class HomeViewController: UIViewController {
    
    @IBAction func showLoginController(_ sender: UIButton) {
        self.showLock()
    }
    
    fileprivate func showLock() {
        Auth0
            .webAuth()
            .audience("urn:box-platform-api")
            .scope("openid profile")
            .start { result in
                switch result {
                case .success(let credentials):
                    guard let accessToken = credentials.accessToken, let idToken = credentials.idToken else { return }
                    SessionManager.shared.storeTokens(accessToken, idToken: idToken)
                    SessionManager.shared.retrieveProfile { error in
                        guard error == nil else {
                            print("an error")
                            return
                        }
                        DispatchQueue.main.async {
                            self.performSegue(withIdentifier: "ShowProfile", sender: nil)
                        }
                    }
                case .failure(let error):
                    print(error)
                }
        }
    }
    
    // MARK: - Private
    fileprivate var tokens: Credentials!
    
    fileprivate func showMissingProfileAlert() {
        let alert = UIAlertController(title: "Error", message: "Could not retrieve profile", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }
    
    
}
