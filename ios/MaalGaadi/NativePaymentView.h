#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativePaymentView : RCTEventEmitter<RCTBridgeModule>

- (void) emitEvent:(NSDictionary *)params :(NSString *)eventName;

@end
