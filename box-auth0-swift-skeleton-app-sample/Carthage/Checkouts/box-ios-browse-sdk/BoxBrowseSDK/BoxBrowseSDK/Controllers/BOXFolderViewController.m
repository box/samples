//
//  BOXBrowseTableViewController.m
//  BoxBrowseSDK
//
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXFolderViewController.h"
#import <BoxContentSDK/BoxContentSDK.h>
#import "UIImage+BOXBrowseSDKAdditions.h"
#import "BOXItemCell.h"
#import "BOXCreateFolderViewController.h"
#import "BOXSearchResultsViewController.h"
#import <MBProgressHUD/MBProgressHUD.h>
#import "BOXBrowseSDKConstants.h"

@interface BOXFolderViewController () <UISearchBarDelegate, UISearchControllerDelegate, UISearchResultsUpdating>

@property (nonatomic, readwrite, strong) BOXFolder *folder;

@property (nonatomic, readwrite, strong) UISearchController *searchController;
@property (nonatomic, readwrite, strong) BOXSearchResultsViewController *searchResultsController;

@property (nonatomic, readwrite, strong) NSIndexPath *indexPathForDeleteCandidate;

@property (nonatomic, readwrite, strong) UIView *backgroundView;
@property (nonatomic, readwrite, strong) UIActivityIndicatorView *activityIndicator;
@property (nonatomic, readwrite, strong) UILabel *folderInfoLabel;

@end

@implementation BOXFolderViewController

+ (NSArray *)navigationStackViewControllersWithContentClient:(BOXContentClient *)contentClient
                                              startingFolder:(BOXFolder *)folder
{
    NSMutableArray *controllersArray = [NSMutableArray arrayWithCapacity:(folder.pathFolders.count + 1)];

    for (BOXFolderMini *miniFolder in folder.pathFolders) {
        [controllersArray addObject:[[self alloc] initWithContentClient:contentClient folderMini:miniFolder]];
    }
    [controllersArray addObject:[[self alloc] initWithContentClient:contentClient folder:folder]];

    return [controllersArray copy];
}

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
{
    if (self = [self initWithContentClient:contentClient folderID:BOXAPIFolderIDRoot]) {
        //
    }
    return self;
}

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                             folderID:(NSString *)folderID
{
    if (self = [super initWithContentClient:contentClient]) {
        _folderID = folderID;
        if ([folderID isEqualToString:BOXAPIFolderIDRoot]) {
            _folder = [[BOXFolder alloc] init];
            _folder.modelID = BOXAPIFolderIDRoot;
            _folder.name = NSLocalizedString(@"All Files", @"Title: The title of the main Files and Folders navigation section and view, also the name for the root folder");
            [self updateNavigationBarTitle];
        }
    }
    return self;
}

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                           folderMini:(BOXFolderMini *)folderMini
{
    if (self = [self initWithContentClient:contentClient folderID:folderMini.modelID]) {
        [self updateNavigationBarTitle];
    }
    return self;
}

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                               folder:(BOXFolder *)folder
{
    if (self = [self initWithContentClient:contentClient folderID:folder.modelID]) {
        _folder = folder;
        [self updateNavigationBarTitle];
    }
    return self;
}

- (void)updateNavigationBarTitle
{
    if ([self.folder isRoot]) {
        self.title = NSLocalizedString(@"All Files", @"Title: The title of the main Files and Folders navigation section and view, also the name for the root folder");
    } else {
        self.title = self.folder.name;
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    BOXAssert(self.navigationController, @"BOXFolderViewController must be placed in a UINavigationController");

    [self setupForSearch];
    
    self.backgroundView = [[UIView alloc] init];

    self.activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    self.activityIndicator.hidesWhenStopped = YES;
    [self.activityIndicator startAnimating];
    [self.backgroundView addSubview:self.activityIndicator];

    self.folderInfoLabel = [[UILabel alloc] init];
    self.folderInfoLabel.textAlignment = NSTextAlignmentCenter;
    self.folderInfoLabel.font = [UIFont boldSystemFontOfSize:15.0f];
    self.folderInfoLabel.textColor = [UIColor colorWithRed:180.0f/255.0f green:179.0f/255.0f blue:180.0f/255.0f alpha:1.0f];
    self.folderInfoLabel.backgroundColor = [UIColor clearColor];
    self.folderInfoLabel.contentMode = UIViewContentModeCenter;
    self.folderInfoLabel.numberOfLines = 0;
    self.folderInfoLabel.text = @"";
    self.folderInfoLabel.hidden = YES;
    self.folderInfoLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    [self.backgroundView addSubview:self.folderInfoLabel];

    self.tableView.backgroundView = self.backgroundView;
}

- (void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];

    [self.backgroundView setBounds:self.view.bounds];
    [self layoutActivityIndicator];
    [self layoutFolderInfoLabel];
}

