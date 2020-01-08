import 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
// Test Comment
import Home from './src/Home'
import Search from './src/Search'
import RunningMyBookings from './src/my_bookings/RunningMyBookings'
import PastMyBookings from './src/my_bookings/PastMyBookings'
import AddBooking from './src/add_booking/AddBooking'
import RateCard from './src/add_booking/RateCard'
import VehicleList from './src/add_booking/VehicleList'
import GoodsList from './src/add_booking/GoodsList'
import FavouriteLocations from './src/FavouriteLocations'
import ActiveFleet from './src/manage_fleet/ActiveFleet'
import RequestsFleet from './src/manage_fleet/RequestsFleet'
import MGWallet from './src/wallet/MGWallet'
import AddMoney from './src/wallet/AddMoney'
import Notifications from './src/Notifications'
import PendingPOD from './src/pod/PendingPOD'
import TransactionHistory from './src/wallet/TransactionHistory'
import Settings from './src/settings/Settings'
import SettingsAll from './src/settings/SubSettings'
import TermsConditions from './src/TermsConditions'
import Login from './src/sign_in_up/Login'
import Signup from './src/sign_in_up/Signup'
import ForgotPassword from './src/sign_in_up/ForgotPassword'
import GetOTP from './src/sign_in_up/GetOTP'
import ChangePassword from './src/sign_in_up/ChangePassword'
import CreateProfile from './src/sign_in_up/CreateProfile'
import DrawerContentComponent from './src/DrawerContentComponent'
import Splash from './src/Splash'
import Profile from './src/Profile'
import FareEstimation from './src/add_booking/FareEstimation'
import TripDetails from './src/my_bookings/TripDetails'
import RateScreen from './src/rate_card/RateScreen'
import NoNetworkModal from './src/NoNetworkModal'
import TrackDriver from './src/my_bookings/TrackDriver'
import PaymentWebview from './src/wallet/PaymentWebview';
import TransactionSuccess from './src/wallet/TransactionSuccess'
import TransactionFailed from './src/wallet/TransactionFailed'
import RatingDialog from './src/add_booking/RatingDialog'

import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createDrawerNavigator } from 'react-navigation-drawer'
import {createMaterialTopTabNavigator} from 'react-navigation-tabs'
import React, {Component} from 'react';
import {Easing, Animated, Image} from 'react-native'

const ACCENT = '#FFCB28' // 255, 203, 40

const vehicleIcon = require('./assets/vehicle.png')

const LOAD_RICK = 'Loading Rickshaw'
const TATA_ACE = 'Tata Ace'
const ASHOK_LL = 'Ashok Layland Dost'
const PICKUP = 'Pick Up'

const MyBookingsTabs = createMaterialTopTabNavigator({
  Running: RunningMyBookings,
  Past: PastMyBookings
},
{
  initialRouteName: "Running",
  tabBarOptions: {
    scrollEnabled: false,
    pressColor: 'rgba(0, 0, 0, 0.1)',
    labelStyle: {
      fontWeight: "700",
    },
    activeTintColor: 'black',
    inactiveTintColor: 'rgba(0, 0, 0, 0.3)',
    style: {
      backgroundColor: 'white'
    },
    indicatorStyle: {
      borderBottomWidth: 2,
      borderBottomColor: ACCENT
    }
  }
})

const ManageFleetTabs = createMaterialTopTabNavigator({
  Active: ActiveFleet,
  Request: RequestsFleet
},
{
  initialRouteName: "Active",
  tabBarOptions: {
    scrollEnabled: false,
    pressColor: 'rgba(0, 0, 0, 0.1)',
    labelStyle: {
      fontWeight: "700",
    },
    activeTintColor: 'black',
    inactiveTintColor: 'rgba(0, 0, 0, 0.3)',
    style: {
      backgroundColor: 'white'
    },
    indicatorStyle: {
      borderBottomWidth: 2,
      borderBottomColor: ACCENT
    }
  }
})

const PendingPODTabs = createMaterialTopTabNavigator({
  PendingPOD: {screen: PendingPOD,
  navigationOptions: {
    tabBarLabel: "Pending POD"
  }},
},
{
  initialRouteName: "PendingPOD",
  tabBarOptions: {
    scrollEnabled: false,
    pressColor: 'rgba(0, 0, 0, 0.1)',
    labelStyle: {
      fontWeight: "700",
    },
    activeTintColor: 'black',
    inactiveTintColor: 'rgba(0, 0, 0, 0.3)',
    style: {
      backgroundColor: 'white'
    },
    indicatorStyle: {
      borderBottomWidth: 2,
      borderBottomColor: ACCENT
    }
  }
})

