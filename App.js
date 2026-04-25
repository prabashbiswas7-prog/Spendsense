import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications, startSMSListener, startNotificationListener } from './src/utils/listeners';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    // Setup notifications
    setupNotifications();

    // Start SMS listener (Android only)
    if (Platform.OS === 'android') {
      startSMSListener();
    }

    // Start notification listener
    const notifSub = startNotificationListener();

    return () => {
      notifSub?.remove?.();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      <AppNavigator />
    </>
  );
}
