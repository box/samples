//
//  BOXImageCache.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/31/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import <UIKit/UIKit.h>

@import BoxContentSDK;

@interface BOXThumbnailCache : NSObject

+ (instancetype)sharedInstanceForContentClient:(BOXContentClient *)contentClient;

- (BOXFileThumbnailRequest *)fetchThumbnailForFile:(BOXFile *)file size:(BOXThumbnailSize)size completion:(BOXImageBlock)completion;

- (BOOL)hasThumbnailInCacheForFile:(BOXFile *)file size:(BOXThumbnailSize)size;

@end
