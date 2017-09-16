//
//  BOXItemsViewControllerTableViewController.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/2/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import <UIKit/UIKit.h>

@import BoxContentSDK;

@protocol BOXItemsViewControllerDelegate;

@interface BOXItemsViewController : UITableViewController

@property (nonatomic, readwrite, weak) id<BOXItemsViewControllerDelegate> delegate;

@property (nonatomic, readonly, strong) BOXContentClient *contentClient;

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient;

/**
 *  Retrieve all items within the current folder
 *
 *  @param completion Block to be executed after items are fetched, passing an array of the items and an
 *  error object if applicable. If the BOXContentCacheClientProtocol is implemented, the completion block
 *  will be executed twice, first passing results from the cache and then from Box; use the boolean fromCache
 *  to differentiate between the two scenarios if necessary.
 */
- (void)fetchItemsWithCompletion:(void (^)(NSArray *items, BOOL fromCache, NSError *error))completion;

- (BOXItem *)itemForRowAtIndexPath:(NSIndexPath *)indexPath;

/**
 * Refresh the items shown.
 */
- (void)refresh;

@end

@protocol BOXItemsViewControllerDelegate <NSObject>

@optional

/**
 *  By default, all items will be shown. Implement this to hide certain items.
 *  For example, if you only want to show folders, than return false for any item where
 *  item.isFolder is false.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param item The item to show or not show.
 *
 *  @return YES to show the item, NO to exclude it.
 */
- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController shouldShowItem:(BOXItem *)item;

/**
 *  By default, all items will be enabled to be selected by the user.
 *  Implement to disable some items from being shown.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param item The item to enable or disable.
 *
 *  @return YES to allow the item to be selected. NO otherwise.
 */
- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController shouldEnableItem:(BOXItem *)item;

/**
 *  Override this method to enable or disable item sorting. This method sorts BOX folder item results for display.
 *  By default, items will be sorted.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *
 *  @return YES to enable sorting (enabled by default). The default sort applied is:
 *  1) Folders listed before files and weblinks
 *  2) By modified date descending
 *  3) Alpha-numeric ascending.
 *  You can also implement itemsViewController:compareForSortingItem:toItem: for custom sorting.
 *
 *  @return NO to disable sorting.
 */
- (BOOL)itemsViewControllerShouldSortItems:(BOXItemsViewController *)itemsViewController;

/**
 *  Implement this if you want to customize the sort order of items. By default items will be sorted with the following ordered rules:
 *  - Folders come before files and weblinks.
 *  - Most recently modified items come first.
 *  - Alphabetical.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param itemA Item to compare.
 *  @param itemB Item to compare.
 *
 *  @return Return NSOrderedAscending to have itemA displayed before itemB. Return NSOrderedDescending to have itemB displayed before itemA.
 */
- (NSComparisonResult)itemsViewController:(BOXItemsViewController *)itemsViewController compareForSortingItem:(BOXItem *)itemA toItem:(BOXItem *)itemB;

/**
 *  The user tapped on a Folder from the list.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param folder The folder the user selected.
 *  @param items The list of items that the tap occured from. The array will include the tapped item itself.
 */
- (void)itemsViewController:(BOXItemsViewController *)itemsViewController didTapFolder:(BOXFolder *)folder inItems:(NSArray *)items;

/**
 *  The user tapped on a File from the list.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param file The file the user selected.
 *  @param items The list of items that the tap occured from. The array will include the tapped item itself.
 */
- (void)itemsViewController:(BOXItemsViewController *)itemsViewController didTapFile:(BOXFile *)file inItems:(NSArray *)items;

/**
 *  The user tapped on a Bookmark from the list.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param bookmark The bookmark the user selected.
 *  @param items The list of items that the tap occured from. The array will include the tapped item itself.
 */
- (void)itemsViewController:(BOXItemsViewController *)itemsViewController didTapBookmark:(BOXBookmark *)bookmark inItems:(NSArray *)items;

/**
 *
 *  Close button was tapped. If not implemented, the navigation controller will be dismissed.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 */
- (void)itemsViewControllerDidTapCloseButtton:(BOXItemsViewController *)itemsViewController;

/**
 *  Implement to control whether the user should be navigated to a folder.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @param folder The folder that the user would be navigated to.
 *
 *  @return YES to allow the navigation to proceed, false otherwise.
 */
- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController willNavigateToFolder:(BOXFolder *)folder;

/**
 *
 *  Whether or not to show a 'Close' button in the navigation bar. By default, the button will be shown and
 *  will dismiss the host UINavigationController when tapped.
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *
 *  @return YES to show the button, NO otherwise.
 */
- (BOOL)itemsViewControllerShouldShowCloseButton:(BOXItemsViewController *)itemsViewController;

/**
 *  A custom title for the Close button used to dismiss the view controller
 *  By default, the title is "Close".
 *
 *  @param itemsViewController The instance of BOXItemsViewController calling this method.
 *  @return The string to be displayed for the button.
 */
- (NSString *)itemsViewControllerCloseButtonTitle:(BOXItemsViewController *)itemsViewController;

@end
