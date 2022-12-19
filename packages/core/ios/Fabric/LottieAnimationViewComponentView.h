#ifdef __cplusplus
#import <React/RCTViewComponentView.h>
#import <react/renderer/components/lottiereactnative/Props.h>

NS_ASSUME_NONNULL_BEGIN

@interface LottieAnimationViewComponentView : RCTViewComponentView
@end

namespace facebook {
namespace react {
// In order to compare these structs we need to add the == operator for each
bool operator==(const LottieAnimationViewColorFiltersStruct& a, const LottieAnimationViewColorFiltersStruct& b)
{
    return b.keypath == a.keypath && b.color == a.color;
}
bool operator==(const LottieAnimationViewTextFiltersIOSStruct& a, const LottieAnimationViewTextFiltersIOSStruct& b)
{
    return b.keypath == a.keypath && b.text == a.text;
}
}
}

NS_ASSUME_NONNULL_END

#endif
