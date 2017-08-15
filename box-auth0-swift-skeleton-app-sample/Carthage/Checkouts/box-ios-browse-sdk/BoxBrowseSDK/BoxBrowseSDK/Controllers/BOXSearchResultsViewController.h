//
//  BOXSearchResultsViewController.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/3/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXItemsViewController.h"
#import <BoxContentSDK/BOXContentSDK.h>

@interface BOXSearchResultsViewController : BOXItemsViewController

- (void)performSearchForSearchString:(NSString *)searchString inFolderID:(NSString *)folderID;

@end
