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
import BoxPreviewSDK
import BoxBrowseSDK

class ProfileViewController : UIViewController, BOXFolderViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @IBOutlet weak var avatarImageView: UIImageView!
    @IBOutlet weak var welcomeLabel: UILabel!
    @IBOutlet weak var boxIdLabel: UILabel!
    @IBOutlet weak var boxAccessToken: UILabel!
    
    var profile: Profile!
    var idToken: String!
    var accessToken: String!
    var activityIndicator: UIActivityIndicatorView = UIActivityIndicatorView()
    
    // Implement Content SDK
    var boxClient: BOXContentClient {
        let client = BOXContentClient.forNewSession()
        client!.accessTokenDelegate = self
        return client!
    }
    
    @IBAction func viewFilesButtonPressed(_ sender: Any) {
        // Implement Browse SDK
        let folderViewController = BOXFolderViewController(contentClient: boxClient)
        folderViewController?.delegate = self
        let navigationController = UINavigationController(rootViewController: folderViewController!)
        present(navigationController, animated: true) { _ in }
    }
    
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

        self.boxClient.authenticate { (user, error) in
            if(error != nil) {
                print(error!)
                return
            }
            print("App User:")
            print(user!.name)
        }
        
    }
    
    // Implement Preview SDK
    func itemsViewController(_ itemsViewController: BOXItemsViewController, didTap file: BOXFile, inItems items: [Any]) {
        print("inside itemsViewController")
        let filePreviewController = BOXFilePreviewController(contentClient: self.boxClient, file: file, inItems: items)
        itemsViewController.navigationController?.pushViewController(filePreviewController!, animated: true)
    }
    
    @IBAction func logout(_ sender: Any) {
        SessionManager.shared.logout()
        self.presentingViewController?.dismiss(animated: true, completion: nil)
    }
    
    private func showErrorRetrievingAppUserIdAlert() {
        let alert = UIAlertController.alert(title: "Error", message: "Could not retrieve app user ID from server", includeDoneButton: true)
        self.present(alert, animated: true, completion: nil)
    }

    // Select file from library or take photo from camera
    @IBAction func selectPhoto(_ sender: UIButton) {
        let imagePickerController = UIImagePickerController()
        imagePickerController.delegate = self
        
        
        let actionSheet = UIAlertController(title: "Photos", message: "Select a photo", preferredStyle: .actionSheet)
        
        actionSheet.addAction(UIAlertAction(title: "Camera", style: .default, handler: { (action:UIAlertAction) in
            // check if camera source type is available (will not be available in simulator)
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                imagePickerController.sourceType = .camera
                self.present(imagePickerController, animated: true, completion: nil)
            } else {
                print("Camera not available")
            }
        }))
        
        actionSheet.addAction(UIAlertAction(title: "Photo Library", style: .default, handler: { (action:UIAlertAction) in
            imagePickerController.sourceType = .photoLibrary
            self.present(imagePickerController, animated: true, completion: nil)
        }))
        
        actionSheet.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        present(actionSheet, animated: true, completion: nil)
    }
    
    // Dismiss image picker
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
    
    // Handle image picker and upload file to Box
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        // start activity indicator for "Uploading" state
        startActivityIndicator()
        
        // dismiss photo picker or camera
        self.dismiss(animated: true, completion: nil)
        
        guard let selectedFile = info[UIImagePickerControllerOriginalImage] as? UIImage else {
            fatalError("Expected a dictionary containing an image, but was provided the following: \(info)")
        }
        
        let toUploadImage = UIImageJPEGRepresentation(selectedFile, 1.0)
        let currentTimeStamp = String(Int(NSDate().timeIntervalSince1970))
        let fileName = "uploadedImage_\(currentTimeStamp).jpg"
        
        // upload file to Box
        let uploadRequest  : BOXFileUploadRequest? = boxClient.fileUploadRequestToFolder(withID: BOXAPIFolderIDRoot, from: toUploadImage, fileName: fileName)
        uploadRequest?.perform(progress: { (_ totalBytesTransferred: Int64, _ totalBytesExpectedToTransfer: Int64) in
        }, completion: { (file, error) in
            let alert = UIAlertController(title: "Successfully Uploaded", message: "View uploaded photo by selecting \"View Files\"", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Close", style: .default, handler: { (action) in
                alert.dismiss(animated: true, completion: nil)
            }))
            self.activityIndicator.stopAnimating()
            self.present(alert, animated: true, completion: nil)
        })
    }
    
    private func startActivityIndicator() {
        activityIndicator.center = self.view.center
        activityIndicator.hidesWhenStopped = true;
        activityIndicator.activityIndicatorViewStyle = UIActivityIndicatorViewStyle.gray
        view.addSubview(activityIndicator)
        activityIndicator.startAnimating()
    }
}

extension ProfileViewController : BOXAPIAccessTokenDelegate {
    func fetchAccessToken(completion: ((String?, Date?, Error?) -> Void)!) {
        BoxAccessTokenDelegate.retrieveBoxAccessToken(auth0AccessToken: self.accessToken) { (token, expire, error) in
            completion(token, expire, nil)
        }
    }
}
