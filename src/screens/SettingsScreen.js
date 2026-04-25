import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, StatusBar, Linking,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { getSettings, saveSettings, exportCSV } from '../utils/storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    realtimeNotif: true,
    dailySummary: true,
    notifTime: '21:00',
    currency: '₹',
  });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleExport = async () => {
    try {
      const csv = await exportCSV();
      const path = FileSystem.documentDirectory + 'SpendSense_Export.csv';
      await FileSystem.writeAsStringAsync(path, csv);
      await Sharing.shareAsync(path);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All', style: 'destructive',
          onPress: async () => {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.clear();
            Alert.alert('Done', 'All data cleared.', [
              { text: 'OK', onPress: () => navigation.replace('Onboarding') }
            ]);
          }
        }
      ]
    );
  };

  const Row = ({ icon, label, value, onPress, danger }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: colors.expense }]}>{label}</Text>
      <Text style={styles.rowValue}>{value} →</Text>
    </TouchableOpacity>
  );

  const ToggleRow = ({ icon, label, value, onToggle }) => (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryDark }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="🔔"
            label="Real-time Alerts"
            value={settings.realtimeNotif}
            onToggle={v => update('realtimeNotif', v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="📊"
            label="Daily Summary"
            value={settings.dailySummary}
            onToggle={v => update('dailySummary', v)}
          />
          <View style={styles.divider} />
          <Row
            icon="⏰"
            label="Summary Time"
            value={settings.notifTime}
            onPress={() => Alert.alert('Coming Soon', 'Time picker coming in next update.')}
          />
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.section}>
          <Row icon="📤" label="Export to CSV" value="" onPress={handleExport} />
          <View style={styles.divider} />
          <Row icon="🗑️" label="Clear All Data" value="" onPress={handleClearData} danger />
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.section}>
          <Row
            icon="🔒"
            label="Privacy Policy"
            value=""
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <View style={styles.divider} />
          <Row
            icon="📋"
            label="Terms of Service"
            value=""
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <View style={styles.divider} />
          <Row
            icon="ℹ️"
            label="About SpendSense"
            value=""
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.section}>
          <Row
            icon="⭐"
            label="Rate the App"
            value=""
            onPress={() => Linking.openURL('market://details?id=com.spendsense.app')}
          />
          <View style={styles.divider} />
          <Row
            icon="💬"
            label="Send Feedback"
            value=""
            onPress={() => Linking.openURL('mailto:support@spendsense.app')}
          />
        </View>

        {/* Version */}
        <View style={styles.versionBox}>
          <Text style={styles.versionIcon}>₹</Text>
          <Text style={styles.versionApp}>SpendSense</Text>
          <Text style={styles.versionText}>Version {VERSION}</Text>
          <Text style={styles.versionSub}>Your money. Your phone. Your privacy.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },

  content: { padding: spacing.md, gap: spacing.sm },

  sectionLabel: {
    fontSize: 10, color: colors.textMuted,
    letterSpacing: 2, fontWeight: '700', marginTop: spacing.sm, marginBottom: 4,
  },
  section: {
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm,
  },
  rowIcon: { fontSize: 18, width: 28 },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  rowValue: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 52 },

  versionBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: 6 },
  versionIcon: { fontSize: 32, color: colors.primary, fontWeight: '800' },
  versionApp: { fontSize: 18, fontWeight: '800', color: colors.text },
  versionText: { fontSize: 12, color: colors.textMuted },
  versionSub: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
});
