///
//  BOXItemsViewControllerTableViewController.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/2/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXItemsViewController.h"
#import "BOXItemCell.h"
#import "BOXFolderViewController.h"
#import "BOXItem+BOXBrowseSDKAdditions.h"

@interface BOXItemsViewController ()

@property (nonatomic, readwrite, strong) NSArray *items;
@property (nonatomic, readwrite, assign) BOOL authenticationAttempted;

@end

@implementation BOXItemsViewController

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
{
    if (self = [super init]) {
        _contentClient = contentClient;
    }
    return self;
}

- (void)fetchItemsWithCompletion:(void (^)(NSArray *items, BOOL fromCache, NSError *error))completion
{
    BOXAbstract();
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.tableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero]; // eliminate extra separators
    self.tableView.separatorColor = [UIColor colorWithWhite:244.0f/255.0f alpha:1.0f];
    
    [self setupNavigationBar];
    
    self.refreshControl = [[UIRefreshControl alloc] init];
    [self.refreshControl addTarget:self action:@selector(refresh) forControlEvents:UIControlEventValueChanged];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    // We only want to display the authentication screen if :
    // - the user is not using app users (the contentClient's accessTokenDelegate is nil)
    // - the user is not logged in (the contentClient's user is nil)
    // - we did not present the authentication screen already.
    if (self.contentClient.user == nil && self.contentClient.accessTokenDelegate == nil && self.authenticationAttempted == NO) {
        
        BOXAuthorizationViewController *authViewController = [[BOXAuthorizationViewController alloc] initWithSDKClient:self.contentClient completionBlock:^(BOXAuthorizationViewController *authorizationViewController, BOXUser *user, NSError *error) {
            [authorizationViewController dismissViewControllerAnimated:YES completion:^{
                [self refresh];
            }];
        } cancelBlock:^(BOXAuthorizationViewController *authorizationViewController) {
            [authorizationViewController dismissViewControllerAnimated:YES completion:^{
                [self dismissViewControllerAnimated:YES completion:nil];
            }];
        }];
        UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:authViewController];
        [self presentViewController:navigationController animated:YES completion:nil];
        self.authenticationAttempted = YES;
    } else {
        [self refresh];
    }
    
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.items.count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return BOXItemCellHeight;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    BOXItem *item = [self.items objectAtIndex:indexPath.row];
    
    BOXItemCell *cell = [tableView dequeueReusableCellWithIdentifier:@"box-item-cell"];
    if (cell == nil) {
        cell = [[BOXItemCell alloc] initWithContentClient:self.contentClient style:UITableViewCellStyleSubtitle reuseIdentifier:@"box-item-cell"];
    }
    
    cell.item = item;
    
    if ([self.delegate respondsToSelector:@selector(itemsViewController:shouldEnableItem:)]) {
        cell.enabled = [self.delegate itemsViewController:self shouldEnableItem:item];
    } else {
        cell.enabled = YES;
    }
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Folder
    BOXItem *item = [self itemForRowAtIndexPath:indexPath];
    if (item.isFolder) {
        BOXFolder *folder = (BOXFolder *)item;
        if ([self.delegate respondsToSelector:@selector(itemsViewController:didTapFolder:inItems:)]) {
            [self.delegate itemsViewController:self didTapFolder:folder inItems:self.items];
        }
    }
    
    // File
    else if (item.isFile) {
        BOXFile *file = (BOXFile *)item;
        if ([self.delegate respondsToSelector:@selector(itemsViewController:didTapFile:inItems:)]) {
            [self.delegate itemsViewController:self didTapFile:file inItems:self.items];
        }
    }
    
    // Bookmark
    else if (item.isBookmark) {
        BOXBookmark *bookmark = (BOXBookmark *)item;
        if ([self.delegate respondsToSelector:@selector(itemsViewController:didTapBookmark:inItems:)]) {
            [self.delegate itemsViewController:self didTapBookmark:bookmark inItems:self.items];
        }
    }
}

- (BOXItem *)itemForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (self.items.count <= indexPath.row) {
        return nil;
    }

    return (BOXItem *)[self.items objectAtIndex:indexPath.row];
}

#pragma mark - Navbar

