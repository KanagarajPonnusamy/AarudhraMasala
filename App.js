/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import { FavouriteProvider } from './src/context/FavouriteContext';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

// Apply Tahoma as default font for all Text and TextInput
const defaultTextStyle = { fontFamily: 'Tahoma' };
const origTextRender = Text.render;
Text.render = function (props, ref) {
  const style = [defaultTextStyle, props.style];
  return origTextRender.call(this, { ...props, style }, ref);
};
const origTextInputRender = TextInput.render;
TextInput.render = function (props, ref) {
  const style = [defaultTextStyle, props.style];
  return origTextInputRender.call(this, { ...props, style }, ref);
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Tahoma: require('./assets/Fonts/tahoma_regular_font.ttf'),
    BabyBoho: require('./assets/Fonts/Baby Boho.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <CartProvider>
          <FavouriteProvider>
            <OrderProvider>
              <ThemeProvider>
                <AppNavigator />
              </ThemeProvider>
            </OrderProvider>
          </FavouriteProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
