//
//  LRNContainerView.m
//  LottieReactNative
//
//  Created by Leland Richardson on 12/12/16.
//  Copyright © 2016 Airbnb. All rights reserved.
//

#import "LRNContainerView.h"

// import UIView+React.h
#if __has_include(<React/UIView+React.h>)
#import <React/UIView+React.h>
#elif __has_include("UIView+React.h")
#import "UIView+React.h"
#else
#import "React/UIView+React.h"
#endif

@implementation LRNContainerView {
    LOTAnimationView *_animationView;
    NSMutableArray *_colorFilters;
    NSMutableArray *_colors;
}

- (void)reactSetFrame:(CGRect)frame
{
    [super reactSetFrame:frame];
    if (_animationView != nil) {
        [_animationView reactSetFrame:frame];
    }
}

- (void)setProgress:(CGFloat)progress {
    _progress = progress;
    if (_animationView != nil) {
        _animationView.animationProgress = _progress;
    }
}

- (void)setSpeed:(CGFloat)speed {
    _speed = speed;
    if (_animationView != nil) {
        _animationView.animationSpeed = _speed;
    }
}

- (void)setLoop:(BOOL)loop {
    _loop = loop;
    if (_animationView != nil) {
        _animationView.loopAnimation = _loop;
    }
}

- (void)setResizeMode:(NSString *)resizeMode {
    if ([resizeMode isEqualToString:@"cover"]) {
        [_animationView setContentMode:UIViewContentModeScaleAspectFill];
    } else if ([resizeMode isEqualToString:@"contain"]) {
        [_animationView setContentMode:UIViewContentModeScaleAspectFit];
    } else if ([resizeMode isEqualToString:@"center"]) {
        [_animationView setContentMode:UIViewContentModeCenter];
    }
}

- (void)setSourceJson:(NSString *)jsonString {
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:jsonData
                                                         options:kNilOptions
                                                           error:nil];
    [self replaceAnimationView:[LOTAnimationView animationFromJSON:json]];
}

- (void)setSourceName:(NSString *)name {
    [self replaceAnimationView:[LOTAnimationView animationNamed:name]];
}

- (void)setColorFiltersToLayers:(NSArray *)colorLayers {
    _colorFiltersToLayers = colorLayers;
}

- (UIColor *)colorFromHexString:(NSString *)hexString {
    NSString *cleanString = [hexString stringByReplacingOccurrencesOfString:@"#" withString:@""];
    if([cleanString length] == 3) {
        cleanString = [NSString stringWithFormat:@"%@%@%@%@%@%@",
                       [cleanString substringWithRange:NSMakeRange(0, 1)],[cleanString substringWithRange:NSMakeRange(0, 1)],
                       [cleanString substringWithRange:NSMakeRange(1, 1)],[cleanString substringWithRange:NSMakeRange(1, 1)],
                       [cleanString substringWithRange:NSMakeRange(2, 1)],[cleanString substringWithRange:NSMakeRange(2, 1)]];
    }
    if([cleanString length] == 6) {
        cleanString = [cleanString stringByAppendingString:@"ff"];
    }
    
    unsigned int baseValue;
    [[NSScanner scannerWithString:cleanString] scanHexInt:&baseValue];
    
    float red   = ((baseValue >> 24) & 0xFF)/255.0f;
    float green = ((baseValue >> 16) & 0xFF)/255.0f;
    float blue  = ((baseValue >> 8)  & 0xFF)/255.0f;
    float alpha = ((baseValue >> 0)  & 0xFF)/255.0f;
    
    return [UIColor colorWithRed:red green:green blue:blue alpha:alpha];
}

- (void)play {
    if (_animationView != nil) {
        [_animationView play];
    }
}

- (void)play:(nullable LOTAnimationCompletionBlock)completion {
    if (_animationView != nil) {
        if (completion != nil) {
            [_animationView playWithCompletion:completion];
        } else {
            [_animationView play];
        }
    }
}

- (void)playFromFrame:(NSNumber *)startFrame
              toFrame:(NSNumber *)endFrame
       withCompletion:(nullable LOTAnimationCompletionBlock)completion {
    if (_animationView != nil) {
        [_animationView playFromFrame:startFrame
                              toFrame:endFrame withCompletion:completion];
    }
}

- (void)reset {
    if (_animationView != nil) {
        _animationView.animationProgress = 0;
        [_animationView pause];
    }
}

# pragma mark Private

- (void)replaceAnimationView:(LOTAnimationView *)next {
    UIViewContentMode contentMode = UIViewContentModeScaleAspectFit;
    if (_animationView != nil) {
        contentMode = _animationView.contentMode;
        [_animationView removeFromSuperview];
    }
    _animationView = next;
    [self addSubview: next];
    [_animationView reactSetFrame:self.frame];
    [_animationView setContentMode:contentMode];
    [self applyProperties];
}

- (void)applyProperties {
    _animationView.animationProgress = _progress;
    _animationView.animationSpeed = _speed;
    _animationView.loopAnimation = _loop;
    
    if (_colorFiltersToLayers && [_colorFiltersToLayers count]) {
        
        NSMutableArray *colorCallbacks = [@[] mutableCopy];
        NSMutableArray *colorObjs = [@[] mutableCopy];
        
        for (int i = 0; i < [_colorFiltersToLayers count]; i++) {
            NSDictionary *colorFilter = _colorFiltersToLayers[i];
            NSString *color = [colorFilter valueForKey:@"color"];
            NSString *layer = [colorFilter valueForKey:@"layer"];
            
            UIColor *colorObj = [self colorFromHexString:color];
            [colorObjs addObject:colorObj];
            
            LOTKeypath *keyPath = [LOTKeypath keypathWithString:[layer stringByAppendingString:@".Color"]];
            LOTColorValueCallback *colorValue = [LOTColorValueCallback withCGColor:colorObj.CGColor];
            [colorCallbacks addObject:colorValue];
            [_animationView setValueDelegate:colorValue
                                  forKeypath:keyPath];
        }
        _colorFilters = colorCallbacks;
        _colors = colorObjs;
    }
}

@end
