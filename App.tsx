import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import FridgeScreen from './src/screens/FridgeScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';

export default function App() {
  return (
    <>
  <FridgeScreen />
  <ShoppingScreen />
  </>
  )
}