- (void)setupNavigationBar
{
    // Close Button
    BOOL shouldShowCloseButton = YES;
    if ([self.delegate respondsToSelector:@selector(itemsViewControllerShouldShowCloseButton:)]) {
        shouldShowCloseButton = [self.delegate itemsViewControllerShouldShowCloseButton:self];
    }
    
    if (shouldShowCloseButton) {

        NSString *closeButtonTitle = nil;
        if ([self.delegate respondsToSelector:@selector(itemsViewControllerCloseButtonTitle:)]) {
            closeButtonTitle = [self.delegate itemsViewControllerCloseButtonTitle:self];
        } else {
            closeButtonTitle = NSLocalizedString(@"Close", @"Label: Close action, often used on buttons");
        }

        UIBarButtonItem *closeBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:closeButtonTitle
                                                                               style:UIBarButtonItemStylePlain
                                                                              target:self
                                                                              action:@selector(closeButtonAction:)];
        [closeBarButtonItem setTitlePositionAdjustment:UIOffsetMake(0.0, 1)
                                         forBarMetrics:UIBarMetricsDefault];
        self.navigationItem.rightBarButtonItem = closeBarButtonItem;
    }
}

- (void)closeButtonAction:(id)sender
{
    if ([self.delegate respondsToSelector:@selector(itemsViewControllerDidTapCloseButtton:)]) {
        [self.delegate itemsViewControllerDidTapCloseButtton:self];
    } else {
        [[self navigationController] dismissViewControllerAnimated:YES completion:NULL];
    }
}

#pragma mark - data

- (void)refresh
{
    [self fetchItemsWithCompletion:^(NSArray *items, BOOL fromCache, NSError *error) {
        if (items && !error) {
            items = [self filterItems:items];
            BOOL shouldSort = YES;

            if ([self.delegate respondsToSelector:@selector(itemsViewControllerShouldSortItems:)]) {
                shouldSort = [self.delegate itemsViewControllerShouldSortItems:self];
            }

            if (shouldSort) {
                items = [self sortItems:items];
            }

            if ([self shouldReloadTableViewWithNewItems:items]) {
                self.items = items;
                [self.tableView reloadData];
            }
            [self.refreshControl endRefreshing];
        }
    }];
}

- (BOOL)shouldReloadTableViewWithNewItems:(NSArray *)newItems
{
    if (self.items.count != newItems.count) {
        return YES;
    } else {
        for (NSUInteger i = 0; i < self.items.count; i++) {
            BOXItem *originalItem = self.items[i];
            BOXItem *newItem = newItems[i];

            if (![originalItem.name isEqualToString:newItem.name]) {
                return YES;
            }

            if (originalItem.isFile) {
                if (!newItem.isFile) {
                    return YES;
                } else {
                    BOXFile *originalFile = (BOXFile *)originalItem;
                    BOXFile *newFile = (BOXFile *)newItem;

                    if (![originalFile.SHA1 isEqualToString:newFile.SHA1]) {
                        return YES;
                    }
                }
            }
        }
    }

    return NO;
}

- (NSArray *)sortItems:(NSArray *)items
{
    NSArray *sortedItems = [items sortedArrayUsingComparator:^NSComparisonResult(id obj1, id obj2)
                            {
                                NSComparisonResult order = NSOrderedSame;
                                BOXItem *itemA = (BOXItem*) obj1;
                                BOXItem *itemB = (BOXItem*) obj2;
                                
                                if ([self.delegate respondsToSelector:@selector(itemsViewController:compareForSortingItem:toItem:)]) {
                                    order = [self.delegate itemsViewController:self compareForSortingItem:itemA toItem:itemB];
                                } else {
                                    // Folders come first
                                    if (itemA.isFolder && !itemB.isFolder) {
                                        order = NSOrderedAscending;
                                    } else if (!itemA.isFolder && itemB.isFolder) {
                                        order = NSOrderedDescending;
                                        
                                        // Then we go by date descending
                                    } else {
                                        order = [[itemB effectiveUpdateDate] compare:[itemA effectiveUpdateDate]];
                                    }
                                }
                                
                                // If still no order defined, do alphabetical
                                if (order == NSOrderedSame) {
                                    order = [itemA.name compare:itemB.name options:NSCaseInsensitiveSearch];
                                }
                                
                                return order;
                            }];
    
    return sortedItems;
}

- (NSArray *)filterItems:(NSArray *)items
{
    if ([self.delegate respondsToSelector:@selector(itemsViewController:shouldShowItem:)]) {
        NSArray *filteredArray = [items objectsAtIndexes:[items indexesOfObjectsPassingTest:^BOOL(id obj, NSUInteger idx, BOOL *stop) {
            BOXItem *item = (BOXItem*) obj;
            return [self.delegate itemsViewController:self shouldShowItem:item];
        }]];
        return filteredArray;
    } else {
        return items;
    }
}

@end
