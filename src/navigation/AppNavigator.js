import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ScanScreen from '../screens/ScanScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { PrivacyPolicyScreen, TermsOfServiceScreen, AboutScreen } from '../screens/LegalScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Transactions: '📋',
  Reports: '📊',
  Settings: '⚙️',
};

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, focused && styles.tabItemActive]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={styles.tabIcon}>{TAB_ICONS[route.name]}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {route.name}
            </Text>
            {focused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1, alignItems: 'center', gap: 3, position: 'relative',
  },
  tabItemActive: {},
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
  tabIndicator: {
    position: 'absolute', bottom: -8, width: 4, height: 4,
    borderRadius: 2, backgroundColor: colors.primary,
  },
});
