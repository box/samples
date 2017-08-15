//
//  BOXCreateFolderViewController.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/1/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <BoxContentSDK/BOXContentSDK.h>

@interface BOXCreateFolderViewController : UIViewController <UITextFieldDelegate>

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                       parentFolderID:(NSString *)parentFolderID
                           completion:(BOXFolderBlock)completion;

@end
