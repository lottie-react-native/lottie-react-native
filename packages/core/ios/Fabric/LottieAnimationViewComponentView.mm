#import "LottieAnimationViewComponentView.h"

#import <react/renderer/components/lottiereactnative/ComponentDescriptors.h>
#import <react/renderer/components/lottiereactnative/EventEmitters.h>
#import <react/renderer/components/lottiereactnative/Props.h>
#import <react/renderer/components/lottiereactnative/RCTComponentViewHelpers.h>

#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTView.h>
#import "LottieContainerView.h"
#import "RNLottieFabricConversions.h"

using namespace facebook::react;

@interface LottieAnimationViewComponentView () <RCTLottieAnimationViewViewProtocol>
@end

@implementation LottieAnimationViewComponentView {
    LottieContainerView *_view;
    BOOL _needsSourceUpdate;
    BOOL _needsTextFiltersUpdate;
    BOOL _needsRenderModeUpdate;
}

+(void) load {
    [super load];
}

- (instancetype) initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const LottieAnimationViewProps>();
        _props = defaultProps;

        _view = [LottieContainerView new];
        _view.delegate = self;

        self.contentView = _view;
    }

    return self;
}

#pragma mark - RCTComponentViewProtocol

// A recycled view keeps the previous owner's props and container, so a mount with the same
// source would skip the load (and never fire onAnimationLoaded), and an in-flight load from the
// previous owner could land on the new one.
+ (BOOL)shouldBeRecycled
{
    return NO;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LottieAnimationViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps {
    const auto &oldLottieProps = *std::static_pointer_cast<const LottieAnimationViewProps>(_props);
    const auto &newLottieProps = *std::static_pointer_cast<const LottieAnimationViewProps>(props);

    if(oldLottieProps.resizeMode != newLottieProps.resizeMode) {
        [_view setResizeMode:RCTNSStringFromString(newLottieProps.resizeMode)];
    }

    if(oldLottieProps.progress != newLottieProps.progress) {
        [_view setProgress:newLottieProps.progress];
    }

    if(oldLottieProps.loop != newLottieProps.loop) {
        [_view setLoop:newLottieProps.loop];
    }

    if(oldLottieProps.speed != newLottieProps.speed) {
        [_view setSpeed:newLottieProps.speed];
    }

    // Sources, text filters and render mode are applied in finalizeUpdates. A source can load
    // synchronously (JSON, sourceName, a cached .lottie), and on mount updateProps runs before
    // updateEventEmitter, so onAnimationLoaded / onAnimationFailure fired from here were dropped.
    if(oldLottieProps.sourceJson != newLottieProps.sourceJson ||
       oldLottieProps.sourceDotLottieURI != newLottieProps.sourceDotLottieURI ||
       oldLottieProps.sourceName != newLottieProps.sourceName ||
       oldLottieProps.sourceURL != newLottieProps.sourceURL) {
        _needsSourceUpdate = YES;
    }

    if(oldLottieProps.colorFilters != newLottieProps.colorFilters) {
        [_view setColorFilters:convertColorFilters(newLottieProps.colorFilters)];
    }

    if(oldLottieProps.textFiltersIOS != newLottieProps.textFiltersIOS) {
        _needsTextFiltersUpdate = YES;
    }

    if(oldLottieProps.renderMode != newLottieProps.renderMode) {
        _needsRenderModeUpdate = YES;
    }

    if(oldLottieProps.autoPlay != newLottieProps.autoPlay) {
        [_view setAutoPlay:newLottieProps.autoPlay];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
    [super finalizeUpdates:updateMask];

    const auto &lottieProps = *std::static_pointer_cast<const LottieAnimationViewProps>(_props);

    // Render mode first, so the source loads with the requested engine.
    if (_needsRenderModeUpdate) {
        _needsRenderModeUpdate = NO;
        [_view setRenderMode:RCTNSStringFromString(lottieProps.renderMode)];
    }

    // Only one source is set at a time; the setters ignore an empty value.
    if (_needsSourceUpdate) {
        _needsSourceUpdate = NO;
        [_view setSourceJson:RCTNSStringFromString(lottieProps.sourceJson.c_str())];
        [_view setSourceDotLottieURI:RCTNSStringFromString(lottieProps.sourceDotLottieURI)];
        [_view setSourceName:RCTNSStringFromString(lottieProps.sourceName)];
        [_view setSourceURL:RCTNSStringFromString(lottieProps.sourceURL)];
    }

    // Text filters rebuild the view from the loaded animation, so they follow the source.
    if (_needsTextFiltersUpdate) {
        _needsTextFiltersUpdate = NO;
        [_view setTextFiltersIOS:convertTextFilters(lottieProps.textFiltersIOS)];
    }
}

#pragma mark - Native Commands

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTLottieAnimationViewHandleCommand(self, commandName, args);
}

- (void) play:(NSInteger)startFrame endFrame:(NSInteger)endFrame
{
    if (startFrame != -1 && endFrame != -1) {
        [_view playFromFrame:@(startFrame) toFrame:endFrame];
    } else {
        [_view play];
    }
}

- (void) reset
{
    [_view reset];
}

- (void) pause
{
    [_view pause];
}

- (void) resume
{
    [_view resume];
}

- (void)onAnimationFinishWithIsCancelled:(bool)isCancelled
{
    if(!_eventEmitter) {
        return;
    }

    LottieAnimationViewEventEmitter::OnAnimationFinish event = {
        .isCancelled = isCancelled
    };

    std::dynamic_pointer_cast<const LottieAnimationViewEventEmitter>(_eventEmitter)->onAnimationFinish(event);
}

- (void)onAnimationFailureWithError:(NSString*)error
{
    if(!_eventEmitter) {
        return;
    }

    LottieAnimationViewEventEmitter::OnAnimationFailure event = {
        .error = std::string([error UTF8String])
    };

    std::dynamic_pointer_cast<const LottieAnimationViewEventEmitter>(_eventEmitter)->onAnimationFailure(event);
}

- (void)onAnimationLoaded
{
    if(!_eventEmitter) {
        return;
    }

    LottieAnimationViewEventEmitter::OnAnimationLoaded event = {};

    std::dynamic_pointer_cast<const LottieAnimationViewEventEmitter>(_eventEmitter)->onAnimationLoaded(event);
}

@end

Class<RCTComponentViewProtocol> LottieAnimationViewCls(void)
{
    return LottieAnimationViewComponentView.class;
}