- (void)layoutActivityIndicator
{
    self.activityIndicator.center = self.backgroundView.center;
}

- (void)layoutFolderInfoLabel
{
    self.folderInfoLabel.frame = CGRectMake(0, 0, self.backgroundView.frame.size.width, self.backgroundView.frame.size.height);
    self.folderInfoLabel.center = self.backgroundView.center;
}

#pragma mark - Search

- (void)setupForSearch
{
    // UISearchController was introduced in iOS8, so we don't have search on iOS 7.
    BOOL shouldShowSearchBar = YES;
    if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewControllerShouldShowSearchBar:)]) {
        shouldShowSearchBar = [self.folderBrowserDelegate folderViewControllerShouldShowSearchBar:self];
    }
    if ([UISearchController class] && shouldShowSearchBar) {
        self.definesPresentationContext = YES;
        
        self.searchResultsController = [[BOXSearchResultsViewController alloc] initWithContentClient:self.contentClient];
        self.searchResultsController.delegate = self.delegate;
        
        self.searchController = [[UISearchController alloc] initWithSearchResultsController:self.searchResultsController];
        self.searchController.hidesNavigationBarDuringPresentation = YES;
        self.searchController.dimsBackgroundDuringPresentation = YES;
        self.searchController.delegate = self;
        self.searchController.searchResultsUpdater = self;
        
        [self.searchController.searchBar sizeToFit];
        self.searchController.searchBar.delegate = self;
        self.searchController.searchBar.showsCancelButton = NO;
        self.searchController.searchBar.hidden = YES; // Starts off hidden, and only when we've fetched items do we bring it in.
        if (self.folder.name.length > 0 && ![self.folder.modelID isEqualToString:BOXAPIFolderIDRoot]) {
            self.searchController.searchBar.placeholder =
                [NSString stringWithFormat:NSLocalizedString(@"Search “%@”", @"Label: Files Search Bar Placeholder"), self.folder.name];
        }
        self.tableView.tableHeaderView = self.searchController.searchBar;
    }
}

#pragma mark - UISearchControllerDelegate

- (void)willPresentSearchController:(UISearchController *)searchController
{
    [self.navigationController setToolbarHidden:YES animated:YES];
}

- (void)willDismissSearchController:(UISearchController *)searchController
{
    [self.navigationController setToolbarHidden:NO animated:YES];
}

#pragma mark - UISearchResultsUpdating

- (void)updateSearchResultsForSearchController:(UISearchController *)searchController
{
    NSString *searchText = searchController.searchBar.text;
    [self.searchResultsController performSearchForSearchString:searchText inFolderID:self.folderID];
}

#pragma mark - UISearchBarDelegate

- (void)searchBarTextDidBeginEditing:(UISearchBar *)searchBar
{
    [self.searchController.searchBar setShowsCancelButton:YES animated:YES];
}

- (void)searchBarCancelButtonClicked:(UISearchBar *)searchBar
{
    [self.searchController.searchBar resignFirstResponder];
    [self.searchController.searchBar setShowsCancelButton:NO animated:YES];
}

- (id<BOXFolderViewControllerDelegate>)folderBrowserDelegate
{
    if ([self.delegate conformsToProtocol:@protocol(BOXFolderViewControllerDelegate)]) {
        return (id<BOXFolderViewControllerDelegate>)self.delegate;
    } else {
        return nil;
    }
}

#pragma mark - Table view delegate

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    BOXItem *item = [self itemForRowAtIndexPath:indexPath];
    
    BOOL shouldShowDeleteButton = NO;
    if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewController:shouldShowDeleteButtonForItem:)]) {
        shouldShowDeleteButton = [self.folderBrowserDelegate folderViewController:self shouldShowDeleteButtonForItem:item];
    }
    
    if (!shouldShowDeleteButton) {
        return NO;
    }

    return (item.canDelete == BOXAPIBooleanYES);
}

- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return UITableViewCellEditingStyleDelete;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:NSLocalizedString(@"Delete Item", @"Label: title for item deletion confirmation alert")
                                                                             message:NSLocalizedString(@"Are you sure you want to delete this item?", @"Label: confirmation message for item deletion")
                                                                      preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:NSLocalizedString(@"Cancel", @"Label: Cancel action. Usually used on buttons.")
                                                            style:UIAlertActionStyleCancel
                                                          handler:^(UIAlertAction *action) {
                                                              [alertController dismissViewControllerAnimated:YES completion:nil];
                                                          }];
    
    UIAlertAction *deleteAction = [UIAlertAction actionWithTitle:NSLocalizedString(@"Delete", @"Label: Delete action on a single or multiple files and folders, often used on buttons. The space is very small so it needs to be abbreviated if possible.")
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction *action) {
                                                              [alertController dismissViewControllerAnimated:YES completion:nil];
                                                              [self deleteItemAction];
                                                          }];
    
    [alertController addAction:cancelAction];
    [alertController addAction:deleteAction];
    [self presentViewController:alertController animated:YES completion:nil];
    
    
    self.indexPathForDeleteCandidate = indexPath;
}

- (void)deleteItemAction
{
    BOXItem *item = [self itemForRowAtIndexPath:self.indexPathForDeleteCandidate];
    
    BOXErrorBlock errorBlock = ^(NSError *error){
        dispatch_async(dispatch_get_main_queue(), ^{
            [MBProgressHUD hideHUDForView:self.view animated:YES];
            if (error) {
                UIAlertController *alertController = [UIAlertController alertControllerWithTitle:NSLocalizedString(@"Unable to Delete", @"Label: title for item deletion failure alert")
                                                                                         message:NSLocalizedString(@"Unable to delete this item.", @"Label: alert message for item deletion failure")
                                                                                  preferredStyle:UIAlertControllerStyleAlert];
                
                UIAlertAction *dismissAction = [UIAlertAction actionWithTitle:NSLocalizedString(@"Dismiss", @"Label: Allow the user to dismiss the current view or interface, often used on buttons to dismiss alerts")
                                                                   style:UIAlertActionStyleCancel
                                                                 handler:^(UIAlertAction *action) {
                                                                     [alertController dismissViewControllerAnimated:YES completion:nil];
                                                                 }];
                [alertController addAction:dismissAction];
                [self presentViewController:alertController animated:YES completion:nil];
                
            } else {
                [self refresh];
                if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewController:didDeleteItem:)]) {
                    [self.folderBrowserDelegate folderViewController:self didDeleteItem:item];
                }
            }
        });
    };
    
    if (item.isFile) {
        BOXFileDeleteRequest *deleteRequest = [self.contentClient fileDeleteRequestWithID:item.modelID];
        deleteRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
        deleteRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
        [deleteRequest performRequestWithCompletion:errorBlock];
    } else if (item.isFolder) {
        BOXFolderDeleteRequest *deleteRequest = [self.contentClient folderDeleteRequestWithID:item.modelID];
        deleteRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
        deleteRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
        [deleteRequest performRequestWithCompletion:errorBlock];
    } else if (item.isBookmark) {
        BOXBookmarkDeleteRequest *deleteRequest = [self.contentClient bookmarkDeleteRequestWithID:item.modelID];
        deleteRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
        deleteRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
        [deleteRequest performRequestWithCompletion:errorBlock];
    }
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    hud.label.text = NSLocalizedString(@"Deleting item...", @"HUD message for when item is being deleted");
    hud.mode = MBProgressHUDModeCustomView;
    hud.removeFromSuperViewOnHide = YES;
    [hud showAnimated:YES];
}

#pragma mark - Table view data source

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    [super tableView:tableView didSelectRowAtIndexPath:indexPath];
    
    // Folder
    BOXItem *item = [self itemForRowAtIndexPath:indexPath];
    if (item.isFolder) {
        BOXFolder *folder = (BOXFolder *)item;
        BOOL shouldNavigateToFolder = YES;
        if ([self.folderBrowserDelegate respondsToSelector:@selector(itemsViewController:willNavigateToFolder:)]) {
            shouldNavigateToFolder = [self.folderBrowserDelegate itemsViewController:self willNavigateToFolder:folder];
        }
        if (shouldNavigateToFolder) {
            BOXFolderViewController *viewController = [[BOXFolderViewController alloc] initWithContentClient:self.contentClient
                                                                                                      folder:folder];
            viewController.delegate = self.folderBrowserDelegate;
            self.navigationItem.backBarButtonItem.title = folder.parentFolder.name;
            viewController.navigationItem.prompt = self.navigationItem.prompt;
            [self.navigationController pushViewController:viewController animated:YES];
        }
    }
}

