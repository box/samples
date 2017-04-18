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
        self.checkAccessToken()
    }
    
    fileprivate func showLock() {
        Lock
            .classic()
            .onAuth { credentials in
                guard let accessToken = credentials.accessToken, let idToken = credentials.idToken else { return }
                SessionManager.shared.storeTokens(accessToken, idToken: idToken)
                SessionManager.shared.retrieveProfile { error in
                    guard error == nil else {
                        return self.showLock()
                    }
                    DispatchQueue.main.async {
                        self.performSegue(withIdentifier: "ShowProfile", sender: nil)
                    }
                }
                
            }
            .present(from: self)
    }
    
    fileprivate func checkAccessToken() {
        let loadingAlert = UIAlertController.loadingAlert()
        loadingAlert.presentInViewController(viewController: self)
        SessionManager.shared.retrieveProfile { error in
            loadingAlert.dismiss(animated: true) {
                guard error == nil else {
                    return self.showLock()
                }
                self.performSegue(withIdentifier: "ShowProfile", sender: nil)
            }
        }
    }
    
    // MARK: - Private
    
    fileprivate var retrievedProfile: Profile!
    fileprivate var tokens: Credentials!
    
    fileprivate func showMissingProfileAlert() {
        let alert = UIAlertController(title: "Error", message: "Could not retrieve profile", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }
    
    
}
