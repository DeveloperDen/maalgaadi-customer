#import "NativePaymentView.h"
#import <React/RCTLog.h>

@implementation NativePaymentView

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"PageFinished", @"TransFinished"];
}

RCT_EXPORT_METHOD(navigateToPaymentScreen:(NSString *)params)
{
  RCTLogInfo(@"Params: %@", params);
  [self sendEventWithName:@"PageFinished" body:@{@"Params Recieved: ": params}];
}

@end
