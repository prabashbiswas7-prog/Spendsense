import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications } from './src/utils/listeners';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      <AppNavigator />
    </>
  );
}
