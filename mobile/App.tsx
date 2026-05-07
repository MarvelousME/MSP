import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { NeonButton } from './src/components/NeonButton';

function MainScreen() {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>MSP MOBILE</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Universal Access Portal</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Affiliate Dashboard</Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Track your conversions and earnings on the go with real-time notifications.
          </Text>
          <NeonButton 
            title="LAUNCH DASHBOARD" 
            onPress={() => console.log('Dashboard pressed')} 
            variant="primary"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.lg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Fraud Prevention</Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            AI-powered protection active. 0 suspicious events in the last 24h.
          </Text>
          <NeonButton 
            title="VIEW LOGS" 
            onPress={() => console.log('Logs pressed')} 
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>v1.3.0 Production Ready</Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  }
});
