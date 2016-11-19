//
//  LottieAnimationViewManager.m
//  LottieReactNative
//
//  Created by Leland Richardson on 12/12/16.
//  Copyright © 2016 Airbnb. All rights reserved.
//

#import "LottieAnimationViewManager.h"

#import "LottieContainerView.h"
#import "RCTBridge.h"
#import "RCTUIManager.h"
#import <Lottie/Lottie.h>

@implementation LottieAnimationViewManager

RCT_EXPORT_MODULE(LottieAnimationView)

- (UIView *)view
{
  return [LottieContainerView new];
}

- (NSDictionary *)constantsToExport
{
  return @{
    @"VERSION": @1,
  };
}

RCT_EXPORT_VIEW_PROPERTY(sourceJson, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(sourceName, NSString);
RCT_EXPORT_VIEW_PROPERTY(progress, CGFloat);
RCT_EXPORT_VIEW_PROPERTY(loop, BOOL);
RCT_EXPORT_VIEW_PROPERTY(speed, CGFloat);

RCT_EXPORT_METHOD(play:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[LottieContainerView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting LottieContainerView, got: %@", view);
    } else {
      LottieContainerView *lottieView = (LottieContainerView *)view;
      [lottieView play];
    }
  }];
}

RCT_EXPORT_METHOD(reset:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[LottieContainerView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting LottieContainerView, got: %@", view);
    } else {
      LottieContainerView *lottieView = (LottieContainerView *)view;
      [lottieView reset];
    }
  }];
}

@end
