//
//  BOXBrowseSDKFileTypeHelper.m
//  BoxBrowseSDK
//
//  Created by Clement Rousselle on 1/3/17.
//  Copyright © 2017 BOX. All rights reserved.
//

#import "BOXBrowseSDKFileTypeHelper.h"

@implementation BOXBrowseSDKFileTypeHelper

+ (NSSet <NSString *> *)audioFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"aac", @"aiff", @"m3u", @"m4a", @"mid", @"mp3", @"wav", @"wpl", @"wma", @"amr", @"3gp", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)imageFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"bmp", @"dcm", @"gdraw", @"gif", @"jpeg", @"jpg", @"tiff", @"tif", @"png", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)vectorImageFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"eps", @"svg", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)videoFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"avi", @"flv", @"m4v", @"mov", @"mp4", @"mpeg", @"mpg", @"qt", @"wmv", @"mts", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)docFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"doc", @"docx", @"dot", @"dotx", @"gdoc", @"odt", @"ott", @"pages", @"rtf", @"rtfd", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)codeFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"aspx", @"h", @"c", @"c++", @"cpp", @"m", @"css", @"htm", @"html", @"java", @"js", @"php", @"scala", @"webba", @"xhtml", @"xml", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)textFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"markdown", @"md", @"mdown", @"txt", @"text", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)compressedFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"rar", @"zip", @"gz", @"tgz", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)presentationFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"gslide", @"key", @"keynote", @"opd", @"otp", @"pot", @"potx", @"ppt", @"pptx", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)sheetFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"csv", @"gsheet", @"numbers", @"ods", @"ots", @"xls", @"xlsx", @"xlt", @"xltx", nil];
    }
    
    return extensions;
}

+ (NSSet <NSString *> *)dbFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"db", @"sql", @"sqlite", nil];
    }
    return extensions;
}

+ (NSSet <NSString *> *)iconFileExtensions
{
    static NSSet *extensions = nil;
    
    if (extensions == nil) {
        extensions = [NSSet setWithObjects:@"ico", @"icns", nil];
    }
    return extensions;
}

@end
