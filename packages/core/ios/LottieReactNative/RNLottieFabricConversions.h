#ifdef __cplusplus
#import <React/RCTConversions.h>

inline NSArray<NSDictionary *> *convertColorFilters(std::vector<facebook::react::LottieAnimationViewColorFiltersStruct> colorFilterStructArr)
{
    NSMutableArray *filters = [NSMutableArray arrayWithCapacity:colorFilterStructArr.size()];

    for (auto colorFilter : colorFilterStructArr) {
        [filters addObject:@{
          @"color": RCTUIColorFromSharedColor(colorFilter.color),
          @"keypath": RCTNSStringFromString(colorFilter.keypath),
        }];
    }
    return filters;
}
#endif
