//
//  NSBundle+BOXBrowseSDKAdditions.m
//  Pods
//
//  Created by Andrew Dempsey on 12/29/15.
//
//

#import "NSBundle+BOXBrowseSDKAdditions.h"
#import "BOXBrowseSDKResourceLocator.h"

@implementation NSBundle (BOXBrowseSDKAdditions)

+ (NSBundle *)boxBrowseSDKResourcesBundle
{
    return [NSBundle bundleForClass:[BOXBrowseSDKResourceLocator class]];
}

@end
