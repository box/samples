//
//  BOXBrowseTableViewController.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/25/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "BOXItemsViewController.h"

@protocol BOXFolderViewControllerDelegate;

@interface BOXFolderViewController : BOXItemsViewController

@property (nonatomic, readonly, strong) NSString *folderID;

+ (NSArray *)navigationStackViewControllersWithContentClient:(BOXContentClient *)contentClient
                                              startingFolder:(BOXFolder *)folder;

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                             folderID:(NSString *)folderID;

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                           folderMini:(BOXFolderMini *)folderMini;

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                               folder:(BOXFolder *)folder;

@end

@protocol BOXFolderViewControllerDelegate <BOXItemsViewControllerDelegate>

@optional

/**
 *  If the choose button is shown (see 'shouldShowChooseFolderButton'), this will be called when the user has tapped the button to
 *  select the folder currently displayed.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @param folder The Folder that the user was viewing when the Choose button was tapped.
 */
- (void)folderViewController:(BOXFolderViewController *)folderViewController didChooseFolder:(BOXFolder *)folder;

/**
 *  A folder was created.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @param folder The created folder.
 */
- (void)folderViewController:(BOXFolderViewController *)folderViewController didCreateNewFolder:(BOXFolder *)folder;

/**
 *  A Box item was deleted.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @param item The deleted item.
 */
- (void)folderViewController:(BOXFolderViewController *)folderViewController didDeleteItem:(BOXItem *)item;

/**
 *  Whether to expose a 'Delete' button for an item by swiping the cell. By default this is not exposed. Note that depending on permissions
 *  the 'Delete' action may not be exposed even if YES is returned.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @param item The deleted item to show/hide the delete button for.
 *  @return YES to show the 'Delete' actiion, NO otherwise.
 */
- (BOOL)folderViewController:(BOXFolderViewController *)folderViewController shouldShowDeleteButtonForItem:(BOXItem *)item;

/**
 *  Whether to show a search bar to allow the user to search for content within the folder.
 *  By default, a search bar is shown.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @return YES to show a search bar, NO otherwise.
 */
- (BOOL)folderViewControllerShouldShowSearchBar:(BOXFolderViewController *)folderViewController;

/**
 *  Whether to show a button to 'Choose' the folder being displayed. This might be appropriate in
 *  scenarios where you are asking the user to select a folder (e.g. a folder to upload to).
 *  By default, this button is not displayed.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @return YES to show a the button, NO otherwise.
 */
- (BOOL)folderViewControllerShouldShowChooseFolderButton:(BOXFolderViewController *)folderViewController;

/**
 *  Whether to show a button to allow the user to create a new folder within the folder displayed.
 *  By default, this button is not displayed.
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @return YES to show a the button, NO otherwise.
 */
- (BOOL)folderViewControllerShouldShowCreateFolderButton:(BOXFolderViewController *)folderViewController;

/**
 *  A custom title for the Choose Folder button if the button is displayed.
 *  By default, the title is "Choose".
 *
 *  @param folderViewController The instance of BOXFolderViewController calling this method.
 *  @return The string to be displayed for the button.
 */
- (NSString *)folderViewControllerChooseFolderButtonTitle:(BOXFolderViewController *)folderViewController;

@end
