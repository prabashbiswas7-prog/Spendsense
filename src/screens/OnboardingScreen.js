import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { setOnboarded, saveUser } from '../utils/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '📱',
    title: 'Smart SMS Tracking',
    desc: 'SpendSense automatically reads your bank SMS and tracks every transaction — no manual entry needed.',
  },
  {
    id: '2',
    icon: '🔒',
    title: '100% Private',
    desc: 'All your data stays on your phone. No servers. No cloud. No data selling. Ever.',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Daily Summary',
    desc: 'Get a smart daily notification every evening showing exactly where your money went today.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await setOnboarded();
    await saveUser({ name: 'User', currency: '₹' });
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={handleFinish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.btn} onPress={goNext}>
        <Text style={styles.btnText}>
          {currentIndex === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
        </Text>
      </TouchableOpacity>

      {/* Permission note */}
      {currentIndex === 0 && (
        <Text style={styles.permNote}>
          SMS permission will be requested to auto-track transactions
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingBottom: 40,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: spacing.md,
    marginTop: 20,
    marginRight: spacing.md,
  },
  skipText: { color: colors.textMuted, fontSize: 14 },

  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  icon: { fontSize: 52 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  dots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },

  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  btnText: {
    color: colors.black,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 2,
  },
  permNote: {
    marginTop: 16,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
