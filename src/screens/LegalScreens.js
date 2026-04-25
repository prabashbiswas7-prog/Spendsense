import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { colors, spacing, radius } from '../theme';

const LegalScreen = ({ navigation, title, children }) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={colors.background} />
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 60 }} />
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
      <View style={{ height: 60 }} />
    </ScrollView>
  </View>
);

const Section = ({ heading, body }) => (
  <View style={styles.section}>
    <Text style={styles.heading}>{heading}</Text>
    <Text style={styles.body}>{body}</Text>
  </View>
);

// ─── Privacy Policy ──────────────────────────────────────────
export function PrivacyPolicyScreen({ navigation }) {
  return (
    <LegalScreen navigation={navigation} title="Privacy Policy">
      <Text style={styles.lastUpdated}>Last Updated: January 1, 2025</Text>
      <Text style={styles.intro}>
        SpendSense ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we handle your information.
      </Text>

      <Section
        heading="1. Data We Collect"
        body={`SpendSense collects the following data solely to provide its services:\n\n• SMS messages: We read bank and UPI transaction SMS to automatically track your expenses and income.\n• Transaction data: Amount, merchant name, category, and date of transactions.\n• User preferences: Notification settings and display preferences.\n\nWe do NOT collect your name, email, phone number, or any personally identifiable information unless you voluntarily provide it.`}
      />

      <Section
        heading="2. How We Use Your Data"
        body={`All data collected is used exclusively to:\n\n• Parse and categorize your financial transactions\n• Display spending summaries and reports\n• Send you local notifications about your spending\n\nWe do NOT use your data for advertising, profiling, or any commercial purpose.`}
      />

      <Section
        heading="3. Data Storage — 100% Local"
        body={`This is our most important commitment:\n\n✅ All your data is stored ONLY on your device.\n✅ We have NO servers that store your financial data.\n✅ We do NOT transmit your SMS content or transaction data to any external server.\n✅ We do NOT sell, share, or trade your data with any third party.\n\nYour financial data never leaves your phone.`}
      />

      <Section
        heading="4. SMS Permission"
        body={`SpendSense requires READ_SMS permission to automatically detect bank transactions. This permission is used solely to:\n\n• Identify transaction SMS from banks and UPI apps\n• Extract amount, merchant, and transaction type\n\nWe do NOT read personal SMS messages. We only process messages matching bank/UPI transaction patterns.`}
      />

      <Section
        heading="5. Notification Permission"
        body="SpendSense uses local notifications to alert you about transactions and send daily summaries. These notifications are generated entirely on-device and do not require internet access."
      />

      <Section
        heading="6. Camera & Gallery Permission"
        body="If you use the receipt scanning feature, SpendSense requests camera or gallery access to capture receipt images. Images are processed locally on your device using on-device OCR and are never uploaded to any server."
      />

      <Section
        heading="7. Third-Party Services"
        body={`SpendSense uses Google AdMob to display advertisements. AdMob may collect device identifiers and usage data as per Google's Privacy Policy. We recommend reviewing Google's Privacy Policy at https://policies.google.com/privacy for more information.`}
      />

      <Section
        heading="8. Children's Privacy"
        body="SpendSense is not intended for use by children under the age of 13. We do not knowingly collect data from children."
      />

      <Section
        heading="9. Data Deletion"
        body="You can delete all your data at any time through Settings → Clear All Data. This permanently removes all transactions and preferences from your device."
      />

      <Section
        heading="10. Changes to This Policy"
        body="We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app. Continued use of SpendSense after changes constitutes acceptance of the updated policy."
      />

      <Section
        heading="11. Contact Us"
        body="If you have any questions about this Privacy Policy, please contact us at:\n\nsupport@spendsense.app"
      />
    </LegalScreen>
  );
}

