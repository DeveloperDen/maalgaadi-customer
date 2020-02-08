// Import [START]
#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLog.h>

#import <Firebase.h>
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"

#import "CCWebViewController.h"

@import GoogleMaps;
// Import [END]

@implementation AppDelegate
{
  UINavigationController *navigationController;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Modules' initializations [START]
  [GMSServices provideAPIKey:@"AIzaSyC4YrHXpl0tQhpDXGVt3WU7_bYyaHd0ZbQ"];
  [FIRApp configure];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  [RNFirebaseNotifications configure];
  [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
  // Modules' initializations [END]
  
  self.reactBridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.reactBridge
                                                   moduleName:@"MaalGaadi"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

// Firebase Notifications [START]
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}

-(void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  
  [[RNFirebaseMessaging instance] didReceiveRemoteNotification:response.notification.request.content.userInfo];
  completionHandler();
}
// Firebase Notifications [END]

- (void) navigateToPaymentView:(NSDictionary*)paramsDict {
  RCTLogInfo(@"Got Params in Delegate. Navigating to WebView.");
  
  CCWebViewController *controller = [UIStoryboard storyboardWithName:@"CCWebViewController" bundle:nil].instantiateInitialViewController;
  
  controller.amountCurrParam = paramsDict[@"amountCurrParam"];
  controller.rsaKey = paramsDict[@"rsa"];
  controller.amount = paramsDict[@"amount"];
  controller.orderId = paramsDict[@"orderId"];
  controller.custName = paramsDict[@"custName"];
  controller.redirectUrl = paramsDict[@"redirectURL"];
  controller.cancelUrl = paramsDict[@"cancelURL"];
  controller.custNum = paramsDict[@"custNum"];
  controller.custEmail = paramsDict[@"custEmail"];
  controller.custAddress = paramsDict[@"custAddress"];
  controller.zipCode = paramsDict[@"zipCode"];
  controller.city = paramsDict[@"city"];
  controller.state = paramsDict[@"state"];
  
//  UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController: controller];
  [self.window.rootViewController presentViewController:controller animated:true completion:nil];
}

- (void) navigateToReactNative {
  [self.window.rootViewController dismissViewControllerAnimated:true completion:nil];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
