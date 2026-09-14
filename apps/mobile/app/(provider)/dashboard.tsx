import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const {
    isProviderOnline,
    toggleProviderOnline,
    providerTodayEarnings,
    providerCompletedJobsCount,
    toggleRoleMode,
  } = useAppStore();

  const [counterDelta, setCounterDelta] = useState(0);

  // Simulated live incoming request in Karachi
  const [incomingJob, setIncomingJob] = useState({
    id: 'req-live-101',
    customerName: 'Sara Qureshi',
    service: 'Super AC Premium',
    pickup: 'Dolmen Mall Clifton, Karachi',
    dropoff: 'FTC Shahrah-e-Faisal, Karachi',
    distanceKm: 5.2,
    customerOfferedFare: 420,
    timeAgo: 'Just now',
  });

  const handleAcceptJob = () => {
    Alert.alert(
      'Offer Accepted!',
      `You accepted customer offer for Rs. ${incomingJob.customerOfferedFare}. Starting navigation to pickup.`
    );
    router.push('/(provider)/job-active');
  };

  const handleSendCounterOffer = () => {
    const finalCounter = incomingJob.customerOfferedFare + counterDelta;
    Alert.alert(
      'Counter-Offer Submitted',
      `Sent Rs. ${finalCounter} offer to customer. Waiting for customer response.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Provider Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>Partner Operations</Text>
          <Text style={styles.headerTitle}>Driver Console</Text>
        </View>

        {/* Quick Testing Role Switcher */}
        <TouchableOpacity onPress={toggleRoleMode} style={styles.modeSwitchBtn}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.modeSwitchText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Online / Offline Radar Card */}
        <View style={[styles.statusCard, isProviderOnline ? styles.cardOnline : styles.cardOffline]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, isProviderOnline ? styles.dotGreen : styles.dotGray]} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.statusCardTitle}>
                {isProviderOnline ? 'You Are Online' : 'You Are Offline'}
              </Text>
              <Text style={styles.statusCardSub}>
                {isProviderOnline
                  ? 'Receiving ride & mechanic job dispatches in Clifton / DHA'
                  : 'Go online to start receiving customer requests'}
              </Text>
            </View>
            <Switch
              value={isProviderOnline}
              onValueChange={toggleProviderOnline}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={isProviderOnline ? Colors.primary : '#94A3B8'}
            />
          </View>
        </View>

        {/* Today's KPI Metrics */}
        <Text style={styles.sectionHeader}>Today's Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Today's Earnings</Text>
            <Text style={styles.metricValue}>Rs. {providerTodayEarnings.toLocaleString()}</Text>
            <Text style={styles.metricSub}>Net take-home</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Completed Jobs</Text>
            <Text style={styles.metricValue}>{providerCompletedJobsCount}</Text>
            <Text style={styles.metricSub}>94% acceptance</Text>
          </View>
        </View>

        {/* Partner Vehicle & KYC Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIconCircle}>
            <MaterialCommunityIcons name="car" size={26} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.vehicleName}>Toyota Corolla GLI (White)</Text>
            <Text style={styles.vehiclePlate}>Plate: KHI-9821 • CNIC: 42201-1234567-3</Text>
          </View>
          <Badge label="APPROVED" variant="success" />
        </View>

        {/* Live Incoming inDrive Job Feed */}
        {isProviderOnline && incomingJob && (
          <View style={styles.dispatchSection}>
            <View style={styles.dispatchHeaderRow}>
              <View style={styles.radarPulse}>
                <Ionicons name="radio" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.dispatchSectionTitle}>Incoming Customer Request</Text>
              <Badge label="RIDE" variant="info" />
            </View>

            <View style={styles.incomingJobCard}>
              <View style={styles.jobCustomerRow}>
                <View style={styles.customerAvatar}>
                  <Ionicons name="person" size={20} color={Colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.customerName}>{incomingJob.customerName}</Text>
                  <Text style={styles.jobServiceMeta}>
                    {incomingJob.service} • {incomingJob.distanceKm} km trip
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.fareHighlight}>Rs. {incomingJob.customerOfferedFare}</Text>
                  <Text style={styles.fareSubText}>Customer Offer</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={styles.greenCircle} />
                  <Text numberOfLines={1} style={styles.routeText}>
                    {incomingJob.pickup}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={styles.redSquare} />
                  <Text numberOfLines={1} style={styles.routeText}>
                    {incomingJob.dropoff}
                  </Text>
                </View>
              </View>

              {/* inDrive Counter-Offer Controls */}
              <View style={styles.counterOfferSection}>
                <Text style={styles.counterTitle}>Bargain / Counter Offer</Text>
                <View style={styles.counterPillsRow}>
                  {[0, 30, 50, 100].map((delta) => {
                    const price = incomingJob.customerOfferedFare + delta;
                    const isSelected = counterDelta === delta;
                    return (
                      <TouchableOpacity
                        key={delta}
                        onPress={() => setCounterDelta(delta)}
                        style={[styles.counterPill, isSelected && styles.counterPillSelected]}
                      >
                        <Text style={[styles.counterPillText, isSelected && { color: Colors.primary }]}>
                          Rs. {price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Accept & Counter Action Buttons */}
              <View style={styles.actionButtonsRow}>
                {counterDelta > 0 ? (
                  <Button
                    title={`Send Counter Offer (Rs. ${incomingJob.customerOfferedFare + counterDelta})`}
                    onPress={handleSendCounterOffer}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Button
                    title={`Accept for Rs. ${incomingJob.customerOfferedFare}`}
                    onPress={handleAcceptJob}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  modeSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  cardOnline: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cardOffline: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotGreen: {
    backgroundColor: Colors.primary,
  },
  dotGray: {
    backgroundColor: Colors.textMuted,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vehiclePlate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dispatchSection: {
    marginBottom: Spacing.lg,
  },
  dispatchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  radarPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchSectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  incomingJobCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  jobCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  jobServiceMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fareHighlight: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  fareSubText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  routeContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  redSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.danger,
    marginRight: Spacing.sm,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.border,
    marginLeft: 3,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  counterOfferSection: {
    marginTop: Spacing.md,
  },
  counterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  counterPillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  counterPill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  counterPillSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  counterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionButtonsRow: {
    marginTop: Spacing.lg,
  },
});