// ─── Terms of Service ────────────────────────────────────────
export function TermsOfServiceScreen({ navigation }) {
  return (
    <LegalScreen navigation={navigation} title="Terms of Service">
      <Text style={styles.lastUpdated}>Last Updated: January 1, 2025</Text>
      <Text style={styles.intro}>
        By downloading or using SpendSense, you agree to these Terms of Service. Please read them carefully.
      </Text>

      <Section
        heading="1. Acceptance of Terms"
        body="By accessing or using SpendSense, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the app."
      />

      <Section
        heading="2. Description of Service"
        body="SpendSense is a personal finance tracking application that automatically reads bank transaction SMS messages and helps users monitor their income and expenses. The app operates entirely on-device with no cloud storage."
      />

      <Section
        heading="3. User Responsibilities"
        body={`You agree to:\n\n• Use SpendSense only for lawful personal finance tracking\n• Not attempt to reverse engineer or modify the app\n• Not use the app in any way that violates applicable laws\n• Ensure your device is secure to protect your financial data`}
      />

      <Section
        heading="4. Financial Disclaimer"
        body="⚠️ IMPORTANT: SpendSense is a personal finance TRACKING tool only. It is NOT a financial advisor, bank, or regulated financial institution.\n\n• The app does not provide financial advice\n• Transaction data may not always be perfectly accurate\n• Do not rely solely on SpendSense for financial decisions\n• Always verify important transactions with your bank"
      />

      <Section
        heading="5. SMS Data"
        body="By granting SMS permission, you authorize SpendSense to read your SMS messages for the sole purpose of identifying bank and UPI transaction messages. You understand that:\n\n• Only transaction-pattern SMS are processed\n• All processing happens on your device\n• No SMS content is transmitted externally"
      />

      <Section
        heading="6. Advertisements"
        body="SpendSense is a free app supported by Google AdMob advertisements. By using the app, you consent to the display of ads. Ad targeting is managed by Google per their policies."
      />

      <Section
        heading="7. Accuracy of Data"
        body="SpendSense attempts to accurately parse transaction information from SMS. However, we cannot guarantee 100% accuracy due to variations in bank SMS formats. Users should verify important financial information with their respective banks."
      />

      <Section
        heading="8. Limitation of Liability"
        body="To the maximum extent permitted by law, SpendSense and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to financial losses."
      />

      <Section
        heading="9. Intellectual Property"
        body="SpendSense and all its content, features, and functionality are owned by SpendSense and are protected by intellectual property laws."
      />

      <Section
        heading="10. Termination"
        body="You may stop using SpendSense at any time by uninstalling the app. We reserve the right to terminate or suspend access to the app for violations of these Terms."
      />

      <Section
        heading="11. Governing Law"
        body="These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions."
      />

      <Section
        heading="12. Contact"
        body="For any questions regarding these Terms, contact us at:\n\nsupport@spendsense.app"
      />
    </LegalScreen>
  );
}

// ─── About ───────────────────────────────────────────────────
export function AboutScreen({ navigation }) {
  return (
    <LegalScreen navigation={navigation} title="About">
      <View style={styles.aboutHero}>
        <View style={styles.aboutLogo}>
          <Text style={styles.aboutLogoText}>₹</Text>
        </View>
        <Text style={styles.aboutName}>SpendSense</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutTagline}>Your money. Your phone. Your privacy.</Text>
      </View>

      <Section
        heading="What is SpendSense?"
        body="SpendSense is a smart personal finance tracker that automatically reads your bank and UPI transaction SMS messages to help you understand your spending habits — without ever sending your data to the cloud."
      />

      <Section
        heading="Our Philosophy"
        body="We believe your financial data belongs to you — and only you. That's why SpendSense stores everything locally on your device. No servers. No data brokers. No compromises."
      />

      <Section
        heading="How It Works"
        body={`1. SMS Listener: Reads bank transaction SMS in real-time\n2. Smart Parser: Extracts amount, merchant & category automatically\n3. Notification Listener: Catches UPI app notifications\n4. Manual Entry: Add transactions yourself anytime\n5. Receipt Scan: OCR-powered bill scanning\n\nAll of this happens entirely on your phone.`}
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>Private</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Servers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>Free</Text>
          <Text style={styles.statLabel}>Forever</Text>
        </View>
      </View>

      <Section
        heading="Contact & Support"
        body="Email: support@spendsense.app\nWebsite: spendsense.app\n\nWe'd love to hear your feedback!"
      />
    </LegalScreen>
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

  lastUpdated: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  intro: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  section: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  heading: { fontSize: 14, fontWeight: '800', color: colors.primary },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },

  aboutHero: {
    alignItems: 'center', paddingVertical: spacing.xl, gap: 8,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  aboutLogo: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: colors.primaryGlow, borderWidth: 1.5, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  aboutLogoText: { fontSize: 36, color: colors.primary, fontWeight: '800' },
  aboutName: { fontSize: 24, fontWeight: '900', color: colors.text },
  aboutVersion: { fontSize: 12, color: colors.textMuted },
  aboutTagline: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.primary, gap: 4,
  },
  statNumber: { fontSize: 22, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted },
});
