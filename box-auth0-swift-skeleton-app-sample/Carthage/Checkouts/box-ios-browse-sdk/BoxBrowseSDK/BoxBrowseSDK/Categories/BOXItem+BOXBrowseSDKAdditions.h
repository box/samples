//
//  BOXItem+BOXBrowseSDKAdditions.h
//  BoxBrowseSDK
//
//  Created on 1/28/16.
//  Copyright © 2016 BOX. All rights reserved.
//

@import BoxContentSDK;

@interface BOXItem (BOXBrowseSDKAdditions)


/**
 * Returns the date to use for comparing when items were modified.
 * BOXFiles will use contentModifiedDate, BOXFolder and BOXBookmark will use modifiedDate.
 *
 *  @return The date to use for comparing when items were modified.
 */
- (NSDate *)effectiveUpdateDate;

@end
