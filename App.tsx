 import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { createNativeStackNavigator } from '@react-navigation/native-stack'
  import { Ionicons } from '@expo/vector-icons';
  import FridgeScreen from './src/screens/FridgeScreen';
  import ShoppingScreen from './src/screens/ShoppingScreen';
  import MealScreen from './src/screens/MealScreen';
  import StoreScreen from './src/screens/StoreScreen';
  import CookingScreen from './src/screens/CookingScreen';

  const Tab = createBottomTabNavigator();


   const MealStack = createNativeStackNavigator();

  function MealStackScreen() {
    return (
      <MealStack.Navigator screenOptions={{ headerShown: false }}>
        <MealStack.Screen name="MealList" component={MealScreen} />
        <MealStack.Screen name="Cooking" component={CookingScreen} />
      </MealStack.Navigator>
    );
  }

  export default function App() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              switch (route.name) {
                case 'Fridge':
                  iconName = focused ? 'cube' : 'cube-outline';
                  break;
                case 'Shopping':
                  iconName = focused ? 'cart' : 'cart-outline';
                  break;
                case 'Meals':
                  iconName = focused ? 'restaurant' : 'restaurant-outline';
                  break;
                case 'Store':
                  iconName = focused ? 'storefront' : 'storefront-outline';
                  break;
                default:
                  iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Fridge" component={FridgeScreen} />
          <Tab.Screen name="Shopping" component={ShoppingScreen} />
          <Tab.Screen name="Meals" component={MealStackScreen} />
          <Tab.Screen name="Store" component={StoreScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
