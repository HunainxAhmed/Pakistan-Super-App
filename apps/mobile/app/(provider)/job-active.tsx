import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { MapSimulationView } from '../../src/components/MapSimulationView';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

type JobStep = 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';

export default function ProviderJobActiveScreen() {
  const router = useRouter();
  const { providerCompleteJob } = useAppStore();
  const [jobStep, setJobStep] = useState<JobStep>('EN_ROUTE');

  const handleNextStep = () => {
    if (jobStep === 'EN_ROUTE') {
      setJobStep('ARRIVED');
      Alert.alert('Status Updated', 'Customer notified: Driver has arrived outside!');
    } else if (jobStep === 'ARRIVED') {
      setJobStep('IN_PROGRESS');
      Alert.alert('Trip Started', 'Taximeter running. Drive safely!');
    } else if (jobStep === 'IN_PROGRESS') {
      providerCompleteJob('req-live-101');
      Alert.alert(
        'Trip Completed! 🎉',
        'Collect Rs. 420 cash from passenger.\nPlatform commission: Rs. 63 (15%)\nNet earning added to wallet: Rs. 357'
      );
      router.replace('/(provider)/dashboard');
    }
  };

  const getStepButtonTitle = () => {
    switch (jobStep) {
      case 'EN_ROUTE':
        return 'Tap: I Have Arrived at Pickup';
      case 'ARRIVED':
        return 'Tap: Start Trip (Customer Onboard)';
      case 'IN_PROGRESS':
        return 'Tap: Complete Trip & Collect Rs. 420 Cash';
      default:
        return 'Done';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Active Navigation</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Customer Phone', '+92 300 1234567')}
          style={styles.callPill}
        >
          <Ionicons name="call" size={16} color={Colors.primary} />
          <Text style={styles.callPillText}>Call Sara</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Navigation Map View */}
        <MapSimulationView
          pickupName="Dolmen Mall Clifton, Karachi"
          dropoffName="FTC Shahrah-e-Faisal, Karachi"
          driverName="Sara Qureshi"
          driverVehicle="Pickup: Gate 2 Entrance"
          etaMinutes={jobStep === 'IN_PROGRESS' ? 12 : 3}
          distanceKm={jobStep === 'IN_PROGRESS' ? 4.8 : 1.1}
          statusText={
            jobStep === 'EN_ROUTE'
              ? 'Navigating to Pickup: Dolmen Mall Clifton'
              : jobStep === 'ARRIVED'
              ? 'Waiting for passenger at Gate 2'
              : 'Trip In Progress: Heading to FTC Shahrah-e-Faisal'
          }
          isProviderEnRoute={true}
        />

        {/* Turn-by-Turn Guidance Pill */}
        <View style={styles.turnCard}>
          <Ionicons name="arrow-up" size={24} color={Colors.textWhite} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.turnInstruction}>
              {jobStep === 'IN_PROGRESS'
                ? 'Continue straight onto Shahrah-e-Faisal for 3.2 km'
                : 'Turn right at Clifton Submarine Chowrangi in 200m'}
            </Text>
            <Text style={styles.turnSpeed}>Speed limit 60 km/h • Moderate traffic</Text>
          </View>
        </View>

        {/* Passenger Summary Card */}
        <View style={styles.passengerCard}>
          <View style={styles.passengerHeader}>
            <View style={styles.passengerAvatar}>
              <Ionicons name="person" size={22} color={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.passengerName}>Sara Qureshi</Text>
              <Text style={styles.passengerMeta}>Rating 5.0 ★ • Cash Passenger</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cashAmount}>Rs. 420</Text>
              <Text style={styles.cashLabel}>Cash to Collect</Text>
            </View>
          </View>

          <View style={styles.paymentNote}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.paymentNoteText}>
              Platform commission (Rs. 63) will be deducted from your digital wallet automatically.
            </Text>
          </View>
        </View>

        {/* State Machine Transition Action Button */}
        <Button
          title={getStepButtonTitle()}
          onPress={handleNextStep}
          variant={jobStep === 'IN_PROGRESS' ? 'primary' : 'secondary'}
          style={{ marginTop: Spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  callPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  turnInstruction: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  turnSpeed: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  passengerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  passengerMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cashAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  cashLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
});
