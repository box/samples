//
//  UIAlertControllerExtension.swift
//  BoxPlatformSample
//
//  Created by Allen-Michael Grobelny on 4/12/17.
//  Copyright © 2017 Allen-Michael Grobelny. All rights reserved.
//

import UIKit

extension UIAlertController {
    
    static func loadingAlert() -> UIAlertController {
        return self.alert(title: "Loading", message: "Please, wait...")
    }
    
    static func alert(title: String? = nil, message: String? = nil, includeDoneButton: Bool = false) -> UIAlertController {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        if includeDoneButton {
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        }
        return alert
    }
    
    func presentInViewController(viewController: UIViewController, dismissAfter possibleDelay: TimeInterval? = nil, completion: (() -> ())? = nil) {
        viewController.present(self, animated: false, completion: nil)
        guard let delay = possibleDelay else {
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            self.dismiss(completion: completion)
        }
    }
    
    func dismiss(completion: (()->())? = nil) {
        DispatchQueue.main.async {
            self.dismiss(animated: false, completion: completion)
        }
    }
    
}
