# SpendSense 💚
### Your money. Your phone. Your privacy.

Smart Android expense tracker that automatically reads bank SMS & UPI notifications.

---

## 📁 Project Structure

```
SpendSense/
├── App.js                          ← Entry point
├── app.json                        ← Expo config
├── eas.json                        ← Build profiles
├── package.json                    ← Dependencies
└── src/
    ├── theme.js                    ← Colors & design tokens
    ├── navigation/
    │   └── AppNavigator.js         ← All navigation
    ├── screens/
    │   ├── SplashScreen.js
    │   ├── OnboardingScreen.js
    │   ├── HomeScreen.js
    │   ├── TransactionsScreen.js
    │   ├── AddTransactionScreen.js
    │   ├── ScanScreen.js
    │   ├── ReportsScreen.js
    │   ├── SettingsScreen.js
    │   └── LegalScreens.js         ← Privacy + Terms + About
    └── utils/
        ├── smsParser.js            ← SMS parsing engine
        ├── storage.js              ← Local data storage
        └── listeners.js            ← SMS & notification listeners
```

---

## 🚀 How to Build APK (Step by Step)

### Prerequisites
- Node.js installed → https://nodejs.org
- Expo account (free) → https://expo.dev

### Step 1 — Install Expo CLI
```bash
npm install -g eas-cli
```

### Step 2 — Login to Expo
```bash
eas login
```

### Step 3 — Go to project folder
```bash
cd SpendSense
```

### Step 4 — Install dependencies
```bash
npm install
```

### Step 5 — Initialize EAS
```bash
eas init
```
Copy the project ID and paste it in app.json → extra.eas.projectId

### Step 6 — Build APK (Preview)
```bash
eas build -p android --profile preview
```

Wait 5-10 minutes. EAS will give you a download link for the APK.

### Step 7 — Install on Phone
Download the APK and install on your Android phone!

---

## 📱 For Play Store

```bash
eas build -p android --profile production
```
This builds an AAB file for Play Store submission.

---

## 🔑 Permissions Explained

| Permission | Why |
|---|---|
| READ_SMS | Auto-detect bank transactions |
| RECEIVE_SMS | Real-time SMS tracking |
| POST_NOTIFICATIONS | Transaction alerts & daily summary |
| CAMERA | Receipt scanning |
| READ_EXTERNAL_STORAGE | Pick receipt from gallery |

---

## 🎨 Design

- **Background**: #0a0a0a (Pure black)
- **Primary**: #00c853 (Financial green)
- **Danger**: #ff1744 (Expense red)
- **Theme**: Dark, minimal, financial

---

## 💰 Monetization

- Google AdMob integrated
- Add your AdMob App ID in app.json
- Banner ads on Reports & Transactions screens

---

## 📞 Support

Email: support@spendsense.app
