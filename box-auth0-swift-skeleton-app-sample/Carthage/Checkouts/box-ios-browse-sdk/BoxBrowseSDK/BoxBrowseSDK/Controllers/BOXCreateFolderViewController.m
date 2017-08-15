//
//  BOXCreateFolderViewController.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 4/1/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import "BOXCreateFolderViewController.h"
#import "UIImage+BOXBrowseSDKAdditions.h"
#import "BOXBrowseSDKConstants.h"

#define kTitleViewHeight  60.0
#define kTextFieldOffsetX 64.0
#define kTextFieldOffsetY 17.0

@interface BOXCreateFolderViewController ()

@property (nonatomic, readonly, strong) BOXContentClient *contentClient;
@property (nonatomic, readonly, strong) NSString *parentFolderID;
@property (nonatomic, readonly, strong) BOXFolderBlock completion;

@property (nonatomic, readwrite, strong) UIView *textFieldContainer;
@property (nonatomic, readwrite, strong) UITextField *textField;
@property (nonatomic, readwrite, strong) UIView *horizontalSeparator;
@property (nonatomic, readwrite, strong) UILabel *helpLabel;
@property (nonatomic, readwrite, assign) BOOL wasToolbarHiddenOnLoad;
@property (nonatomic, readwrite, assign) BOOL wasNavigationBarTranslucentOnLoad;

@end

@implementation BOXCreateFolderViewController

- (instancetype)initWithContentClient:(BOXContentClient *)contentClient
                       parentFolderID:(NSString *)parentFolderID
                           completion:(BOXFolderBlock)completion
{
    if (self = [super init]) {
        _contentClient = contentClient;
        _parentFolderID = parentFolderID;
        _completion = completion;
    }
    
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor colorWithWhite:245/255.0 alpha:1];
    self.wasToolbarHiddenOnLoad = self.navigationController.toolbarHidden;
    self.navigationController.toolbarHidden = YES;
    
    self.title = NSLocalizedString(@"New Folder", @"Title: Title for the creation and naming of a new folder");
    
    UIBarButtonItem *saveButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"Save", @"Title: Save action, often used on buttons") style:UIBarButtonItemStyleDone target:self action:@selector(saveButtonAction:)];
    self.navigationItem.rightBarButtonItem = saveButtonItem;
    self.navigationItem.rightBarButtonItem.enabled = NO;
    
    self.textFieldContainer = [[UIView alloc] initWithFrame:CGRectMake(0.0, 0.0, self.view.bounds.size.width, kTitleViewHeight)];
    self.textFieldContainer.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    self.textFieldContainer.backgroundColor = [UIColor whiteColor];
    
    self.horizontalSeparator = [[UIView alloc] initWithFrame:CGRectMake(0.0, self.textFieldContainer.frame.size.height - 1, self.textFieldContainer.frame.size.width, 1)];
    self.horizontalSeparator.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleBottomMargin;
    self.horizontalSeparator.backgroundColor = [UIColor colorWithWhite:240/255.0 alpha:1];
    
    self.helpLabel = [[UILabel alloc] init];
    self.helpLabel.backgroundColor = [UIColor clearColor];
    self.helpLabel.textColor = [UIColor colorWithWhite:180/255.0 alpha:1];
    self.helpLabel.shadowColor = [UIColor colorWithWhite:1 alpha:1];
    self.helpLabel.shadowOffset = CGSizeMake(0, 1);
    self.helpLabel.font = [UIFont systemFontOfSize:14];
    self.helpLabel.text = NSLocalizedString(@"Please name your new folder.", @"Helping text displayed when creating a new folder");
    self.helpLabel.numberOfLines = 0;
    CGSize labelSize = [self.helpLabel sizeThatFits:CGSizeMake(self.view.bounds.size.width, 200)];
    self.helpLabel.frame = CGRectMake(0, kTitleViewHeight + 3, self.view.bounds.size.width, labelSize.height);
    self.helpLabel.textAlignment = NSTextAlignmentCenter;
    self.helpLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    [self.view addSubview:self.helpLabel];
    
    self.textField = [[UITextField alloc] initWithFrame:CGRectMake(kTextFieldOffsetX, kTextFieldOffsetY, self.textFieldContainer.frame.size.width - kTextFieldOffsetX, self.textFieldContainer.frame.size.height - 2 * kTextFieldOffsetY - 2)];
    self.textField.delegate = self;
    self.textField.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleBottomMargin;
    self.textField.font = [UIFont boldSystemFontOfSize:20];
    self.textField.minimumFontSize = 13;
    self.textField.adjustsFontSizeToFitWidth = YES;
    self.textField.textColor = [UIColor colorWithWhite:40/255.0 alpha:1];
    self.textField.backgroundColor = [UIColor clearColor];
    self.textField.autocorrectionType = UITextAutocorrectionTypeDefault;
    self.textField.autocapitalizationType = UITextAutocapitalizationTypeWords;
    self.textField.clearButtonMode = UITextFieldViewModeWhileEditing;
    self.textField.returnKeyType = UIReturnKeyDone;
    
    NSString *placeholder = NSLocalizedString(@"Folder Name", @"placeholder :  the title of the folder about to be created");
    NSAttributedString *attributedPlaceholder = [[NSAttributedString alloc] initWithString:placeholder attributes:@{NSForegroundColorAttributeName:[UIColor colorWithWhite:200/255.0 alpha:1]}];
    self.textField.attributedPlaceholder = attributedPlaceholder;
    
    [self.textFieldContainer addSubview:self.textField];

    UIImageView *icon = [[UIImageView alloc] initWithFrame:CGRectMake(9.0, 9.0, 40, 40)];
    icon.image = [UIImage box_genericFolderIcon];
    icon.contentMode = UIViewContentModeCenter;
    [self.textFieldContainer addSubview:icon];
    
    [self.view addSubview:self.textFieldContainer];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];

    self.wasNavigationBarTranslucentOnLoad = self.navigationController.navigationBar.translucent;
    self.navigationController.navigationBar.translucent = NO;
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    [self.textField becomeFirstResponder];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    self.navigationController.toolbarHidden = self.wasToolbarHiddenOnLoad;
    self.navigationController.navigationBar.translucent = self.wasNavigationBarTranslucentOnLoad;
}

