//
//  BOXSearchResultsViewController.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/3/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXSearchResultsViewController.h"
#import "BOXFolderViewController.h"
#import "BOXBrowseSDKConstants.h"

@interface BOXSearchResultsViewController ()

@property (nonatomic, readwrite, strong) NSString *searchString;
@property (nonatomic, readwrite, strong) NSString *folderID;
@property (nonatomic, readwrite, strong) BOXSearchRequest *searchRequest;

@end

@implementation BOXSearchResultsViewController


- (void)performSearchForSearchString:(NSString *)searchString inFolderID:(NSString *)folderID
{
    self.searchString = searchString;
    self.folderID = folderID;
    [self refresh];
}

- (void)dealloc
{
    [self.searchRequest cancel];
    self.searchRequest = nil;
}

- (void)fetchItemsWithCompletion:(void (^)(NSArray *, BOOL fromCache, NSError *))completion
{
    [self.searchRequest cancel];
    
    self.searchRequest = [self.contentClient searchRequestWithQuery:self.searchString inRange:NSMakeRange(0, 1000)];
    self.searchRequest.requestAllItemFields = YES;
    self.searchRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
    self.searchRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
    self.searchRequest.ancestorFolderIDs = @[self.folderID];
    [self.searchRequest performRequestWithCompletion:^(NSArray *items, NSUInteger totalCount, NSRange range, NSError *error) {
        completion(items, NO, error);
    }];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    [super tableView:tableView didSelectRowAtIndexPath:indexPath];
    
    // Folder
    BOXItem *item = [self itemForRowAtIndexPath:indexPath];
    if (item.isFolder) {
        BOXFolder *folder = (BOXFolder *)item;
        BOOL shouldNavigateToFolder = YES;
        if ([self.delegate respondsToSelector:@selector(itemsViewController:willNavigateToFolder:)]) {
            shouldNavigateToFolder = [self.delegate itemsViewController:self willNavigateToFolder:folder];
        }
        if (shouldNavigateToFolder) {
            BOXFolderViewController *viewController = [[BOXFolderViewController alloc] initWithContentClient:self.contentClient folder:folder];
            viewController.delegate = self.delegate;
            self.navigationItem.backBarButtonItem.title = folder.parentFolder.name;
            [self.presentingViewController.navigationController pushViewController:viewController animated:YES];
        }
    }
}

@end
