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
import { ServiceRequest, ServiceRequestStatus } from '@superapp/types';

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const {
    isProviderOnline,
    toggleProviderOnline,
    providerTodayEarnings,
    providerCompletedJobsCount,
    incomingRequestsFeed,
    activeRide,
    providerAcceptJob,
    providerSendOffer,
    providerDeclineJob,
    toggleRoleMode,
  } = useAppStore();

  const [counterDeltas, setCounterDeltas] = useState<Record<string, number>>({});

  const handleSwitchToCustomer = () => {
    toggleRoleMode();
    router.push('/(customer)/home');
  };

  const handleAcceptRequest = (req: ServiceRequest, finalFare: number) => {
    providerAcceptJob(req, finalFare);
    Alert.alert(
      'Offer Accepted! 🚗',
      `You accepted ${req.customerName}'s ride for Rs. ${finalFare}. Navigating to pickup location now!`
    );
    router.push('/(provider)/job-active');
  };

  const handleSendCounter = (req: ServiceRequest, counterPrice: number) => {
    providerSendOffer(req.id, counterPrice);
    Alert.alert(
      'Counter-Offer Sent 🤝',
      `Submitted Rs. ${counterPrice} offer to ${req.customerName}. Waiting for passenger response.`
    );
    // Reset delta for this request
    setCounterDeltas((prev) => ({ ...prev, [req.id]: 0 }));
  };

  const isOngoingRide =
    !!activeRide &&
    [
      ServiceRequestStatus.ACCEPTED,
      ServiceRequestStatus.PROVIDER_EN_ROUTE,
      ServiceRequestStatus.ARRIVED,
      ServiceRequestStatus.IN_PROGRESS,
    ].includes(activeRide.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>Captain Operations</Text>
          <Text style={styles.headerTitle}>Driver Console</Text>
        </View>

        <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.modeSwitchBtn}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.modeSwitchText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Trip Banner if already in a ride */}
        {isOngoingRide && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(provider)/job-active')}
            style={styles.activeRideBanner}
          >
            <View style={styles.pulseDot} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.activeRideTitle}>Active Trip with {activeRide.customerName}</Text>
              <Text numberOfLines={1} style={styles.activeRideSub}>
                Status: {activeRide.status} • Rs. {activeRide.finalAgreedFare}
              </Text>
            </View>
            <View style={styles.navActionPill}>
              <Text style={styles.navActionText}>Open Map</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Online / Offline Radar Card */}
        <View style={[styles.statusCard, isProviderOnline ? styles.cardOnline : styles.cardOffline]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, isProviderOnline ? styles.dotGreen : styles.dotGray]} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.statusCardTitle}>
                {isProviderOnline ? 'You Are Online & Ready' : 'You Are Currently Offline'}
              </Text>
              <Text style={styles.statusCardSub}>
                {isProviderOnline
                  ? 'Receiving passenger requests in Clifton, DHA & Saddar'
                  : 'Toggle switch to go online and start accepting rides'}
              </Text>
            </View>
            <Switch
              value={isProviderOnline}
              onValueChange={toggleProviderOnline}
              trackColor={{ false: '#475569', true: '#059669' }}
              thumbColor={isProviderOnline ? '#10B981' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Today's KPI Metrics */}
        <Text style={styles.sectionHeader}>Today's Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Today's Net Earnings</Text>
            <Text style={styles.metricValue}>Rs. {providerTodayEarnings.toLocaleString()}</Text>
            <Text style={styles.metricSub}>Net take-home</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Trips Completed</Text>
            <Text style={styles.metricValue}>{providerCompletedJobsCount}</Text>
            <Text style={styles.metricSub}>96% acceptance rate</Text>
          </View>
        </View>

        {/* Karachi Demand Surge & Radar Hotspots */}
        {isProviderOnline && (
          <View style={styles.demandCard}>
            <View style={styles.demandHeader}>
              <Ionicons name="flame" size={20} color="#F59E0B" />
              <Text style={styles.demandTitle}>Karachi High Demand Hotspots</Text>
            </View>
            <View style={styles.hotspotsRow}>
              <View style={styles.hotspotPill}>
                <Text style={styles.hotspotArea}>Clifton / Sea View</Text>
                <Text style={styles.hotspotSurge}>+20% Surge</Text>
              </View>
              <View style={styles.hotspotPill}>
                <Text style={styles.hotspotArea}>Jinnah Airport</Text>
                <Text style={styles.hotspotSurge}>+30% Peak</Text>
              </View>
              <View style={styles.hotspotPill}>
                <Text style={styles.hotspotArea}>Saddar / Burns Rd</Text>
                <Text style={styles.hotspotSurge}>+15% Surge</Text>
              </View>
            </View>
          </View>
        )}

        {/* Live Incoming Requests Feed */}
        <View style={styles.feedHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isProviderOnline && <View style={styles.pulseRadar} />}
            <Text style={styles.sectionHeader}>
              {isProviderOnline ? 'Live inDrive Passenger Requests' : 'Requests Paused'}
            </Text>
          </View>
          <Badge
            label={isProviderOnline ? `${incomingRequestsFeed.length} Available` : 'Offline'}
            variant={isProviderOnline ? 'success' : 'neutral'}
          />
        </View>

        {isProviderOnline ? (
          incomingRequestsFeed.length > 0 ? (
            incomingRequestsFeed.map((req) => {
              const delta = counterDeltas[req.id] || 0;
              const customerFare = req.customerOfferedFare || req.suggestedFare || 400;
              const currentPrice = customerFare + delta;

              return (
                <View key={req.id} style={styles.incomingJobCard}>
                  {/* Passenger Info & Fare */}
                  <View style={styles.jobCustomerRow}>
                    <View style={styles.customerAvatar}>
                      <Ionicons name="person" size={22} color={Colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={styles.customerName}>{req.customerName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text style={styles.customerRating}>5.0 ★</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.jobDistance}>{req.estimatedDistanceKm || 5.2} km trip</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.jobDuration}>{req.estimatedDurationMinutes || 15} mins</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.fareHighlight}>Rs. {customerFare}</Text>
                      <Text style={styles.fareSubText}>Passenger Offer</Text>
                    </View>
                  </View>

                  {/* Route Visualizer */}
                  <View style={styles.routeContainer}>
                    <View style={styles.routePoint}>
                      <View style={styles.greenCircle} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeTypeLabel}>PICKUP</Text>
                        <Text numberOfLines={1} style={styles.routeText}>
                          {req.pickupAddressText}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={styles.redSquare} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeTypeLabel}>DROPOFF</Text>
                        <Text numberOfLines={1} style={styles.routeText}>
                          {req.dropoffAddressText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* inDrive Bargaining / Counter-Offer Controls */}
                  <View style={styles.counterOfferSection}>
                    <Text style={styles.counterTitle}>Bargain / Counter Offer</Text>
                    <View style={styles.counterPillsRow}>
                      {[0, 30, 50, 100].map((d) => {
                        const price = customerFare + d;
                        const isSelected = delta === d;
                        return (
                          <TouchableOpacity
                            key={d}
                            onPress={() =>
                              setCounterDeltas((prev) => ({ ...prev, [req.id]: d }))
                            }
                            style={[styles.counterPill, isSelected && styles.counterPillSelected]}
                          >
                            <Text style={[styles.counterPillText, isSelected && { color: '#10B981', fontWeight: '800' }]}>
                              {d === 0 ? `Rs. ${price} (Ask)` : `+${d} (Rs. ${price})`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Action Buttons: Accept / Counter / Decline */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      onPress={() => providerDeclineJob(req.id)}
                      style={styles.declineButton}
                    >
                      <Ionicons name="close" size={18} color="#EF4444" />
                      <Text style={styles.declineButtonText}>Pass</Text>
                    </TouchableOpacity>

                    {delta > 0 ? (
                      <TouchableOpacity
                        onPress={() => handleSendCounter(req, currentPrice)}
                        style={styles.counterSubmitButton}
                      >
                        <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                        <Text style={styles.counterSubmitText}>
                          Counter Rs. {currentPrice}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(req, customerFare)}
                        style={styles.acceptButton}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>
                          Accept for Rs. {customerFare}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyFeedBox}>
              <Ionicons name="radio-outline" size={48} color="#475569" />
              <Text style={styles.emptyFeedTitle}>Radar Scanning for Rides</Text>
              <Text style={styles.emptyFeedSub}>
                Waiting for nearby passenger ride requests. Create a ride in Customer Mode to test live inDrive dispatch!
              </Text>
            </View>
          )
        ) : (
          <View style={styles.emptyFeedBox}>
            <Ionicons name="moon-outline" size={48} color="#475569" />
            <Text style={styles.emptyFeedTitle}>You are Currently Offline</Text>
            <Text style={styles.emptyFeedSub}>
              Turn the Online switch above to start receiving ride dispatches.
            </Text>
            <TouchableOpacity
              onPress={toggleProviderOnline}
              style={styles.goOnlineBtn}
            >
              <Text style={styles.goOnlineBtnText}>GO ONLINE NOW</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  modeSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  activeRideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#10B981',
    ...Shadows.md,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  activeRideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  activeRideSub: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 2,
  },
  navActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  navActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  cardOnline: {
    backgroundColor: '#1E293B',
    borderColor: '#059669',
  },
  cardOffline: {
    backgroundColor: '#1E293B',
    borderColor: '#475569',
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
    backgroundColor: '#10B981',
  },
  dotGray: {
    backgroundColor: '#64748B',
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statusCardSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
  },
  demandCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  demandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  demandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  hotspotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hotspotPill: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  hotspotArea: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  hotspotSurge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 2,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pulseRadar: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  incomingJobCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
    ...Shadows.md,
  },
  jobCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  customerRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#64748B',
  },
  jobDistance: {
    fontSize: 12,
    color: '#94A3B8',
  },
  jobDuration: {
    fontSize: 12,
    color: '#94A3B8',
  },
  fareHighlight: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
  },
  fareSubText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  routeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greenCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  redSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  routeTypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#334155',
    marginLeft: 4,
    marginVertical: 2,
  },
  counterOfferSection: {
    marginBottom: Spacing.md,
  },
  counterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: Spacing.xs,
  },
  counterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  counterPillSelected: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  counterPillText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 4,
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    gap: 6,
  },
  counterSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyFeedBox: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: Spacing.md,
  },
  emptyFeedSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  goOnlineBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  goOnlineBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
