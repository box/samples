//
//  BOXBrowseSDKFileTypeHelper.h
//  BoxBrowseSDK
//
//  Created by Clement Rousselle on 1/3/17.
//  Copyright © 2017 BOX. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface BOXBrowseSDKFileTypeHelper : NSObject

+ (NSSet <NSString *> *)audioFileExtensions;
+ (NSSet <NSString *> *)imageFileExtensions;
+ (NSSet <NSString *> *)vectorImageFileExtensions;
+ (NSSet <NSString *> *)videoFileExtensions;
+ (NSSet <NSString *> *)docFileExtensions;
+ (NSSet <NSString *> *)codeFileExtensions;
+ (NSSet <NSString *> *)textFileExtensions;
+ (NSSet <NSString *> *)compressedFileExtensions;
+ (NSSet <NSString *> *)presentationFileExtensions;
+ (NSSet <NSString *> *)sheetFileExtensions;
+ (NSSet <NSString *> *)dbFileExtensions;
+ (NSSet <NSString *> *)iconFileExtensions;

@end