#pragma mark - Toolbar

- (void)setupToolbar
{
    NSMutableArray *toolbarItems = [NSMutableArray array];
    
    BOOL shouldShowCreateFolderButton = NO;
    if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewControllerShouldShowCreateFolderButton:)]) {
        shouldShowCreateFolderButton = [self.folderBrowserDelegate folderViewControllerShouldShowCreateFolderButton:self];
    }
    if (shouldShowCreateFolderButton) {
        UIBarButtonItem *createFolderButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"Create Folder", @"Button to create a new folder")
                                                                                   style:UIBarButtonItemStylePlain
                                                                                  target:self
                                                                                  action:@selector(createFolderButtonAction:)];
        [toolbarItems addObject:createFolderButtonItem];
    }
    
    BOOL shouldShowChooseFolderButton = NO;
    if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewControllerShouldShowChooseFolderButton:)]) {
        shouldShowChooseFolderButton = [self.folderBrowserDelegate folderViewControllerShouldShowChooseFolderButton:self];
    }
    
    if (shouldShowChooseFolderButton) {
        NSString *chooseFolderButtonTitle = NSLocalizedString(@"Choose", @"Title: Button allowing to choose the current selection (for example, the currently viewed folder, date, share permission settings, etc)");
        if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewControllerChooseFolderButtonTitle:)]) {
            chooseFolderButtonTitle = [self.folderBrowserDelegate folderViewControllerChooseFolderButtonTitle:self];
        }
        UIBarButtonItem *chooseFolderButtonItem = [[UIBarButtonItem alloc] initWithTitle:chooseFolderButtonTitle
                                                                                   style:UIBarButtonItemStyleDone
                                                                                  target:self
                                                                                  action:@selector(chooseFolderButtonAction:)];
        [toolbarItems addObject:chooseFolderButtonItem];
    }
    
    // Re-adjust spacing through spacer button items.
    UIBarButtonItem *spacerButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace
                                                                                      target:nil
                                                                                      action:nil];
    NSMutableArray *spacedToolbarItems = [NSMutableArray array];
    if (toolbarItems.count > 1) {
        [toolbarItems enumerateObjectsUsingBlock:^(id object, NSUInteger idx, BOOL *stop) {
            [spacedToolbarItems addObject:object];
            if (idx < toolbarItems.count - 1) {
                [spacedToolbarItems addObject:spacerButtonItem];
            }
        }];
    } else if (toolbarItems.count == 1) {
        spacedToolbarItems = [NSMutableArray arrayWithArray:@[spacerButtonItem, [toolbarItems firstObject], spacerButtonItem]];
    }
    
    self.navigationController.toolbarHidden = toolbarItems.count <= 0;
    self.toolbarItems = spacedToolbarItems;
}

- (void)createFolderButtonAction:(id)sender
{
    __weak BOXFolderViewController *weakSelf = self;
    BOXCreateFolderViewController *createFolderViewController = [[BOXCreateFolderViewController alloc] initWithContentClient:self.contentClient parentFolderID:self.folderID completion:^(BOXFolder *folder, NSError *error) {
        [weakSelf refresh];
        BOXFolderViewController *folderBrowserViewController = [[BOXFolderViewController alloc] initWithContentClient:weakSelf.contentClient folder:folder];
        folderBrowserViewController.delegate = weakSelf.delegate;
        folderBrowserViewController.navigationItem.prompt = weakSelf.navigationItem.prompt;
        [weakSelf.navigationController pushViewController:folderBrowserViewController animated:YES];

        if ([weakSelf.folderBrowserDelegate respondsToSelector:@selector(folderViewController:didCreateNewFolder:)]) {
            [weakSelf.folderBrowserDelegate folderViewController:weakSelf didCreateNewFolder:folder];
        }
    }];
    
    createFolderViewController.navigationItem.prompt = self.navigationItem.prompt;
    [self.navigationController pushViewController:createFolderViewController animated:YES];
}

- (void)chooseFolderButtonAction:(id)sender
{
    if ([self.folderBrowserDelegate respondsToSelector:@selector(folderViewController:didChooseFolder:)]) {
        [self.folderBrowserDelegate folderViewController:self didChooseFolder:self.folder];
    }
}

#pragma mark - data

