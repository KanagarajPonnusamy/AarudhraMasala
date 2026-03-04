/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import SearchScreen from '../screens/SearchScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import CustomDrawer from '../components/CustomDrawer';
import WebContainer from '../components/WebContainer';
import { useTheme } from '../context/ThemeContext';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function DrawerNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: theme.drawerBg,
        },
        overlayColor: theme.overlay,
      }}
    >
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <WebContainer style={{ backgroundColor: theme.background }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="OrderSuccess"
            component={OrderSuccessScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="MyOrders"
            component={MyOrdersScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Favourites"
            component={FavouritesScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WebContainer>
  );
}
