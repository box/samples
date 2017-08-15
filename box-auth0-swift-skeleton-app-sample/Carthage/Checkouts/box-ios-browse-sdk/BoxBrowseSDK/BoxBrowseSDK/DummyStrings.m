//
//  DummyStrings.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/1/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "DummyStrings.h"

@implementation DummyStrings

- (void)nothing
{
    NSLocalizedString(@"Creating folder. One moment please…", @"RenameViewController creating folder");
    NSLocalizedString(@"A folder with the same name already exists.",
                      @"Messsage: message for alert view shown when creating folder failed because a folder with the same name already exists");
    NSLocalizedString(@"Dismiss", @"Label: Allow the user to dismiss the current view or interface, often used on buttons to dismiss alerts");
    NSLocalizedString(@"Are you sure you want to change the file extension from “.%@” to “.%@”?",
                                            @"Rename action requesting confirmation on file extension change");
    NSLocalizedString(@"Use .%@", @"Alert View button : Use new extension, eg:Use .txt");
    NSLocalizedString(@"Keep .%@", @"Alert View button : Keep old extension, eg:Keep .txt");
    NSLocalizedString(@"Warning", @"Title: Warning to alert the user that an issue has occurred");
    
    NSLocalizedString(@"You do not have permission to rename this file.",
                                        @"Messsage: message shown alert view in when renaming file failed since user did not have the permission");
    
    NSLocalizedString(@"Could Not Rename", @"Title: Title used when an error occurs while attempting to rename a file or folder.");
    NSLocalizedString(@"Dismiss", @"Label: Allow the user to dismiss the current view or interface, often used on buttons to dismiss alerts");
    
    NSLocalizedString(@"Empty filename", @"Alert View Title : The file name is empty");
    NSLocalizedString(@"Please enter a valid filename.", @"Alert View Description : The file name is empty");
    
    NSLocalizedString(@"Please name your new folder.", @"Helping text displayed when creating a new folder");
    NSLocalizedString(@"Please rename your folder.", @"Helping text displayed when renaming a folder");
    NSLocalizedString(@"Please rename your file.", @"Helping text displayed when renaming a file");
    
    NSLocalizedString(@"Folder Name", @"placeholder :  the title of the folder about to be created");
    NSLocalizedString(@"File Name", @"placeholder :  the title of the file about to be renamed");
    
    NSLocalizedString(@"Are you sure you want to delete this folder?", @"Confirmation title when deleting an item");
    NSLocalizedString(@"Are you sure you want to delete this file?", @"Confirmation title when deleting an item");
}
@end
