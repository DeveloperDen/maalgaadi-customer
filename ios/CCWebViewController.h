#import <UIKit/UIKit.h>

@interface CCWebViewController : UIViewController <UIWebViewDelegate>

@property (strong, nonatomic) IBOutlet UIWebView *viewWeb;
@property (strong, nonatomic) IBOutlet UINavigationItem *navItem;

@property (strong, nonatomic) NSString *custName;
@property (strong, nonatomic) NSString *custEmail;
@property (strong, nonatomic) NSString *custNum;
@property (strong, nonatomic) NSString *custAddress;
@property (strong, nonatomic) NSString *zipCode;
@property (strong, nonatomic) NSString *city;
@property (strong, nonatomic) NSString *state;
@property (strong, nonatomic) NSString *orderId;
@property (strong, nonatomic) NSString *amount;
@property (strong, nonatomic) NSString *amountCurrParam;
@property (strong, nonatomic) NSString *redirectUrl;
@property (strong, nonatomic) NSString *cancelUrl;
@property (strong, nonatomic) NSString *rsaKey;

@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *indicator;



@end
