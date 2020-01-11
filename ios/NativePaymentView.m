#import "NativePaymentView.h"
#import <React/RCTLog.h>

@implementation NativePaymentView

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"PageFinished", @"TransFinished"];
}

RCT_EXPORT_METHOD(navigateToPaymentScreen:(NSString *)name)
{
  RCTLogInfo(@"Params: %@", name);
  [self sendEventWithName:@"PageFinished" body:@{@"url": @"Some URL"}];
}

@end
