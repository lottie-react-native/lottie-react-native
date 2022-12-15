#import <React/RCTConversions.h>

static NSString *cStrToNSString(std::string str)
{
    return [NSString stringWithCString:str.c_str() encoding:[NSString defaultCStringEncoding]];
}

static NSMutableArray<NSString *> *createArrayFromStrings(std::vector<std::string> stringArray)
{
  if (stringArray.empty()) {
    return nil;
  }
  NSMutableArray<NSString *> *array = [NSMutableArray new];
  for (auto str : stringArray) {
      NSString *convertedStr = cStrToNSString(str);
      [array addObject:convertedStr];
  }
  return array;
}

//static NSArray<NSDictionary *> *createColorFilters(std::vector<std::string> colorFiltersArray)
//{
//    NSMutableArray *filters = [NSMutableArray arrayWithCapacity:[rawFilters count]];
//
//    for (auto str : stringArray) {
//        NSString *keypath = cStrToNSString(str);
//
//
//    }
//
//    [rawFilters enumerateObjectsUsingBlock:^(NSDictionary *rawFilter, NSUInteger idx, BOOL *stop) {
//      NSString *keypath = rawFilter[@"keypath"];
//      #if TARGET_OS_OSX
//        NSColor *color = [RCTConvert NSColor:rawFilter[@"color"]];
//      #else
//        UIColor *color = [RCTConvert UIColor:rawFilter[@"color"]];
//      #endif
//        [filters addObject:@{
//          @"color": color,
//          @"keypath": keypath,
//        }];
//    }];
//    return filters;
//}
