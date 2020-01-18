#import "CCWebViewController.h"
#import "RSA.h"
#import <React/RCTLog.h>
#import <React/RCTBridge.h>
#import "NativePaymentView.h"
#import "AppDelegate.h"

@interface CCWebViewController ()

@end

@implementation CCWebViewController

@synthesize rsaKey;@synthesize orderId;
@synthesize amount;@synthesize amountCurrParam;@synthesize redirectUrl;@synthesize cancelUrl;
@synthesize custNum;@synthesize custEmail;@synthesize custAddress;@synthesize custName;
@synthesize zipCode;@synthesize state;@synthesize city;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
  self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
  return self;
}

- (IBAction)onBackPressed:(id)sender {
  AppDelegate *appDelegate = (AppDelegate *) [UIApplication sharedApplication].delegate;
  [appDelegate navigateToReactNative];
}

- (void)viewDidLoad
{
  [super viewDidLoad];
  
  // Adding back button to our custom navigation bar.
  self.navItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemStop target:self action:@selector(onBackPressed:)];
  
  RCTLogInfo(@"WebView didLoad. Animating indicator now.");
  
  self.viewWeb.delegate = self;
  [_indicator startAnimating];
  
  
  //Encrypting Card Details
  NSString *myRequestString = [NSString stringWithFormat:@"%@",amountCurrParam];
  
  
  NSString *encVal = [RSA encryptString:myRequestString publicKey:rsaKey];
  
  encVal = (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(NULL,
                                                                                 (CFStringRef)encVal,
                                                                                 NULL,
                                                                                 (CFStringRef)@"!*'();:@&=+$,/?%#[]",
                                                                                 kCFStringEncodingUTF8 ));
  
  //Preparing for a webview call
  RCTLogInfo(@"Preparing for a webview call.");
  
  NSString *urlAsString = [NSString stringWithFormat:@"https://secure.ccavenue.com/transaction/initTrans"];
  
  NSString *accessCode = @"AVHR74EK06AD66RHDA";
  NSString *merchantId = @"153491";
  NSString *country = @"India";
  
  NSString *encryptedStr = [NSString stringWithFormat:@"access_code=%@&merchant_id=%@&order_id=%@&redirect_url=%@&cancel_url=%@&enc_val=%@&billing_name=%@&billing_tel=%@&billing_email=%@&billing_address=%@&billing_zip=%@&billing_city=%@&billing_state=%@&billing_country=%@",accessCode,merchantId,orderId,redirectUrl,cancelUrl,encVal,custName,custNum,custEmail,custAddress,zipCode,city,state,country];
  
  RCTLogInfo(@"Sending data to CCAvenue: %@", encryptedStr);
  
  NSData *myRequestData = [NSData dataWithBytes: [encryptedStr UTF8String] length: [encryptedStr length]];
  
  NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL: [NSURL URLWithString: urlAsString]];
  
  [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
  
  [request setValue:urlAsString forHTTPHeaderField:@"Referer"];
  
  [request setHTTPMethod: @"POST"];
  
  [request setHTTPBody: myRequestData];
  
  [_viewWeb loadRequest:request];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
  
  // Post page loading steps [START]
  [_indicator stopAnimating];
  _indicator.hidden = true;
  
  // Initially, webview's user interaction is disabled and its alpha is not 1, in storyboard.
  _viewWeb.userInteractionEnabled = true;
  _viewWeb.alpha = 1.0;
  // Post page loading steps [END]
  
  NSString *string = webView.request.URL.absoluteString;
  
  // Sending Page Loading finished event [START]
  AppDelegate *appDelegate = (AppDelegate *) [UIApplication sharedApplication].delegate;
  RCTBridge *reactBridge = [appDelegate reactBridge];
  NativePaymentView *paymentView = [reactBridge moduleForName:@"NativePaymentView"];
  [paymentView emitEvent:@{@"url":string} :@"PageFinished"];
  // [END]
  
  // URL is closer to success url
  if ([string rangeOfString:redirectUrl].location != NSNotFound
      || [string rangeOfString:cancelUrl].location != NSNotFound) {
    
    NSString *html = [webView stringByEvaluatingJavaScriptFromString:@"document.documentElement.outerHTML"];
    RCTLogInfo(@"Transaction HTML: %@", html);
    
    NSInteger startBraceIndex = [html rangeOfString:@"{"].location;
    NSInteger endBraceIndex = [html rangeOfString:@"}" options:NSBackwardsSearch].location;
    NSString *output = [html substringWithRange:NSMakeRange(startBraceIndex, endBraceIndex - startBraceIndex + 1)];
    
    RCTLogInfo(@"Transaction Output: %@", output);
    
    // TODO: Convert "output" to NSDictionary and send the TransFinished event
    
    [appDelegate navigateToReactNative];
  }
}

- (void)didReceiveMemoryWarning
{
  [super didReceiveMemoryWarning];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
  
}

@end
