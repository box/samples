//
//  ViewController.m
//  BoxBrowseSDKSampleApp
//
//  Created by Rico Yao on 3/24/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

@import BoxBrowseSDK;

#import "ViewController.h"

@interface ViewController () <BOXFolderViewControllerDelegate>

@property (nonatomic, readwrite, strong) UIButton *button;
@property (nonatomic, readwrite, strong) UINavigationController *navControllerForBrowseSDK;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.view.backgroundColor = [UIColor whiteColor];
    
    self.button = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.button setTitle:@"Start" forState:UIControlStateNormal];
    self.button.titleLabel.font = [UIFont systemFontOfSize:22.0f];
    [self.button addTarget:self action:@selector(showFolderViewController) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.button];
}

- (void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];
    
    self.button.frame = self.view.bounds;
    [self.button sizeToFit];
    self.button.center = self.view.center;
}

- (void)showFolderViewController
{
    // Show a UIViewController that displays the contents of a Box Folder.
    BOXFolderViewController *folderViewController = [[BOXFolderViewController alloc] initWithContentClient:[BOXContentClient defaultClient]];
    folderViewController.delegate = self;
    
    // You must load it in a UINavigationController.
    self.navControllerForBrowseSDK = [[UINavigationController alloc] initWithRootViewController:folderViewController];
    [self presentViewController:self.navControllerForBrowseSDK animated:YES completion:nil];
}

#pragma mark - BOXFolderViewControllerDelegate

////////////////////////////////////////////////////////////////////////////////////////
// These are all optional and will allow you to customize behavior for your app.
////////////////////////////////////////////////////////////////////////////////////////

- (BOOL)itemsViewControllerShouldShowCloseButton:(BOXItemsViewController *)itemsViewController
{
    return NO;
}

- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController shouldShowItem:(BOXItem *)item
{
    return YES;
}

- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController shouldEnableItem:(BOXItem *)item
{
    return YES;
}

- (BOOL)itemsViewController:(BOXItemsViewController *)itemsViewController willNavigateToFolder:(BOXFolder *)folder
{
    return YES;
}

- (void)itemsViewController:(BOXItemsViewController *)itemsViewController didTapFolder:(BOXFolder *)folder inItems:(NSArray *)items
{
    NSLog(@"Did tap folder: %@", folder.name);
}

- (void)itemsViewController:(BOXItemsViewController *)itemsViewController didTapFile:(BOXFile *)file inItems:(NSArray *)items
{
    NSLog(@"Did tap file: %@", file.name);
}

- (void)itemsViewControllerDidTapCloseButtton:(BOXItemsViewController *)itemsViewController
{
    // If you don't implement this, the navigation controller will be dismissed for you.
    // Only implement if you need to customize behavior.
    NSLog(@"Did tap close button");
    [self.navControllerForBrowseSDK dismissViewControllerAnimated:YES completion:nil];
}

// By default the following sort order will be applied:
// - Folders come before files
// - Sort by modification date descending
// - Sort by name ascending
// You can implement your own sort order by implementing this delegate method.
//
//- (NSComparisonResult)itemsViewController:(BOXItemsViewController *)itemsViewController compareForSortingItem:(BOXItem *)itemA toItem:(BOXItem *)itemB
//{
//}

- (BOOL)folderViewControllerShouldShowChooseFolderButton:(BOXFolderViewController *)folderViewController
{
    return YES;
}

- (void)folderViewController:(BOXFolderViewController *)folderViewController didChooseFolder:(BOXFolder *)folder
{
    NSLog(@"Did choose folder: %@", folder.name);
}

- (BOOL)folderViewControllerShouldShowCreateFolderButton:(BOXFolderViewController *)folderViewController
{
    return YES;
}

- (void)folderViewController:(BOXFolderViewController *)folderViewController didCreateNewFolder:(BOXFolder *)folder
{
    NSLog(@"Did create new folder: %@", folder.name);
}

- (BOOL)folderViewController:(BOXFolderViewController *)folderViewController shouldShowDeleteButtonForItem:(BOXItem *)item
{
    return YES;
}

- (void)folderViewController:(BOXFolderViewController *)folderViewController didDeleteItem:(BOXItem *)item
{
    NSLog(@"Did delete item: %@", item.name);
}

- (BOOL)folderViewControllerShouldShowSearchBar:(BOXFolderViewController *)folderViewController
{
    return YES;
}



@end
