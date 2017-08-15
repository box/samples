//
//  BOXBrowseSDKResourceLocator.h
//  Pods
//
//  Created by Andrew Dempsey on 12/29/15.
//
//

#import <Foundation/Foundation.h>

/**
 *  In order for NSBundle+BOXBrowseSDKAdditions to find the right resource
    bundle for Box Browse SDK, we need to use NSBundle's -bundleForClass to
    reliably find the correct filepath to Browse SDK's resource bundle. Since
    iOS 8 and the inclusion of dynamic frameworks, the way that 3rd party resource
    bundles are structured within dynamic frameworks has changed. Using this dummy
    class is the recommended way by Apple to locate the correct resource bundle
    for a given dynamic framework or independent resource bundle.
 */
@interface BOXBrowseSDKResourceLocator : NSObject

@end
