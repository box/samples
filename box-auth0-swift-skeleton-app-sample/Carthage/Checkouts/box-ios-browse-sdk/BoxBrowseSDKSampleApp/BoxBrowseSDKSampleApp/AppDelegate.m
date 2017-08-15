//
//  AppDelegate.m
//  BoxBrowseSDKSampleApp
//
//  Created by Rico Yao on 3/24/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

@import BoxBrowseSDK;

#import "AppDelegate.h"
#import "ViewController.h"

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    #error Set your client-id and client-secret that you obtained from https://developers.box.com
    [BOXContentClient setClientID:nil clientSecret:nil];

    ViewController *viewController = [[ViewController alloc] init];
    self.window.rootViewController = viewController;
    [self.window makeKeyAndVisible];
    return YES;
}

@end
