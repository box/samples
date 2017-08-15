//
//  BOXItemCell.h
//  BoxBrowseSDK
//
//  Created by Rico Yao on 3/30/15.
//  Copyright (c) 2015 BOX. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <BoxContentSDK/BOXContentSDK.h>

@class BOXItem;

extern CGFloat const BOXItemCellHeight;

@interface BOXItemCell : UITableViewCell

- (id)initWithContentClient:(BOXContentClient *)contentClient
                      style:(UITableViewCellStyle)style
            reuseIdentifier:(NSString *)reuseIdentifier;

@property (nonatomic, readwrite, strong) BOXItem *item;
@property (nonatomic, readwrite, assign) BOOL enabled;

@end
