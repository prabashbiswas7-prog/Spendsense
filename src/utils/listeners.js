import * as Notifications from 'expo-notifications';
import { parseSMS } from './smsParser';
import { saveTransaction } from './storage';

// ─── SMS Listener ────────────────────────────────────────────
export const startSMSListener = async () => {
  // SMS listening will be added in v1.1 via native module
  console.log('SMS listener: coming in v1.1');
};

// ─── Notification Listener ───────────────────────────────────
export const startNotificationListener = () => {
  const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
    const body = notification.request.content.body || '';
    const title = notification.request.content.title || '';
    const fullText = `${title} ${body}`;

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
      trigger: null,
    });
  } catch (e) {
    console.log('Notification error:', e);
  }
};

// ─── Daily Summary Notification ──────────────────────────────
export const scheduleDailySummary = async (time = '21:00') => {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelAllScheduledNotificationsAsync();
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
