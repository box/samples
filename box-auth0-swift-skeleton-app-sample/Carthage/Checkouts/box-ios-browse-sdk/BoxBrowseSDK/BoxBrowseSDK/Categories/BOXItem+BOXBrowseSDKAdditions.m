//
//  BOXItem+BOXBrowseSDKAdditions.m
//  BoxBrowseSDK
//
//  Created on 1/28/16.
//  Copyright © 2016 BOX. All rights reserved.
//

#import "BOXItem+BOXBrowseSDKAdditions.h"

@implementation BOXItem (BOXBrowseSDKAdditions)

- (NSDate *)effectiveUpdateDate
{
    return self.isFile ? self.contentModifiedDate : self.modifiedDate;
}

@end
