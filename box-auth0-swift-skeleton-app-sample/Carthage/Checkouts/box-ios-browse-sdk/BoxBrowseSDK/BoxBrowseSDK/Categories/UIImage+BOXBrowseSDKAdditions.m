//
//  UIImage+BOXBrowseSDKAdditions.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/30/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

@import BoxContentSDK;

#import "UIImage+BOXBrowseSDKAdditions.h"
#import "NSBundle+BOXBrowseSDKAdditions.h"
#import "BOXBrowseSDKFileTypeHelper.h"

NS_ASSUME_NONNULL_BEGIN

@implementation UIImage (BOXBrowseSDKAdditions)

#pragma mark - Public Methods

+ (UIImage *)box_iconForItem:(BOXItem *)item
{
    UIImage *icon = nil;

    if (item.isFolder) {
        BOXFolder *folder = (BOXFolder *)item;
        if (folder.isExternallyOwned == BOXAPIBooleanYES) {
            icon = [UIImage box_iconWithName:@"external_folder"];

        } else if (folder.hasCollaborations == BOXAPIBooleanYES) {
            icon = [UIImage box_iconWithName:@"shared_folder"];

        } else {
            icon = [UIImage box_iconWithName:@"personal_folder"];

        }
    } else if (item.isFile) {
        icon = [UIImage box_iconForFileName:item.name];

    } else if (item.isBookmark) {
        icon = [UIImage box_iconWithName:@"link"];

    }

    BOXAssert(icon != nil, @"No icon for item %@.", item);
    return icon;
}

+ (UIImage *)box_smallIconForItem:(BOXItem *)item
{
    UIImage *icon = nil;
    
    if (item.isFolder) {
        BOXFolder *folder = (BOXFolder *)item;
        if (folder.isExternallyOwned == BOXAPIBooleanYES) {
            icon = [UIImage box_iconWithName:@"small_external_folder"];
            
        } else if (folder.hasCollaborations == BOXAPIBooleanYES) {
            icon = [UIImage box_iconWithName:@"small_shared_folder"];
            
        } else {
            icon = [UIImage box_iconWithName:@"small_personal_folder"];
            
        }
    } else if (item.isFile) {
        NSString *fileExtension = [item.name box_pathExtensionAccountingForZippedPackages].lowercaseString;
        NSString *iconName = [self iconNameForFileExtension:fileExtension];

        icon = [UIImage box_iconWithName:[@"small_" stringByAppendingString:iconName]];

    } else if (item.isBookmark) {
        icon = [UIImage box_iconWithName:@"small_link"];
    }

    BOXAssert(icon != nil, @"No small icon for item %@.", item);
    return icon;
}

+ (UIImage *)box_iconForFileName:(NSString *)fileName
{
    NSString *fileExtension = [fileName box_pathExtensionAccountingForZippedPackages].lowercaseString;
    NSString *iconName = [self iconNameForFileExtension:fileExtension];

    UIImage *image = [UIImage box_iconWithName:iconName];

    if (image == nil) {
        image = [UIImage box_genericFileIcon];
    }

    return image;
}

+ (UIImage *)box_genericFileIcon
{
    return [UIImage box_iconWithName:@"generic"];
}

+ (UIImage *)box_genericFolderIcon
{
    return [UIImage box_iconWithName:@"personal_folder"];
}

- (UIImage *)box_imageAtAppropriateScaleFactor
{
    UIImage *image = self;
    CGFloat scaleFactor = [UIScreen mainScreen].scale;
    if (scaleFactor != 1.0f) {
        image = [UIImage imageWithCGImage:image.CGImage scale:scaleFactor orientation:image.imageOrientation];
    }

    return image;
}

#pragma mark - Private Methods

+ (nullable UIImage *)box_iconWithName:(NSString *)name
{
    UIImage *icon = nil;
    NSBundle *browseSDKResourceBundle = [NSBundle boxBrowseSDKResourcesBundle];

    @synchronized (browseSDKResourceBundle) {
        icon = [UIImage imageNamed:name
                          inBundle:browseSDKResourceBundle
     compatibleWithTraitCollection:nil];
    }

    return icon;
}

+ (NSString *)iconNameForFileExtension:(NSString *)fileExtension
{
    NSString *iconName = @"generic";
    if ([[BOXBrowseSDKFileTypeHelper audioFileExtensions] containsObject:fileExtension])  {
        iconName = @"audio";
    }
    else if ([[BOXBrowseSDKFileTypeHelper imageFileExtensions] containsObject:fileExtension]) {
        iconName = @"image";
    }
    else if ([[BOXBrowseSDKFileTypeHelper videoFileExtensions] containsObject:fileExtension]) {
        iconName = @"video";
    }
    else if ([[BOXBrowseSDKFileTypeHelper docFileExtensions] containsObject:fileExtension]) {
        iconName = @"document";
    }
    else if ([[BOXBrowseSDKFileTypeHelper codeFileExtensions] containsObject:fileExtension]) {
        iconName = @"code";
    }
    else if ([[BOXBrowseSDKFileTypeHelper textFileExtensions] containsObject:fileExtension]) {
        iconName = @"text";
    }
    else if ([[BOXBrowseSDKFileTypeHelper presentationFileExtensions] containsObject:fileExtension]) {
        iconName = @"presentation";
    }
    else if ([[BOXBrowseSDKFileTypeHelper sheetFileExtensions] containsObject:fileExtension]) {
        iconName = @"spreadsheet";
    }
    else if ([[BOXBrowseSDKFileTypeHelper compressedFileExtensions] containsObject:fileExtension]) {
        iconName = @"zip";
    }
    else if ([[BOXBrowseSDKFileTypeHelper vectorImageFileExtensions] containsObject:fileExtension]) {
        iconName = @"vector";
    }
    else if ([[BOXBrowseSDKFileTypeHelper dbFileExtensions] containsObject:fileExtension]) {
        iconName = @"database";
    }
    else if ([[BOXBrowseSDKFileTypeHelper iconFileExtensions] containsObject:fileExtension]) {
        iconName = @"icon";
    }
    else if ([fileExtension isEqualToString:@"boxnote"]) {
        iconName = @"boxnote";
    }
    else if ([fileExtension isEqualToString:@"ai"]) {
        iconName = @"illustrator";
    }
    else if ([fileExtension isEqualToString:@"indd"]) {
        iconName = @"inDesign";
    }
    else if ([fileExtension isEqualToString:@"pdf"]) {
        iconName = @"pdf";
    }
    else if ([fileExtension isEqualToString:@"psd"]) {
        iconName = @"photoshop";
    }
    else if ([fileExtension isEqualToString:@"sketch"]) {
        iconName = @"sketch";
    }
    
    return iconName;
}

@end

NS_ASSUME_NONNULL_END
