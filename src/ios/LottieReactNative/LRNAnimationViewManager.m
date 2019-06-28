//
//  LRNAnimationViewManager.m
//  LottieReactNative
//
//  Created by Leland Richardson on 12/12/16.
//  Copyright © 2016 Airbnb. All rights reserved.
//

#import "LRNAnimationViewManager.h"

#import "LRNContainerView.h"

// import RCTBridge.h
#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTBridge.h"
#else
#import "React/RCTBridge.h"
#endif

// import RCTUIManager.h
#if __has_include(<React/RCTUIManager.h>)
#import <React/RCTUIManager.h>
#elif __has_include("RCTUIManager.h")
#import "RCTUIManager.h"
#else
#import "React/RCTUIManager.h"
#endif

#import <Lottie/Lottie.h>

@implementation LRNAnimationViewManager

RCT_EXPORT_MODULE(LottieAnimationView)

- (UIView *)view
{
    return [LRNContainerView new];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSDictionary *)constantsToExport
{
    return @{
             @"VERSION": @1,
             };
}

RCT_EXPORT_VIEW_PROPERTY(resizeMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(sourceJson, NSString);
RCT_EXPORT_VIEW_PROPERTY(sourceName, NSString);
RCT_EXPORT_VIEW_PROPERTY(colorFiltersToLayers, NSArray);
RCT_EXPORT_VIEW_PROPERTY(progress, CGFloat);
RCT_EXPORT_VIEW_PROPERTY(loop, BOOL);
RCT_EXPORT_VIEW_PROPERTY(speed, CGFloat);
RCT_EXPORT_VIEW_PROPERTY(onAnimationFinish, RCTBubblingEventBlock);

RCT_EXPORT_METHOD(play:(nonnull NSNumber *)reactTag
                  fromFrame:(nonnull NSNumber *) startFrame
                  toFrame:(nonnull NSNumber *) endFrame)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        id view = viewRegistry[reactTag];
        if (![view isKindOfClass:[LRNContainerView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting LottieContainerView, got: %@", view);
        } else {
            LRNContainerView *lottieView = (LRNContainerView *)view;
            LOTAnimationCompletionBlock callback = ^(BOOL animationFinished){
                if (lottieView.onAnimationFinish) {
                    lottieView.onAnimationFinish(@{@"isCancelled": animationFinished ? @NO : @YES});
                }
            };
            if ([startFrame intValue] != -1 && [endFrame intValue] != -1) {
                [lottieView playFromFrame:startFrame toFrame:endFrame withCompletion:callback];
            } else {
                [lottieView play:callback];
            }
        }
    }];
}

RCT_EXPORT_METHOD(reset:(nonnull NSNumber *)reactTag)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        id view = viewRegistry[reactTag];
        if (![view isKindOfClass:[LRNContainerView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting LottieContainerView, got: %@", view);
        } else {
            LRNContainerView *lottieView = (LRNContainerView *)view;
            [lottieView reset];
        }
    }];
}

@end