const DrawerStackNavigator = createStackNavigator({
  TransactionSuccess: {screen: TransactionSuccess},
  TransactionFailed: {screen: TransactionFailed},

  RateScreen: {screen: RateScreen},

  TrackDriver: {screen: TrackDriver},
  TripDetails: {screen: TripDetails},
  
  FareEstimation: {screen: FareEstimation},

  Profile: {screen: Profile},
  CreateProfile: {screen: CreateProfile},

  TermsConditions: {screen: TermsConditions},

  SettingsAll : {screen: SettingsAll},
  Settings: {screen: Settings},

  TransactionHistory: {screen: TransactionHistory},

  PendingPOD: {screen: PendingPODTabs,
    navigationOptions: {
      headerTitle: 'POD',
      headerStyle: {elevation: 0}
    }
  },

  Notifications: {screen: Notifications},
  // Notifications: {screen: TransactionSuccess},
  // Notifications: {screen: TransactionFailed},

  AddMoney: {screen: AddMoney},
  MGWallet: {screen: MGWallet},

  ManageFleet: {screen: ManageFleetTabs, 
    navigationOptions: {
      headerTitle: 'Manage My Fleet',
      headerStyle: {elevation: 0}
    }},

  MyBookings: {screen: MyBookingsTabs, 
  navigationOptions: {
    headerTitle: 'My Bookings',
    headerStyle: {elevation: 0}
  }},

  FavouriteLocations: {screen: FavouriteLocations},
  GoodsList: {screen: GoodsList},
  VehicleList: {screen: VehicleList},
  AddBooking: {screen: AddBooking},
  Search: {screen: Search},

  Main: {screen: Home,
    navigationOptions: () => ({
      headerStyle: {display: 'none'},
    })}

}, {initialRouteName: 'Main',
transitionConfig: () => ({
  transitionSpec: {
    duration: 300,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing,
  },
  screenInterpolator: sceneProps => {
    const { layout, position, scene } = sceneProps;
    const { index } = scene;

    const width = layout.initWidth;
    const translateX = position.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [width, 0, 0],
    });

    const opacity = position.interpolate({
      inputRange: [index - 1, index - 0.99, index],
      outputRange: [0, 1, 1],
    });

    return { opacity, transform: [{ translateX }] };
  },
  }),
})

const DrawerNavigator = createDrawerNavigator({
  AppStack: { screen: DrawerStackNavigator,
    navigationOptions: () => ({
      headerStyle: {display: 'none'},
  })},
}, 
{
  initialRouteName: 'AppStack',
  drawerBackgroundColor: 'white',
  drawerType: "slide",
  drawerWidth: '80%',
  drawerPosition: "left",
  contentComponent: DrawerContentComponent,
})

const HomeStackNavigator = createStackNavigator({
    Home: { screen: DrawerNavigator,
      navigationOptions: () => ({
        headerStyle: {display: 'none'},
    })},
    RateCard: { screen: RateCard },
    NoNetworkModal: {screen: NoNetworkModal,
      navigationOptions: () => ({
        headerStyle: {display: 'none'},
      })
    },
    PaymentWebview: {screen: PaymentWebview,
      navigationOptions: () => ({
        headerStyle: {display: 'none'},
      })
    },
    RatingDialog: {screen: RatingDialog,
      navigationOptions: () => ({
        headerStyle: {display: 'none'},
      })
    },
  }, {
    initialRouteName: "Home",
    mode: 'card',
    transparentCard: true,
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const height = layout.initHeight;
        const translateY = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [height, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { opacity, transform: [{ translateY }] };
      },
    }),
  }
);

const RegistrationNavigator = createStackNavigator({
  ChangePassword: {screen: ChangePassword},
  GetOTP: {screen: GetOTP},
  ForgotPassword: {screen: ForgotPassword},
  Signup: {screen: Signup},
  Login: {screen: Login,
    navigationOptions: () => ({
      headerStyle: {display: 'none'},
    })}
  },
  {initialRouteName: 'Login',
})

const MainSwitchNavigator = createSwitchNavigator({
  HomeDrawerNavigator: {screen: HomeStackNavigator,
  navigationOptions: {
    headerStyle: {display: 'none'}
  }},

  RegistrationNavigator: {screen: RegistrationNavigator},

  Splash: {screen: Splash},
  },
  {initialRouteName: 'Splash',
})

const App = createAppContainer(MainSwitchNavigator)

export default App;