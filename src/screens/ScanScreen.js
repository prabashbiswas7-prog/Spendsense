import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../theme';
import { saveTransaction } from '../utils/storage';

// Simple OCR parser for receipt text
const parseReceiptText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Find total amount
  const totalPatterns = [/total[:\s]+[₹rs.]*\s*([0-9,]+(?:\.[0-9]{1,2})?)/i, /amount[:\s]+[₹rs.]*\s*([0-9,]+)/i, /grand total[:\s]+[₹rs.]*\s*([0-9,]+)/i];
  let amount = null;
  for (const p of totalPatterns) {
    const m = text.match(p);
    if (m) { amount = parseFloat(m[1].replace(/,/g, '')); break; }
  }
  if (!amount) {
    // Find largest number in text
    const nums = [...text.matchAll(/[₹rs.]*\s*([0-9]{2,}(?:\.[0-9]{1,2})?)/gi)].map(m => parseFloat(m[1].replace(/,/g, '')));
    if (nums.length) amount = Math.max(...nums);
  }

  // Find merchant (usually first line or after "Bill from")
  let merchant = lines[0] || 'Receipt';
  if (merchant.length > 30) merchant = merchant.substring(0, 30);

  // Find date
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  const date = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

  return { amount, merchant, date };
};

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to continue.');
      return;
    }

    const picked = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!picked.canceled && picked.assets[0]) {
      setImage(picked.assets[0].uri);
      setResult(null);
      await processImage(picked.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    setScanning(true);
    try {
      // Use Google ML Kit via expo-text-recognition
      // Fallback: manual entry if OCR not available
      const TextRecognition = require('@react-native-ml-kit/text-recognition');
      const recognized = await TextRecognition.recognize(uri);
      const parsed = parseReceiptText(recognized.text || '');
      setResult(parsed);
    } catch (e) {
      // OCR not available, use manual
      setResult({ amount: null, merchant: 'Receipt', date: new Date().toISOString() });
      Alert.alert('Manual Entry', 'OCR not available. Please enter details manually.');
    }
    setScanning(false);
  };

  const handleSave = async () => {
    if (!result?.amount) {
      Alert.alert('No Amount', 'Could not detect amount. Please add manually.');
      navigation.navigate('AddTransaction', { type: 'expense' });
      return;
    }
    setSaving(true);
    await saveTransaction({
      id: `ocr_${Date.now()}`,
      amount: result.amount,
      type: 'expense',
      category: 'Others',
      merchant: result.merchant,
      description: 'Scanned receipt',
      date: result.date || new Date().toISOString(),
      source: 'ocr',
    });
    setSaving(false);
    Alert.alert('Saved!', 'Receipt transaction saved.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Receipt</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Image Preview */}
        <View style={styles.previewBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.preview} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📄</Text>
              <Text style={styles.placeholderText}>No receipt selected</Text>
            </View>
          )}
          {scanning && (
            <View style={styles.scanOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.scanText}>Scanning receipt...</Text>
            </View>
          )}
        </View>

        {/* Pick Options */}
        <View style={styles.pickRow}>
          <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
            <Text style={styles.pickIcon}>📷</Text>
            <Text style={styles.pickText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
            <Text style={styles.pickIcon}>🖼️</Text>
            <Text style={styles.pickText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && !scanning && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>DETECTED INFO</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Amount</Text>
              <Text style={[styles.resultValue, { color: colors.expense }]}>
                {result.amount ? `₹${result.amount.toFixed(2)}` : 'Not detected'}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Merchant</Text>
              <Text style={styles.resultValue}>{result.merchant}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Source</Text>
              <Text style={styles.resultValue}>OCR Scan</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE TRANSACTION'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
            >
              <Text style={styles.manualBtnText}>Edit Manually →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        {!image && (
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>TIPS FOR BEST RESULTS</Text>
            <Text style={styles.tip}>📸 Good lighting, flat surface</Text>
            <Text style={styles.tip}>🎯 Make sure total amount is visible</Text>
            <Text style={styles.tip}>📐 Keep receipt straight, not angled</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.md,
  },
  back: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },

  content: { padding: spacing.md, gap: spacing.md },

  previewBox: {
    height: 240, backgroundColor: colors.card, borderRadius: radius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 12 },
  placeholderIcon: { fontSize: 48 },
  placeholderText: { fontSize: 14, color: colors.textMuted },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.8)',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  scanText: { color: colors.primary, fontWeight: '700', letterSpacing: 1 },

  pickRow: { flexDirection: 'row', gap: spacing.md },
  pickBtn: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  pickIcon: { fontSize: 28 },
  pickText: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },

  resultCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.primary, gap: spacing.sm,
  },
  resultTitle: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: colors.textMuted },
  resultValue: { fontSize: 14, fontWeight: '700', color: colors.text },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  saveBtnText: { color: colors.black, fontWeight: '900', fontSize: 13, letterSpacing: 2 },

  manualBtn: { alignItems: 'center', padding: spacing.sm },
  manualBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  tips: { gap: 10 },
  tipsTitle: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  tip: { fontSize: 13, color: colors.textSecondary },
});
