//
//  BOXItemCell.m
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/30/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

@import BoxContentSDK;
@import Masonry;

#import "BOXItemCell.h"
#import <MobileCoreServices/MobileCoreServices.h>
#import "BOXThumbnailCache.h"
#import "UIImage+BOXBrowseSDKAdditions.h"
#import "BOXItem+BOXBrowseSDKAdditions.h"

long long const BOX_BROWSE_SDK_KILOBYTE = 1024;
long long const BOX_BROWSE_SDK_MEGABYTE = BOX_BROWSE_SDK_KILOBYTE * 1024;
long long const BOX_BROWSE_SDK_GIGABYTE = BOX_BROWSE_SDK_MEGABYTE * 1024;
long long const BOX_BROWSE_SDK_TERABYTE = BOX_BROWSE_SDK_GIGABYTE * 1024;

CGFloat const BOXItemCellHeight = 60.0f;

#define CELL_TITLE_LABEL_HEIGHT 20.0f
#define CELL_SUBTITLE_LABEL_HEIGHT 17.0f

#define CELL_ELEMENT_OFFSET 5.0f

#define kDisabledAlphaValue 0.3f

#define kTextLabelColorEnabled [UIColor colorWithWhite:86.0f/255.0f alpha:1.0]
#define kTextLabelColorDisabled [UIColor colorWithWhite:86.0f/255.0f alpha:0.3]

#define kDetailTextLabelColorEnabled [UIColor colorWithWhite:174.0f/255.0f alpha:1.0]
#define kDetailTextLabelColorDisabled [UIColor colorWithWhite:174.0f/255.0f alpha:0.3]

@interface BOXItemCell ()

@property (nonatomic, readonly, strong) BOXContentClient *contentClient;
@property (nonatomic) BOXFileThumbnailRequest *thumbnailRequest;

@property (nonatomic, readwrite, strong) UIImageView *thumbnailImageView;
@property (nonatomic, readwrite, strong) UILabel *titleLabel;
@property (nonatomic, readwrite, strong) UILabel *descriptionLabel;
@end

@implementation BOXItemCell

- (id)initWithContentClient:(BOXContentClient *)contentClient
                      style:(UITableViewCellStyle)style
            reuseIdentifier:(NSString *)reuseIdentifier
{
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
        _contentClient = contentClient;

        [self addSubview:self.thumbnailImageView];
        [self addSubview:self.titleLabel];
        [self addSubview:self.descriptionLabel];
        
        [self createConstraints];
    }
    
    return self;
}

- (UIImageView *)thumbnailImageView
{
    if (_thumbnailImageView == nil) {
        _thumbnailImageView = [UIImageView new];
        _thumbnailImageView.contentMode = UIViewContentModeCenter;
    }
    return _thumbnailImageView;
}

- (UILabel *)titleLabel
{
    if (_titleLabel == nil) {
        _titleLabel = [UILabel new];
        _titleLabel.font = [UIFont systemFontOfSize:17.0f];
        _titleLabel.textColor = kTextLabelColorEnabled;
        _titleLabel.textAlignment = NSTextAlignmentLeft;
    }
    return _titleLabel;
}

- (UILabel *)descriptionLabel
{
    if (_descriptionLabel == nil) {
        _descriptionLabel = [UILabel new];
        _descriptionLabel.font = [UIFont systemFontOfSize:13.0f];
        _descriptionLabel.textColor = kDetailTextLabelColorEnabled;
        _descriptionLabel.textAlignment = NSTextAlignmentLeft;
    }
    return _descriptionLabel;
}

- (void)createConstraints
{
    [self.thumbnailImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self);
        make.top.equalTo(self).offset(CELL_ELEMENT_OFFSET);
        make.height.equalTo(self).offset(-2.0f * CELL_ELEMENT_OFFSET);
        make.width.equalTo(self.mas_height);
    }];
    
    [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.thumbnailImageView.mas_right).offset(2.0f * CELL_ELEMENT_OFFSET);
        make.right.equalTo(self);
        make.bottom.equalTo(self.mas_centerY);
        make.height.equalTo(@(CELL_TITLE_LABEL_HEIGHT));
    }];
    
    [self.descriptionLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.right.equalTo(self.titleLabel);
        make.top.equalTo(self.mas_centerY);
        make.height.equalTo(@(CELL_SUBTITLE_LABEL_HEIGHT));
    }];
}

- (void)prepareForReuse
{
    [super prepareForReuse];
    
    [self.thumbnailRequest cancel];
    self.thumbnailRequest = nil;
    _item = nil;
}


// Cell separators get inset without this.
- (UIEdgeInsets)layoutMargins
{
    return UIEdgeInsetsZero;
}

