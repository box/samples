//
//  BOXImageCache.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/31/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXThumbnailCache.h"
#import "UIImage+BOXBrowseSDKAdditions.h"
#import "BOXBrowseSDKConstants.h"

@interface BOXThumbnailCache ()

@property (nonatomic, readonly, strong) BOXContentClient *contentClient;
@property (nonatomic, readonly, strong) NSCache *memoryCache;

@end

@implementation BOXThumbnailCache

+ (instancetype)sharedInstanceForContentClient:(BOXContentClient *)contentClient
{
    if (contentClient == nil) {
        return nil;
    }
    
    static NSMapTable *instances;
    if (instances == nil) {
        instances = [[NSMapTable alloc] init];
    }
    BOXThumbnailCache *instance = [instances objectForKey:contentClient];
    if (instance == nil) {
        instance = [[self alloc] initWithContentClient:contentClient];
        [instances setObject:instance forKey:contentClient];
    }
    
    return instance;
}

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
{
    if (self = [super init]) {
        _contentClient = contentClient;
        _memoryCache = [[NSCache alloc] init];
    }
    return self;
}

- (BOXFileThumbnailRequest *)fetchThumbnailForFile:(BOXFile *)file size:(BOXThumbnailSize)size completion:(BOXImageBlock)completion
{
    NSString *key = [self cacheKeyForFile:file thumbnailSize:size];
    __block UIImage *thumbnail = [self.memoryCache objectForKey:key];
    if (thumbnail) {
        completion(thumbnail, nil);
    } else {
        BOXFileThumbnailRequest *request = [self.contentClient fileThumbnailRequestWithID:file.modelID size:size];
        request.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
        request.SDKVersion = BOX_BROWSE_SDK_VERSION;
        [request performRequestWithProgress:nil completion:^(UIImage *image, NSError *error) {
            if (image) {
                thumbnail = [image box_imageAtAppropriateScaleFactor];
                [self.memoryCache setObject:thumbnail forKey:key];
            }
            completion(image, error);
        }];
        return request;
    }
    return nil;
}

- (BOOL)hasThumbnailInCacheForFile:(BOXFile *)file size:(BOXThumbnailSize)size
{
    NSString *key = [self cacheKeyForFile:file thumbnailSize:size];
    return [self.memoryCache objectForKey:key] != nil;
}

- (NSString *)cacheKeyForFile:(BOXFile *)file thumbnailSize:(BOXThumbnailSize)thumbnailSize
{
    NSString *key = [NSString stringWithFormat:@"%@_%lu", file.SHA1, (unsigned long) thumbnailSize];
    return key;
}

@end
