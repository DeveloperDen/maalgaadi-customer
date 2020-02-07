#import "VersionChecker.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import "AppDelegate.h"

@implementation VersionChecker

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"VersionCheck"];
}

RCT_EXPORT_METHOD(checkVersion:(RCTResponseSenderBlock)callback) {
  bool updated = true;
  
  NSDictionary* infoDictionary = [[NSBundle mainBundle] infoDictionary];
  NSString* appID = infoDictionary[@"CFBundleIdentifier"]; // Get Bundle Id
  
  RCTLogInfo(@"Checking on URL: https://itunes.apple.com/lookup?bundleId=%@", appID);
  
  // Look for the Bundle Id's information from App Store
  NSURL* url = [NSURL URLWithString:[NSString stringWithFormat:@"https://itunes.apple.com/lookup?bundleId=%@", appID]];
  NSData* data = [NSData dataWithContentsOfURL:url];
  // Convert fetched data to JSON
  NSDictionary* lookup = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  
  // If result does contain something, then look for the version in obtained data
  if ([lookup[@"resultCount"] integerValue] == 1){
    NSString* appStoreVersion = lookup[@"results"][0][@"version"];
    NSString* currentVersion = infoDictionary[@"CFBundleShortVersionString"];
    
    RCTLogInfo(@"Versions - Current: %@ App Store: %@", currentVersion, appStoreVersion);
    
    // If current version string is not equal to app store's version then ask to update
    if (![appStoreVersion isEqualToString:currentVersion]) {
      updated = false;
    }
  }
  
  RCTLogInfo(@"Need to update: %@", updated? @"No" : @"Yes");
  
  // Send event to update application or not
  callback(@[updated? @true : @false]);
}

@end
