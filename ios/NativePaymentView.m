#import "NativePaymentView.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import "AppDelegate.h"

@implementation NativePaymentView

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"PageFinished", @"TransFinished"];
}

RCT_EXPORT_METHOD(navigateToPaymentScreen:(NSDictionary *)params) {
  RCTLogInfo(@"Got Params. Now navigating to WebView.");
  
  NSDictionary *paramsDict = [RCTConvert NSDictionary:params];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    AppDelegate *appDelegate = (AppDelegate *) [UIApplication sharedApplication].delegate;
    [appDelegate navigateToPaymentView:paramsDict];
  });
}

- (void) emitEvent:(NSDictionary *)params :(NSString *)eventName
{
  RCTLogInfo(@"Sending Event!");
  [self sendEventWithName:eventName body:params];
}

@end