- (void)setItem:(BOXItem *)item
{
    _item = item;
    
    // Name
    self.titleLabel.text = item.name;
    
    // Description
    NSString *description = nil;
    if (item.isBookmark) {
        description = ((BOXBookmark *) item).URL.absoluteString;
    } else {
        description = [NSString stringWithFormat:@"%@, %@", [self displaySizeForItem:item], [self displayDateForItem:item]];
    }
    self.descriptionLabel.text = description;
    
    
    __weak BOXItemCell *me = self;
    void (^imageSetBlock)(UIImage *image, UIViewContentMode contentMode) = ^void(UIImage *image, UIViewContentMode contentMode) {
        me.thumbnailImageView.image = image;
        me.thumbnailImageView.contentMode = contentMode;
    };
    
    
    // Icon / thumbnail
    if ([self shouldShowThumbnailForItem:self.item] && item.isFile) {
        __block BOXFile *file = (BOXFile *)item;
        __weak BOXItemCell *me = self;
        BOXThumbnailCache *thumbnailCache = [BOXThumbnailCache sharedInstanceForContentClient:self.contentClient];
        BOXThumbnailSize thumbnailSize = BOXThumbnailSize128;
        
        if ([thumbnailCache hasThumbnailInCacheForFile:file size:thumbnailSize]) {
            self.thumbnailRequest = [thumbnailCache fetchThumbnailForFile:file size:BOXThumbnailSize128 completion:^(UIImage *image, NSError *error) {
                if ([me.item.modelID isEqualToString:file.modelID]) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        imageSetBlock(image, UIViewContentModeScaleAspectFit);
                    });
                }
            }];
        } else {
            imageSetBlock([UIImage box_iconForItem:item], UIViewContentModeCenter);
            
            self.thumbnailRequest = [thumbnailCache fetchThumbnailForFile:file size:BOXThumbnailSize128 completion:^(UIImage *image, NSError *error) {
                if (error == nil) {
                    if ([me.item.modelID isEqualToString:file.modelID]) {
                        imageSetBlock(image, UIViewContentModeScaleAspectFit);
                        CATransition *transition = [CATransition animation];
                        transition.duration = 0.3f;
                        transition.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
                        transition.type = kCATransitionFade;
                        [me.thumbnailImageView.layer addAnimation:transition forKey:nil];
                    }
                }
            }];
        }
    } else {
        imageSetBlock([UIImage box_iconForItem:item], UIViewContentModeCenter);
    }
}

- (void)setEnabled:(BOOL)enabled
{
    if (enabled) {
        self.userInteractionEnabled = YES;
        self.thumbnailImageView.alpha = 1.0f;
        self.titleLabel.textColor = kTextLabelColorEnabled;
        self.descriptionLabel.textColor = kDetailTextLabelColorEnabled;
    } else {
        self.userInteractionEnabled = NO;
        self.thumbnailImageView.alpha = kDisabledAlphaValue;
        self.titleLabel.textColor = kTextLabelColorDisabled;
        self.descriptionLabel.textColor = kDetailTextLabelColorDisabled;
    }
}

- (NSString *)displaySizeForItem:(BOXItem *)item
{
    NSString * result_str = nil;
    long long fileSize = [item.size longLongValue];
    
    if (fileSize >= BOX_BROWSE_SDK_TERABYTE)
    {
        double dSize = fileSize / (double)BOX_BROWSE_SDK_TERABYTE;
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f TB", @"File size in terabytes (example: 1 TB)"), dSize];
    }
    else if (fileSize >= BOX_BROWSE_SDK_GIGABYTE)
    {
        double dSize = fileSize / (double)BOX_BROWSE_SDK_GIGABYTE;
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f GB", @"File size in gigabytes (example: 1 GB)"), dSize];
    }
    else if (fileSize >= BOX_BROWSE_SDK_MEGABYTE)
    {
        double dSize = fileSize / (double)BOX_BROWSE_SDK_MEGABYTE;
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f MB", @"File size in megabytes (example: 1 MB)"), dSize];
    }
    else if (fileSize >= BOX_BROWSE_SDK_KILOBYTE)
    {
        double dSize = fileSize / (double)BOX_BROWSE_SDK_KILOBYTE;
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f KB", @"File size in kilobytes (example: 1 KB)"), dSize];
    }
    else if(fileSize > 0)
    {
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f B", @"File size in bytes (example: 1 B)"), fileSize];
    }
    else
    {
        result_str = [NSString stringWithFormat:NSLocalizedString(@"%1.1f B", @"File size in bytes (example: 1 B)"), 0];
    }
    
    return result_str;
}

- (NSString *)displayDateForItem:(BOXItem *)item
{
    NSString *dateString = [NSDateFormatter localizedStringFromDate:[item effectiveUpdateDate]
                                                          dateStyle:NSDateFormatterShortStyle
                                                          timeStyle:NSDateFormatterShortStyle];
    return dateString;
}

- (NSString *)UTIFromFilePath:(NSString *)filePath
{
    CFStringRef fileExtension = (__bridge CFStringRef) [filePath box_pathExtensionAccountingForZippedPackages];
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension, NULL);
    NSString *strUTI = (__bridge_transfer NSString *)UTI;
    
    if(!strUTI) {
        return @"public.item";
    }
    
    return strUTI;
}

- (BOOL)UTI:(NSString *)UTI ConformsToUTI:(NSString *)anotherUTI
{
    CFStringRef UTIself = (__bridge CFStringRef) UTI;
    CFStringRef UTIother = (__bridge CFStringRef) anotherUTI;
    
    return UTTypeConformsTo(UTIself, UTIother);
}

- (BOOL)shouldShowThumbnailForItem:(BOXItem *)item
{
    if (!item.isFile) {
        return NO;
    } else {
        return ([self UTI:[self UTIFromFilePath:item.name] ConformsToUTI:@"public.image"] ||
                [[item.name pathExtension] caseInsensitiveCompare:@"dcm"] == NSOrderedSame);
    }
}

@end
