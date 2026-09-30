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
import { DriverRadarMap } from '../../src/components/DriverRadarMap';
import { ServiceRequest, ServiceRequestStatus } from '@superapp/types';

// Helper to calculate distance in km between two GPS coordinates
function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function estimateDriveMinutes(distanceKm: number): number {
  return Math.max(2, Math.round(distanceKm * 2.8));
}

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
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    incomingRequestsFeed[0]?.id || null
  );

  // Captain's current position (Dolmen Mall Clifton, Karachi)
  const DRIVER_POSITION = {
    latitude: 24.819,
    longitude: 67.034,
    address: 'Dolmen Mall Clifton, Karachi',
    vehicle: 'Toyota Corolla GLI (KHI-9821)',
  };

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
      {/* Top Header - Consistent with Customer View */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Assalam-o-Alaikum,</Text>
          <Text style={styles.userNameText}>Captain Tariq Mehmood</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.roleSwitchBtn}>
            <Ionicons name="swap-horizontal" size={15} color={Colors.primary} />
            <Text style={styles.roleSwitchText}>Customer Mode</Text>
          </TouchableOpacity>
        </View>
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
                Status: {activeRide.status} • Agreed Fare: Rs. {activeRide.finalAgreedFare}
              </Text>
            </View>
            <View style={styles.navActionPill}>
              <Text style={styles.navActionText}>Open Navigation</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Captain Location Bar */}
        <View style={styles.locationBar}>
          <View style={styles.locationIconBox}>
            <MaterialCommunityIcons name="steering" size={18} color={Colors.primary} />
          </View>
          <View style={styles.locationTextBox}>
            <Text style={styles.locationLabel}>CAPTAIN CURRENT LOCATION</Text>
            <Text numberOfLines={1} style={styles.locationAddress}>
              {DRIVER_POSITION.address} • {DRIVER_POSITION.vehicle}
            </Text>
          </View>
          <View style={styles.gpsBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS Active</Text>
          </View>
        </View>

        {/* Live Interactive Driver Radar Map */}
        <View style={styles.mapCard}>
          <DriverRadarMap
            driverLat={DRIVER_POSITION.latitude}
            driverLng={DRIVER_POSITION.longitude}
            driverAddress={DRIVER_POSITION.address}
            requests={incomingRequestsFeed}
            selectedRequestId={selectedRequestId}
            onSelectRequest={(id) => setSelectedRequestId(id)}
            isOnline={isProviderOnline}
            height={330}
          />
        </View>

        {/* Online / Offline Status Control Bar */}
        <View style={[styles.statusCard, isProviderOnline ? styles.cardOnline : styles.cardOffline]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isProviderOnline ? styles.dotGreen : styles.dotGray]} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.statusTitle}>
                {isProviderOnline ? 'Radar Online & Dispatching' : 'Captain Radar Paused'}
              </Text>
              <Text style={styles.statusSub}>
                {isProviderOnline
                  ? 'Showing live customer requests in Clifton, DHA & Saddar'
                  : 'Turn switch on to receive passenger ride requests'}
              </Text>
            </View>
            <Switch
              value={isProviderOnline}
              onValueChange={toggleProviderOnline}
              trackColor={{ false: '#CBD5E1', true: '#B3F5D1' }}
              thumbColor={isProviderOnline ? Colors.primary : '#94A3B8'}
            />
          </View>
        </View>

        {/* Today's KPI Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>TODAY'S EARNINGS</Text>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>Rs. {providerTodayEarnings.toLocaleString()}</Text>
            <Text style={styles.metricSub}>Net take-home</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>TRIPS COMPLETED</Text>
              <Ionicons name="checkmark-done-circle-outline" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>{providerCompletedJobsCount}</Text>
            <Text style={styles.metricSub}>96% acceptance rate</Text>
          </View>
        </View>

        {/* Karachi Demand Surge Hotspots */}
        {isProviderOnline && (
          <View style={styles.demandSection}>
            <View style={styles.demandHeader}>
              <Ionicons name="flame" size={18} color="#D97706" />
              <Text style={styles.demandTitle}>Karachi High Demand Hotspots</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotspotsRow}>
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
              <View style={styles.hotspotPill}>
                <Text style={styles.hotspotArea}>Gulshan / NIPA</Text>
                <Text style={styles.hotspotSurge}>+10% Demand</Text>
              </View>
            </ScrollView>
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
              const isSelected = selectedRequestId === req.id;

              // Distance from driver to this customer's pickup
              const distToPickup = calcDistanceKm(
                DRIVER_POSITION.latitude,
                DRIVER_POSITION.longitude,
                req.pickupLatitude,
                req.pickupLongitude
              );
              const durationToPickup = estimateDriveMinutes(distToPickup);

              return (
                <TouchableOpacity
                  key={req.id}
                  activeOpacity={0.95}
                  onPress={() => setSelectedRequestId(req.id)}
                  style={[
                    styles.incomingJobCard,
                    isSelected && styles.incomingJobCardSelected,
                  ]}
                >
                  {/* Selected Indicator Banner */}
                  {isSelected && (
                    <View style={styles.selectedBanner}>
                      <Ionicons name="navigate" size={13} color={Colors.primary} />
                      <Text style={styles.selectedBannerText}>
                        Selected on Radar Map • {distToPickup} km ({durationToPickup} min away)
                      </Text>
                    </View>
                  )}

                  {/* Customer Info & Offered Fare Header */}
                  <View style={styles.jobCustomerRow}>
                    <View style={styles.customerAvatar}>
                      <Ionicons name="person" size={20} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={styles.customerName}>{req.customerName}</Text>
                      <View style={styles.ratingAndDistRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.ratingText}>5.0</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.tripMetricText}>
                          {req.estimatedDistanceKm || 5.2} km trip ({req.estimatedDurationMinutes || 16} min)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.fareBox}>
                      <Text style={styles.fareAmount}>Rs. {customerFare}</Text>
                      <Text style={styles.fareLabel}>Passenger Offer</Text>
                    </View>
                  </View>

                  {/* Proximity / Distance to Customer Chip */}
                  <View style={styles.proximityRow}>
                    <View style={styles.proximityBadge}>
                      <MaterialCommunityIcons name="car-clock" size={15} color="#2563EB" />
                      <Text style={styles.proximityText}>
                        Distance to Pickup: <Text style={styles.boldText}>{distToPickup} km</Text> • ~{durationToPickup} min drive
                      </Text>
                    </View>
                  </View>

                  {/* Route Visualizer */}
                  <View style={styles.routeBox}>
                    <View style={styles.routeRow}>
                      <View style={styles.pickupDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
                        <Text numberOfLines={1} style={styles.routeAddress}>
                          {req.pickupAddressText}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.routeLine} />

                    <View style={styles.routeRow}>
                      <View style={styles.dropoffSquare} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeLabel}>DROPOFF DESTINATION</Text>
                        <Text numberOfLines={1} style={styles.routeAddress}>
                          {req.dropoffAddressText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* inDrive Bargaining Counter Pills */}
                  <View style={styles.bargainSection}>
                    <Text style={styles.bargainHeader}>Bargain / Counter-Offer:</Text>
                    <View style={styles.counterPillsRow}>
                      <TouchableOpacity
                        onPress={() => setCounterDeltas((prev) => ({ ...prev, [req.id]: 0 }))}
                        style={[styles.counterPill, delta === 0 && styles.counterPillActive]}
                      >
                        <Text style={[styles.counterPillText, delta === 0 && styles.counterPillTextActive]}>
                          Rs. {customerFare} (Ask)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setCounterDeltas((prev) => ({ ...prev, [req.id]: 30 }))}
                        style={[styles.counterPill, delta === 30 && styles.counterPillActive]}
                      >
                        <Text style={[styles.counterPillText, delta === 30 && styles.counterPillTextActive]}>
                          +30 (Rs. {customerFare + 30})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setCounterDeltas((prev) => ({ ...prev, [req.id]: 50 }))}
                        style={[styles.counterPill, delta === 50 && styles.counterPillActive]}
                      >
                        <Text style={[styles.counterPillText, delta === 50 && styles.counterPillTextActive]}>
                          +50 (Rs. {customerFare + 50})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setCounterDeltas((prev) => ({ ...prev, [req.id]: 100 }))}
                        style={[styles.counterPill, delta === 100 && styles.counterPillActive]}
                      >
                        <Text style={[styles.counterPillText, delta === 100 && styles.counterPillTextActive]}>
                          +100 (Rs. {customerFare + 100})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      onPress={() => providerDeclineJob(req.id)}
                      style={styles.passBtn}
                    >
                      <Ionicons name="close" size={16} color="#DC2626" />
                      <Text style={styles.passBtnText}>Pass</Text>
                    </TouchableOpacity>

                    {delta > 0 ? (
                      <TouchableOpacity
                        onPress={() => handleSendCounter(req, currentPrice)}
                        style={styles.counterActionBtn}
                      >
                        <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                        <Text style={styles.counterActionBtnText}>
                          Send Counter Rs. {currentPrice}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(req, currentPrice)}
                        style={styles.acceptActionBtn}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.acceptActionBtnText}>
                          Accept for Rs. {currentPrice} & Navigate
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyFeedBox}>
              <Ionicons name="radio-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyFeedTitle}>Radar Scanning for Rides</Text>
              <Text style={styles.emptyFeedSub}>
                Waiting for nearby passenger ride requests. Create a ride in Customer Mode to test live inDrive dispatch!
              </Text>
            </View>
          )
        ) : (
          <View style={styles.emptyFeedBox}>
            <Ionicons name="moon-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyFeedTitle}>You are Currently Offline</Text>
            <Text style={styles.emptyFeedSub}>
              Turn the Online switch above to start receiving ride dispatches.
            </Text>
            <TouchableOpacity
              onPress={toggleProviderOnline}
              style={styles.goOnlineBtn}
            >
              <Text style={styles.goOnlineBtnText}>Go Online Now</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greetingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 6,
    borderWidth: 1,
    borderColor: '#B3F5D1',
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 90,
  },

  // Active Trip Shortcut Banner
  activeRideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeRideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeRideSub: {
    fontSize: 11,
    color: '#E3FCEF',
    marginTop: 2,
  },
  navActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  navActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Location Bar
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  locationTextBox: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3FCEF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  gpsText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Map Card
  mapCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },

  // Online/Offline status card
  statusCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotGray: {
    backgroundColor: '#94A3B8',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Metrics Grid
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Demand Surge Section
  demandSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  demandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  demandTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hotspotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  hotspotPill: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hotspotArea: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  hotspotSurge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2,
  },

  // Feed Header
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pulseRadar: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  // Incoming Job Card
  incomingJobCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  incomingJobCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FAFDFB',
    ...Shadows.md,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  selectedBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  jobCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingAndDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dotSeparator: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tripMetricText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  fareBox: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  fareLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Proximity Row
  proximityRow: {
    marginBottom: Spacing.sm,
  },
  proximityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  proximityText: {
    fontSize: 11,
    color: '#1E40AF',
  },
  boldText: {
    fontWeight: '800',
    color: '#1D4ED8',
  },

  // Route Box
  routeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  dropoffSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },

  // Bargain Section
  bargainSection: {
    marginBottom: Spacing.md,
  },
  bargainHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  counterPillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  counterPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  counterPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  counterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  counterPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Actions
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  passBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  passBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    gap: 6,
    ...Shadows.sm,
  },
  acceptActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  counterActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    gap: 6,
    ...Shadows.sm,
  },
  counterActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty Feed
  emptyFeedBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
    ...Shadows.sm,
  },
  emptyFeedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyFeedSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  goOnlineBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  goOnlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
