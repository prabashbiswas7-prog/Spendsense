// SMS & Notification Listener Service
// This runs in the background to capture transactions automatically

import { parseSMS, saveTransaction } from '../utils/storage';
import * as Notifications from 'expo-notifications';

// ─── SMS Listener ────────────────────────────────────────────
// Uses react-native-get-sms-android for reading SMS
export const startSMSListener = async () => {
  try {
    const { PermissionsAndroid } = require('react-native');
    const SmsAndroid = require('react-native-get-sms-android').default;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SpendSense SMS Permission',
        message: 'SpendSense needs SMS access to automatically track your bank transactions.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('SMS permission denied');
      return;
    }

    // Read recent SMS (last 100)
    const filter = {
      box: 'inbox',
      maxCount: 100,
      indexFrom: 0,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => console.log('SMS read failed:', fail),
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        messages.forEach(async (sms) => {
          const parsed = parseSMS(sms);
          if (parsed) {
            await saveTransaction(parsed);
          }
        });
      }
    );

    // Listen for new SMS (real-time)
    // Using SmsListener for real-time
    const SmsListener = require('react-native-android-sms-listener').default;
    SmsListener.addListener(async (message) => {
      const parsed = parseSMS({ body: message.body, date: Date.now().toString() });
      if (parsed) {
        await saveTransaction(parsed);
        // Send real-time notification
        await sendTransactionNotification(parsed);
      }
    });

  } catch (e) {
    console.log('SMS Listener error:', e);
  }
};

// ─── Notification Listener ───────────────────────────────────
// Catches GPay/PhonePe/Paytm notifications
export const startNotificationListener = () => {
  const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
    const body = notification.request.content.body || '';
    const title = notification.request.content.title || '';
    const fullText = `${title} ${body}`;

    // Check if it's a payment notification
    const paymentApps = ['phonepe', 'gpay', 'google pay', 'paytm', 'amazon pay', 'bhim'];
    const isPayment = paymentApps.some(app => fullText.toLowerCase().includes(app));

    if (isPayment) {
      const parsed = parseSMS({ body: fullText, date: Date.now().toString() });
      if (parsed) {
        await saveTransaction(parsed);
      }
    }
  });

  return subscription;
};

// ─── Real-time Transaction Notification ─────────────────────
export const sendTransactionNotification = async (tx) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: tx.type === 'income' ? '💰 Money Received' : '💸 Money Spent',
        body: `${tx.type === 'income' ? '+' : '-'}₹${tx.amount.toFixed(2)} ${tx.merchant ? `at ${tx.merchant}` : ''}`,
        data: { txId: tx.id },
        sound: true,
      },
      trigger: null, // Immediate
    });
  } catch (e) { console.log('Notification error:', e); }
};

// ─── Daily Summary Notification ──────────────────────────────
export const scheduleDailySummary = async (time = '21:00') => {
  const [hour, minute] = time.split(':').map(Number);

  // Cancel existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Daily Summary',
      body: 'Tap to see how much you spent today →',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

// ─── Setup Notifications ─────────────────────────────────────
export const setupNotifications = async () => {
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await scheduleDailySummary('21:00');
  }
};