- (void)fetchItemsWithCompletion:(void (^)(NSArray *items, BOOL fromCache, NSError *error))externalCompletionBlock
{
    [self setupToolbar];
    
    // Refresh the underlying folder, just in case the name changed.
    BOXFolderRequest *folderRequest = [self.contentClient folderInfoRequestWithID:self.folderID];
    folderRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
    folderRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
    folderRequest.requestAllFolderFields = YES;

    void (^internalCompletionBlock)(NSArray *, BOOL, NSError *) = ^void(NSArray *items, BOOL fromCache, NSError *error) {

        [BOXDispatchHelper callCompletionBlock:^{
            if (!error) {
                if (items.count == 0) {
                    if (!fromCache) {
                        [self switchToEmptyStateWithError:nil];
                    }
                } else {
                    [self switchToNonEmptyView];
                }
            } else if (!fromCache && self.tableView.visibleCells.count < 1) {
                [self switchToEmptyStateWithError:error];
            }

            if (externalCompletionBlock) {
                externalCompletionBlock(items, fromCache, error);
            }

        } onMainThread:YES];
    };

    void (^itemFetchBlock)(BOXFolder *, BOOL fromCache, NSError *) = ^void(BOXFolder *folder, BOOL fromCache, NSError *error) {
        if (error.code == BOXContentSDKAPIErrorBadRequest ||
            error.code == BOXContentSDKAPIErrorUnauthorized ||
            error.code == BOXContentSDKAPIErrorForbidden ||
            error.code == BOXContentSDKAPIErrorNotFound) {
            internalCompletionBlock(nil, fromCache, error);

        } else {
            if (folder && !error) {
                [self setCurrentFolder:folder];
            }

            if (fromCache) {
                [self fetchItemsInFolder:self.folder cacheBlock:^(NSArray *items, NSError *error){
                    internalCompletionBlock(items, YES, error);
                } refreshBlock:nil];
            } else {
                [self fetchItemsInFolder:self.folder cacheBlock:nil refreshBlock:^(NSArray *items, NSError *error) {
                    internalCompletionBlock(items, NO, error);
                }];
            }
        }
    };

    [folderRequest performRequestWithCached:^(BOXFolder *folder, NSError *error) {
        itemFetchBlock(folder, YES, error);

    } refreshed:^(BOXFolder *folder, NSError *error) {
        itemFetchBlock(folder, NO, error);
    }];
}

- (void)fetchItemsInFolder:(BOXFolder *)folder cacheBlock:(void (^)(NSArray *items, NSError *error))cacheBlock refreshBlock:(void (^)(NSArray *items, NSError *error))refreshBlock
{
    BOXFolderItemsRequest *request = [self.contentClient folderItemsRequestWithID:folder.modelID];
    request.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
    request.SDKVersion = BOX_BROWSE_SDK_VERSION;
    [request setRequestAllItemFields:YES];
    [request performRequestWithCached:cacheBlock refreshed:refreshBlock];
}

- (void)setCurrentFolder:(BOXFolder *)folder
{
    self.folder = folder;
    [self updateNavigationBarTitle];
}

- (void)switchToEmptyStateWithError:(NSError *)error
{
    // No error means it's just an empty folder.
    NSString *errorMessage = nil;
    if (error == nil) {
        errorMessage = NSLocalizedString(@"This folder is empty.", @"Label: Label displayed when the current folder is empty");
    } else {
        errorMessage = NSLocalizedString(@"Unable to load contents of folder.", @"Message: shown when a folder's contents could not be loaded.");
    }
    self.folderInfoLabel.text = errorMessage;
    self.folderInfoLabel.hidden = NO;
    
    self.searchController.searchBar.hidden = YES;
    
    [self.activityIndicator stopAnimating];
}

- (void)switchToNonEmptyView
{
    if (self.folderInfoLabel.hidden == NO) {
        self.folderInfoLabel.hidden = YES;
    }
    
    if ([self.searchController.searchBar isHidden]) {
        self.searchController.searchBar.hidden = NO;
    }
    
    [self.activityIndicator stopAnimating];
}

- (void)didFailToLoadItemsWithError:(NSError *)error
{
    if (self.tableView.visibleCells.count > 0) {
        dispatch_async(dispatch_get_main_queue(), ^{
            MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
            hud.label.text = NSLocalizedString(@"Unable to load contents of folder.", @"Message: shown when a folder's contents could not be loaded.");
            hud.mode = MBProgressHUDModeCustomView;
            hud.removeFromSuperViewOnHide = YES;
            [hud showAnimated:YES];
            [hud hideAnimated:YES afterDelay:3.0];
        });
    }
}

@end
