//
//  ProfileController.swift
//  BoxPlatformSample
//
//  Created by Allen-Michael Grobelny on 1/9/17.
//  Copyright © 2017 Allen-Michael Grobelny. All rights reserved.
//

import UIKit
import Lock
import Auth0
import BoxContentSDK

class ProfileViewController : UIViewController {
    @IBOutlet weak var avatarImageView: UIImageView!
    @IBOutlet weak var welcomeLabel: UILabel!
    @IBOutlet weak var boxIdLabel: UILabel!
    @IBOutlet weak var boxAccessToken: UILabel!
    @IBOutlet weak var folderName: UILabel!
    
    var profile: Profile!
    var idToken: String!
    var accessToken: String!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.profile = SessionManager.shared.profile
        self.idToken = SessionManager.shared.getIdToken()
        self.accessToken = SessionManager.shared.getAccessToken()
        print("Token")
        print(self.idToken)
        
        self.welcomeLabel.text = "Welcome, \(self.profile.name)"
        
        SessionManager.shared.retrieveAppUserId { error, appUserId in
            DispatchQueue.main.async {
                guard error == nil else { return self.showErrorRetrievingAppUserIdAlert() }
                self.boxIdLabel.text = self.boxIdLabel.text! + " \(appUserId!)"
            }
        }
        
        URLSession.shared.dataTask(with: self.profile.pictureURL, completionHandler: { data, response, error in
            DispatchQueue.main.async {
                guard let data = data , error == nil else { return }
                self.avatarImageView.image = UIImage(data: data)
            }
        }).resume()
        
        let boxClient = BOXContentClient.forNewSession()
        boxClient!.accessTokenDelegate = self
        boxClient!.authenticate { (user, error) in
            if(error != nil) {
                print(error!)
                return
            }
            print("App User:")
            print(user!.name)
        }
        let folderRequest = boxClient!.folderInfoRequest(withID: "0")
        
        folderRequest!.perform(completion: { (folder, error) in
            print("Folder request")
            print(folder!.description)
            self.folderName.text = self.folderName.text! + " \(folder!.name!)"
        })
        
    }
    
    
    @IBAction func logout(_ sender: Any) {
        SessionManager.shared.logout()
        self.presentingViewController?.dismiss(animated: true, completion: nil)
    }
    
    private func showErrorRetrievingAppUserIdAlert() {
        let alert = UIAlertController.alert(title: "Error", message: "Could not retrieve app user ID from server", includeDoneButton: true)
        self.present(alert, animated: true, completion: nil)
    }
}

extension ProfileViewController : BOXAPIAccessTokenDelegate {
    func fetchAccessToken(completion: ((String?, Date?, Error?) -> Void)!) {
        BoxAccessTokenDelegate.retrieveBoxAccessToken(auth0AccessToken: self.accessToken) { (token, expire, error) in
            completion(token, expire, nil)
        }
    }
}