- (void)saveButtonAction:(id)sender
{
    [self save];
}

#pragma mark - UITextFieldDelegate

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string
{
    NSString *newString = [textField.text stringByReplacingCharactersInRange:range withString:string];
    self.navigationItem.rightBarButtonItem.enabled = newString.length > 0;
    return YES;
}

- (BOOL)textFieldShouldClear:(UITextField *)textField
{
    self.navigationItem.rightBarButtonItem.enabled = NO;
    return YES;
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [self save];
    return YES;
}

#pragma mark - Private

- (void)save
{
    if ([self.textField isEditing]) {
        // We want to resign first responder to pick up any autocorrect changes, however
        // we don't want to mess up the user's cursor position in case there was an error
        // in the rename and they want to conveniently adjust the name further.
        // So, we resign first responder thentextFieldrestore it and maintain the cursor position.
        UITextRange *currentRange = self.textField.selectedTextRange;
        [self.textField resignFirstResponder];
        [self.textField becomeFirstResponder];
        [self.textField setSelectedTextRange:currentRange];
    }
    
    NSCharacterSet *whitespaceCharacterSet = [NSCharacterSet whitespaceAndNewlineCharacterSet];
    NSString *folderName = [self.textField.text stringByTrimmingCharactersInSet:whitespaceCharacterSet];
    BOXFolderCreateRequest *folderCreateRequest = [self.contentClient folderCreateRequestWithName:folderName parentFolderID:self.parentFolderID];
    folderCreateRequest.SDKIdentifier = BOX_BROWSE_SDK_IDENTIFIER;
    folderCreateRequest.SDKVersion = BOX_BROWSE_SDK_VERSION;
    
    UIActivityIndicatorView *spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    spinner.center = self.view.center;
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    [spinner startAnimating];
    
    [folderCreateRequest performRequestWithCompletion:^(BOXFolder *folder, NSError *error) {
        [spinner stopAnimating];
        if (error) {
            [self didFailToCreateFolderWithError:error];
        } else {
            [self.navigationController popViewControllerAnimated:YES];
            if (self.completion) {
                self.completion(folder, error);
            }
        }
    }];
}

- (void)didFailToCreateFolderWithError:(NSError *)error
{
    NSString *title = NSLocalizedString(@"Unable to Create Folder", @"Title: Title used when an error occurs while attempting to create a new folder.");
    NSString *message = NSLocalizedString(@"Unable to create folder. Please try again.", @"Alert View Description : The renaming failed.");
    
    if ([error.domain isEqualToString:BOXContentSDKErrorDomain]) {
        if (error.code == BOXContentSDKAPIErrorUnauthorized || error.code == BOXContentSDKAPIErrorForbidden) {
            message = NSLocalizedString(@"You do not have permission to create a folder in this location.",
                                        @"Messsage: message for alert view shown when creating folder failed since user did not have the permission");
        } else if (error.code == BOXContentSDKAPIErrorConflict) {
            message = NSLocalizedString(@"A folder with the same name already exists.",
                                        @"Messsage: message for alert view shown when creating folder failed because a folder with the same name already exists");
        }
    }
    
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title
                                                                             message:message
                                                                      preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *dismissAction = [UIAlertAction actionWithTitle:NSLocalizedString(@"Dismiss", @"Label: Allow the user to dismiss the current view or interface, often used on buttons to dismiss alerts")
                                                       style:UIAlertActionStyleCancel
                                                     handler:^(UIAlertAction *action) {
                                                         [alertController dismissViewControllerAnimated:YES completion:nil];
                                                     }];
    [alertController addAction:dismissAction];
    [self presentViewController:alertController animated:YES completion:nil];
}

@end
