import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { VehicleCategory, VehicleEstimate } from '@superapp/types';
import { calculateHaversineDistanceKm, PAKISTANI_LANDMARKS } from '@superapp/maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { InteractiveMap } from '../../src/components/InteractiveMap';
import { LocationSearchModal } from '../../src/components/LocationSearchModal';
import { DriverProfileModal } from '../../src/components/DriverProfileModal';
import { apiClient } from '../../src/services/apiClient';

interface InDriveBid {
  id: string;
  providerId: string;
  driverName: string;
  rating: number;
  tripsCount: number;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  offeredFare: number;
  originalFare?: number;
  isCounterBid?: boolean;
  etaMinutes: number;
  distanceKm: number;
  secondsRemaining: number;
  totalSeconds: number;
}

export default function RideBookingScreen() {
  const router = useRouter();
  const {
    pickupLocation,
    dropoffLocation,
    setPickup,
    setDropoff,
    selectedVehicle,
    setSelectedVehicle,
    activeRide,
    acceptOffer,
    cancelActiveRide,
    updateCustomerOfferedFare,
    currentUser,
    driverProfiles,
  } = useAppStore();

  const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
  const [estimates, setEstimates] = useState<VehicleEstimate[]>([]);
  const [offeredFare, setOfferedFare] = useState<number>(450);
  const [isSearchingDrivers, setIsSearchingDrivers] = useState(false);
  const [searchModalMode, setSearchModalMode] = useState<'PICKUP' | 'DROPOFF' | null>(null);
  const [selectedDriverForProfile, setSelectedDriverForProfile] = useState<string | null>(null);
  const [realRoadMetrics, setRealRoadMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);

  // inDrive Dynamic Floating Bids State (Vertical Stacking & Staggered Incoming)
  const [activeBids, setActiveBids] = useState<InDriveBid[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const staggeredTimeoutsRef = useRef<any[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Dynamic road distance via Haversine
  const dynamicDistanceKm = calculateHaversineDistanceKm(
    { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
    { latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude }
  );

  // Handle draggable pickup pin or map tap placement
  const handlePickupMoved = (coords: { latitude: number; longitude: number }) => {
    const match = PAKISTANI_LANDMARKS.find((l) => {
      const dLat = Math.abs(l.coordinates.latitude - coords.latitude);
      const dLng = Math.abs(l.coordinates.longitude - coords.longitude);
      return dLat < 0.009 && dLng < 0.009;
    });
    const name = match
      ? `${match.name}, Karachi`
      : `Pinned Pickup (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
    setPickup(name, coords.latitude, coords.longitude);
  };

  // Handle draggable dropoff pin or map tap placement
  const handleDropoffMoved = (coords: { latitude: number; longitude: number }) => {
    const match = PAKISTANI_LANDMARKS.find((l) => {
      const dLat = Math.abs(l.coordinates.latitude - coords.latitude);
      const dLng = Math.abs(l.coordinates.longitude - coords.longitude);
      return dLat < 0.009 && dLng < 0.009;
    });
    const name = match
      ? `${match.name}, Karachi`
      : `Pinned Dropoff (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
    setDropoff(name, coords.latitude, coords.longitude);
  };

  // Live dynamic fetch from backend API on mount or coordinate change
  useEffect(() => {
    async function loadLiveEstimates() {
      setIsLoadingEstimates(true);
      try {
        const res = await apiClient.getEstimates({
          pickupLatitude: pickupLocation.latitude,
          pickupLongitude: pickupLocation.longitude,
          dropoffLatitude: dropoffLocation.latitude,
          dropoffLongitude: dropoffLocation.longitude,
        });
        if (res && res.estimates && res.estimates.length > 0) {
          setEstimates(res.estimates);
          const sel = res.estimates.find((e) => e.vehicleCategory === selectedVehicle);
          if (sel) {
            setOfferedFare(sel.fareEstimate.totalFare);
          }
        }
      } catch (err) {
        console.warn('Live API fallback to standard estimates:', err);
      } finally {
        setIsLoadingEstimates(false);
      }
    }
    loadLiveEstimates();
  }, [pickupLocation, dropoffLocation]);

  const handleVehicleSelect = (category: VehicleCategory) => {
    setSelectedVehicle(category);
    const sel = estimates.find((e) => e.vehicleCategory === category);
    if (sel) {
      setOfferedFare(sel.fareEstimate.totalFare);
    }
  };

  // inDrive Staggered Driver Bidding (Driver A pops up, then Driver B pops up ABOVE it, then Driver C)
  const startStaggeredDriverBidding = (targetFare: number) => {
    setActiveBids([]);
    showToast(`Radar active: Broadcasting Rs. ${targetFare} to Karachi drivers...`);

    // Clear any previous scheduled incoming bids
    staggeredTimeoutsRef.current.forEach((t) => clearTimeout(t));
    staggeredTimeoutsRef.current = [];

    // 1. Driver A (Tariq) pops up at t = 1.8s
    const t1 = setTimeout(() => {
      if (!useAppStore.getState().activeRide && !isSearchingDrivers) return;
      const bidA: InDriveBid = {
        id: `bid-tariq-${Date.now()}`,
        providerId: 'prov-driver-001',
        driverName: 'Tariq Mehmood',
        rating: 4.9,
        tripsCount: 342,
        vehicleModel: 'Toyota Corolla GLI',
        vehiclePlate: 'KHI-9821',
        vehicleColor: 'White',
        offeredFare: targetFare + 30,
        etaMinutes: 3,
        distanceKm: 1.4,
        secondsRemaining: 15,
        totalSeconds: 15,
      };
      setActiveBids((prev) => [bidA, ...prev]);
      showToast(`⚡ Tariq Mehmood placed an offer: Rs. ${targetFare + 30}`);
    }, 1800);
    staggeredTimeoutsRef.current.push(t1);

    // 2. Driver B (Asif) pops up ABOVE Tariq at t = 4.8s (3s later)
    const t2 = setTimeout(() => {
      if (!useAppStore.getState().activeRide && !isSearchingDrivers) return;
      const bidB: InDriveBid = {
        id: `bid-asif-${Date.now()}`,
        providerId: 'prov-driver-002',
        driverName: 'Muhammad Asif',
        rating: 4.8,
        tripsCount: 820,
        vehicleModel: 'Suzuki Alto VXR',
        vehiclePlate: 'KHI-5541',
        vehicleColor: 'Silver',
        offeredFare: Math.max(100, targetFare - 20),
        etaMinutes: 5,
        distanceKm: 2.1,
        secondsRemaining: 15,
        totalSeconds: 15,
      };
      setActiveBids((prev) => [bidB, ...prev]); // Prepends above Driver A!
      showToast(`⚡ Muhammad Asif placed an offer: Rs. ${Math.max(100, targetFare - 20)}`);
    }, 4800);
    staggeredTimeoutsRef.current.push(t2);

    // 3. Driver C (Kamran) pops up ABOVE Asif & Tariq at t = 8.8s (4s later)
    const t3 = setTimeout(() => {
      if (!useAppStore.getState().activeRide && !isSearchingDrivers) return;
      const bidC: InDriveBid = {
        id: `bid-kamran-${Date.now()}`,
        providerId: 'prov-driver-003',
        driverName: 'Kamran Khan',
        rating: 4.9,
        tripsCount: 510,
        vehicleModel: 'Honda City 1.5',
        vehiclePlate: 'KHI-3209',
        vehicleColor: 'Grey',
        offeredFare: targetFare + 10,
        etaMinutes: 4,
        distanceKm: 1.8,
        secondsRemaining: 15,
        totalSeconds: 15,
      };
      setActiveBids((prev) => [bidC, ...prev]); // Prepends above previous bids!
      showToast(`⚡ Kamran Khan placed an offer: Rs. ${targetFare + 10}`);
    }, 8800);
    staggeredTimeoutsRef.current.push(t3);
  };

  // Dynamic Ride Request submission to Backend API
  const handleRequestRide = async () => {
    setIsSearchingDrivers(true);
    try {
      const newRequest = await apiClient.createRideRequest({
        customerId: currentUser.id,
        pickupLatitude: pickupLocation.latitude,
        pickupLongitude: pickupLocation.longitude,
        pickupAddressText: pickupLocation.name,
        dropoffLatitude: dropoffLocation.latitude,
        dropoffLongitude: dropoffLocation.longitude,
        dropoffAddressText: dropoffLocation.name,
        vehicleCategory: selectedVehicle,
        customerOfferedFare: offeredFare,
      });

      useAppStore.setState({ activeRide: newRequest });
    } catch (error) {
      useAppStore.getState().createRideRequest(offeredFare);
    }
    startStaggeredDriverBidding(offeredFare);
  };

  // Independent timer tick for each active bid card (1s tick)
  useEffect(() => {
    if (!activeRide && !isSearchingDrivers) return;

    const interval = setInterval(() => {
      setActiveBids((prevBids) => {
        if (prevBids.length === 0) return prevBids;

        const updated: InDriveBid[] = [];

        for (const bid of prevBids) {
          if (bid.secondsRemaining > 1) {
            // Decrement this specific card's timer
            updated.push({
              ...bid,
              secondsRemaining: bid.secondsRemaining - 1,
            });
          } else {
            // This specific card expired!
            showToast(`Offer from ${bid.driverName} expired. Driver reconsidering...`);

            // Schedule driver to reconsider and send lower counter-bid after 4.0s
            setTimeout(() => {
              if (!useAppStore.getState().activeRide) return;
              const loweredFare = Math.max(100, bid.offeredFare - 40);
              const counterBid: InDriveBid = {
                ...bid,
                id: `bid-rebid-${Date.now()}-${bid.providerId}`,
                offeredFare: loweredFare,
                originalFare: bid.offeredFare,
                isCounterBid: true,
                secondsRemaining: 15,
                totalSeconds: 15,
              };

              // Counter-bid pops up at the TOP of the stack!
              setActiveBids((current) => [
                counterBid,
                ...current.filter((b) => b.providerId !== bid.providerId),
              ]);
              showToast(`🔥 ${bid.driverName} lowered his fare: Rs. ${loweredFare}!`);
            }, 4000);
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRide, isSearchingDrivers]);

  // Handle user tapping '✕ Decline' on a specific bid card
  const handleDeclineBid = (bid: InDriveBid) => {
    // 1. Immediately dismiss only this specific card
    setActiveBids((prev) => prev.filter((b) => b.id !== bid.id));
    showToast(`✕ Declined ${bid.driverName}'s offer of Rs. ${bid.offeredFare}. Reconsidering...`);

    // 2. That same driver reconsiders and sends a lower counter-bid 3.5s later at the top of the stack
    setTimeout(() => {
      if (!useAppStore.getState().activeRide) return;

      const loweredFare = Math.max(100, bid.offeredFare - 40);
      const counterBid: InDriveBid = {
        ...bid,
        id: `bid-counter-${Date.now()}-${bid.providerId}`,
        offeredFare: loweredFare,
        originalFare: bid.offeredFare,
        isCounterBid: true,
        secondsRemaining: 15,
        totalSeconds: 15,
      };

      // Prepends to the top of the stack!
      setActiveBids((current) => [
        counterBid,
        ...current.filter((b) => b.providerId !== bid.providerId),
      ]);
      showToast(`🔥 ${bid.driverName} lowered his fare to Rs. ${loweredFare}!`);
    }, 3500);
  };

  // Handle user tapping quick fare raise (+Rs. 20, +Rs. 50)
  const handleRaiseFare = (delta: number) => {
    const newFare = offeredFare + delta;
    setOfferedFare(newFare);
    updateCustomerOfferedFare(newFare);
    showToast(`Raised your target offer to Rs. ${newFare}! Drivers alerted...`);

    // Immediately trigger active drivers to adjust their bids
    setTimeout(() => {
      if (!useAppStore.getState().activeRide) return;
      setActiveBids((current) =>
        current.map((b) => ({
          ...b,
          offeredFare: Math.min(b.offeredFare, newFare),
          secondsRemaining: 15,
        }))
      );
    }, 1200);
  };

  // Handle user accepting an inDrive offer
  const handleAcceptBid = async (bid: InDriveBid) => {
    try {
      if (activeRide) {
        await apiClient.acceptOffer(activeRide.id, bid.id);
      }
    } catch (e) {
      console.warn('Using local store acceptance fallback');
    }
    acceptOffer(bid.id, {
      providerId: bid.providerId,
      providerName: bid.driverName,
      offeredFare: bid.offeredFare,
    });
    router.push('/(customer)/ride-tracking');
  };

  const handleCancelSearch = () => {
    staggeredTimeoutsRef.current.forEach((t) => clearTimeout(t));
    cancelActiveRide();
    setIsSearchingDrivers(false);
    setActiveBids([]);
    setToastMessage(null);
  };

  const isBroadcasting = !!activeRide || isSearchingDrivers;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => {
            if (isBroadcasting) {
              handleCancelSearch();
            } else {
              router.back();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.navTitle}>
            {isBroadcasting ? 'Finding Drivers in Karachi' : 'Book a Ride'}
          </Text>
          {isBroadcasting && (
            <View style={styles.broadcastingPill}>
              <View style={styles.pulsingBroadcastDot} />
              <Text style={styles.broadcastingPillText}>Radar Active • inDrive Bidding</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* 1. MAP-DOMINANT CANVAS */}
      <View style={isBroadcasting ? styles.mapContainerFullscreen : styles.mapContainer}>
        <InteractiveMap
          pickupLat={pickupLocation.latitude}
          pickupLng={pickupLocation.longitude}
          dropoffLat={dropoffLocation.latitude}
          dropoffLng={dropoffLocation.longitude}
          pickupTitle={pickupLocation.name}
          dropoffTitle={dropoffLocation.name}
          isSearching={isBroadcasting}
          onPickupMoved={handlePickupMoved}
          onDropoffMoved={handleDropoffMoved}
          onRouteCalculated={setRealRoadMetrics}
          height="100%"
        />

        {/* FLOATING ROUTE OVERVIEW PILL (OVER MAP) */}
        <View style={styles.floatingRoutePill}>
          <View style={styles.dotGreen} />
          <Text numberOfLines={1} style={styles.floatingRouteText}>
            {pickupLocation.name.split(',')[0]}
          </Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
          <View style={styles.squareRed} />
          <Text numberOfLines={1} style={styles.floatingRouteText}>
            {dropoffLocation.name.split(',')[0]}
          </Text>
          {realRoadMetrics && (
            <Text style={styles.floatingEtaBadge}>{realRoadMetrics.durationMins}m</Text>
          )}
        </View>

        {/* FLOATING STATUS TOAST NOTIFICATION OVER MAP */}
        {toastMessage && (
          <View style={styles.floatingToastWrap}>
            <View style={styles.floatingToast}>
              <Ionicons name="notifications" size={14} color="#FFFFFF" />
              <Text style={styles.floatingToastText}>{toastMessage}</Text>
            </View>
          </View>
        )}

        {/* 2. inDrive FLOATING BID CARDS (VERTICALLY STACKED OVER MAP CANVAS) */}
        {isBroadcasting && (
          <View style={styles.floatingBiddingContainer}>
            {activeBids.length > 0 ? (
              <ScrollView
                style={styles.cardsScroll}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                showsVerticalScrollIndicator={false}
              >
                {activeBids.map((bid) => (
                  <View key={bid.id} style={styles.inDriveCard}>
                    {/* A. Animated Countdown Progress Bar Line at top of each card */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.max(3, (bid.secondsRemaining / bid.totalSeconds) * 100)}%`,
                            backgroundColor:
                              bid.secondsRemaining <= 4 ? '#EF4444' : Colors.primary,
                          },
                        ]}
                      />
                    </View>

                    {/* B. Header: Timer Chip + Counter-Offer Badge + Distance */}
                    <View style={styles.bidMetaHeader}>
                      <View style={styles.timerChip}>
                        <Ionicons
                          name="timer-outline"
                          size={13}
                          color={bid.secondsRemaining <= 4 ? '#EF4444' : Colors.primary}
                        />
                        <Text
                          style={[
                            styles.timerChipText,
                            bid.secondsRemaining <= 4 && { color: '#EF4444' },
                          ]}
                        >
                          {bid.secondsRemaining}s remaining
                        </Text>
                      </View>

                      {bid.isCounterBid && bid.originalFare && (
                        <View style={styles.counterBidPill}>
                          <Text style={styles.counterBidPillText}>
                            🔥 LOWERED (-Rs. {bid.originalFare - bid.offeredFare})
                          </Text>
                        </View>
                      )}

                      <Text style={styles.driverDistanceMeta}>
                        {bid.distanceKm} km • ~{bid.etaMinutes}m away
                      </Text>
                    </View>

                    {/* C. Driver Details & Vehicle Info (Tap to view Driver Profile) */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedDriverForProfile(bid.providerId)}
                      style={styles.driverMainRow}
                    >
                      <View style={styles.driverAvatar}>
                        <Ionicons name="person" size={20} color={Colors.primary} />
                        <View style={styles.verifiedShield}>
                          <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                        </View>
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.driverName}>{bid.driverName}</Text>
                          <View style={styles.profileBadge}>
                            <Text style={styles.profileBadgeText}>Profile</Text>
                          </View>
                        </View>
                        <Text style={styles.driverSubMeta}>
                          ⭐ {driverProfiles[bid.providerId]?.ratingAverage.toFixed(1) || bid.rating} ({driverProfiles[bid.providerId]?.totalTrips || bid.tripsCount}) • {bid.vehicleModel}
                        </Text>
                      </View>

                      {/* Price Block */}
                      <View style={{ alignItems: 'flex-end' }}>
                        {bid.originalFare && bid.originalFare > bid.offeredFare && (
                          <Text style={styles.strikethroughFare}>Rs. {bid.originalFare}</Text>
                        )}
                        <Text style={styles.currentFareText}>Rs. {bid.offeredFare}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* D. inDrive Action Buttons (✕ Decline | Accept) */}
                    <View style={styles.biddingActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDeclineBid(bid)}
                        style={styles.declineButton}
                      >
                        <Ionicons name="close" size={16} color="#DC2626" />
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleAcceptBid(bid)}
                        style={styles.acceptButton}
                      >
                        <Text style={styles.acceptButtonText}>
                          Accept • Rs. {bid.offeredFare}
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              /* Radar scanning state when no bids are active */
              <View style={styles.radarScanningCard}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.radarScanningTitle}>
                    Broadcasting Offer: Rs. {offeredFare}
                  </Text>
                  <Text style={styles.radarScanningSub}>
                    Nearby Karachi drivers will send offers in seconds...
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 3. inDrive FIXED BOTTOM BAR (BARGAIN CONTROLS) */}
        {isBroadcasting && (
          <View style={styles.inDriveBottomBar}>
            <View style={styles.targetOfferWrap}>
              <Text style={styles.targetOfferMicro}>YOUR OFFER</Text>
              <Text style={styles.targetOfferAmount}>Rs. {offeredFare}</Text>
            </View>

            <View style={styles.quickRaiseGroup}>
              <TouchableOpacity
                onPress={() => handleRaiseFare(20)}
                style={styles.quickRaisePill}
              >
                <Text style={styles.quickRaisePillText}>+Rs. 20</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRaiseFare(50)}
                style={styles.quickRaisePill}
              >
                <Text style={styles.quickRaisePillText}>+Rs. 50</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleCancelSearch} style={styles.cancelSearchPill}>
              <Text style={styles.cancelSearchPillText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 4. PRE-BOOKING BOTTOM SHEET (WHEN NOT SEARCHING) */}
      {!isBroadcasting && (
        <View style={styles.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* Interactive Pickup & Destination Selectors */}
            <View style={styles.routeHeaderPill}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchModalMode('PICKUP')}
                style={styles.routePillItem}
              >
                <View style={styles.dotGreen} />
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Text style={styles.pillMicroLabel}>PICKUP (TAP TO SCAN GPS)</Text>
                  <Text numberOfLines={1} style={styles.routePillText}>
                    {pickupLocation.name.split(',')[0]}
                  </Text>
                </View>
                <Ionicons name="create-outline" size={14} color={Colors.primary} />
              </TouchableOpacity>

              <View style={styles.pillDivider} />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchModalMode('DROPOFF')}
                style={styles.routePillItem}
              >
                <View style={styles.squareRed} />
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Text style={styles.pillMicroLabel}>DROPOFF (TAP OR DRAG PIN)</Text>
                  <Text numberOfLines={1} style={styles.routePillText}>
                    {dropoffLocation.name.split(',')[0]}
                  </Text>
                </View>
                <Ionicons name="create-outline" size={14} color={Colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Real Google Maps Turn-by-Turn Road Distance & ETA Badge */}
            <View style={styles.distanceBadgeRow}>
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-circle" size={13} color="#2563EB" />
                <Text style={styles.routeDistanceText}>
                  {realRoadMetrics
                    ? `Road Route: ${realRoadMetrics.distanceKm} km • ~${realRoadMetrics.durationMins} mins`
                    : `${dynamicDistanceKm.toFixed(1)} km via Karachi Streets`}
                </Text>
              </View>
              <Text style={styles.mapTipText}>📍 Drag marker on map to reposition</Text>
            </View>

            {/* VEHICLE SELECTION & inDrive BARGAINING */}
            <Text style={styles.sheetSectionTitle}>Select Vehicle & Name Your Price</Text>

            {isLoadingEstimates ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 6 }}>
                  Calculating fares via Karachi live pricing engine...
                </Text>
              </View>
            ) : (
              <View style={styles.vehicleRowScroll}>
                {[
                  { cat: VehicleCategory.BIKE, name: 'Bike', fare: 180, eta: '3m', icon: 'motorbike' },
                  { cat: VehicleCategory.RICKSHAW, name: 'Rickshaw', fare: 260, eta: '5m', icon: 'rickshaw' },
                  { cat: VehicleCategory.CAR, name: 'Car Eco', fare: 360, eta: '4m', icon: 'car-side' },
                  { cat: VehicleCategory.AC_CAR, name: 'AC Premium', fare: 450, eta: '6m', icon: 'snowflake' },
                ].map((v) => {
                  const isSelected = selectedVehicle === v.cat;
                  return (
                    <TouchableOpacity
                      key={v.cat}
                      activeOpacity={0.85}
                      onPress={() => handleVehicleSelect(v.cat)}
                      style={[styles.vehicleChip, isSelected && styles.vehicleChipSelected]}
                    >
                      <MaterialCommunityIcons
                        name={v.icon as any}
                        size={24}
                        color={isSelected ? Colors.primary : Colors.textPrimary}
                      />
                      <Text style={[styles.vehicleChipTitle, isSelected && { color: Colors.primary }]}>
                        {v.name}
                      </Text>
                      <Text style={styles.vehicleChipFare}>Rs. {v.fare}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* inDrive Target Fare Stepper */}
            <View style={styles.bargainingCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bargainLabel}>Your Target Offer (PKR)</Text>
                <Text style={styles.bargainHint}>Nearby drivers will bid against this price</Text>
              </View>
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  onPress={() => setOfferedFare((prev) => Math.max(100, prev - 20))}
                  style={styles.stepButton}
                >
                  <Ionicons name="remove" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepPrice}>Rs. {offeredFare}</Text>
                <TouchableOpacity
                  onPress={() => setOfferedFare((prev) => prev + 20)}
                  style={styles.stepButton}
                >
                  <Ionicons name="add" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Broadcast Offer Button */}
            <Button
              title={`Broadcast Ride Offer • Rs. ${offeredFare}`}
              onPress={handleRequestRide}
              style={{ marginTop: Spacing.sm }}
            />
          </ScrollView>
        </View>
      )}

      {/* Location Search Modal with GPS Scan & Manual Karachi Autocomplete */}
      <LocationSearchModal
        visible={searchModalMode !== null}
        title={searchModalMode === 'PICKUP' ? 'Set Pickup Location' : 'Choose Dropoff Destination'}
        currentAddress={searchModalMode === 'PICKUP' ? pickupLocation.name : dropoffLocation.name}
        onSelectLocation={(loc) => {
          if (searchModalMode === 'PICKUP') {
            setPickup(loc.name, loc.latitude, loc.longitude);
          } else {
            setDropoff(loc.name, loc.latitude, loc.longitude);
          }
          setSearchModalMode(null);
        }}
        onClose={() => setSearchModalMode(null)}
      />

      {/* Driver Profile & Credentials Modal */}
      <DriverProfileModal
        visible={selectedDriverForProfile !== null}
        profile={selectedDriverForProfile ? driverProfiles[selectedDriverForProfile] || null : null}
        onClose={() => setSelectedDriverForProfile(null)}
        onAcceptOffer={
          selectedDriverForProfile && activeBids.find((b) => b.providerId === selectedDriverForProfile)
            ? () => {
                const targetBid = activeBids.find((b) => b.providerId === selectedDriverForProfile);
                if (targetBid) {
                  setSelectedDriverForProfile(null);
                  handleAcceptBid(targetBid);
                }
              }
            : undefined
        }
        acceptFare={
          activeBids.find((b) => b.providerId === selectedDriverForProfile)?.offeredFare
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingBottom: Platform.OS === 'web' ? 70 : 0,
  },
  topNav: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  broadcastingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  pulsingBroadcastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  broadcastingPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  mapContainer: {
    flex: 1,
    minHeight: 160,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapContainerFullscreen: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  floatingRoutePill: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    gap: 6,
    ...Shadows.md,
  },
  floatingRouteText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  floatingEtaBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  floatingToastWrap: {
    position: 'absolute',
    top: 50,
    left: 14,
    right: 14,
    zIndex: 50,
    alignItems: 'center',
  },
  floatingToast: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    ...Shadows.lg,
  },
  floatingToastText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // inDrive Floating Bidding Container (Vertically Stacked Cards over Map Canvas)
  floatingBiddingContainer: {
    position: 'absolute',
    bottom: 64,
    left: 12,
    right: 12,
    maxHeight: 340,
    zIndex: 90,
  },
  cardsScroll: {
    maxHeight: 340,
  },
  inDriveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Shadows.lg,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: '#F1F5F9',
  },
  progressBarFill: {
    height: '100%',
  },
  bidMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 2,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  timerChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  counterBidPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  counterBidPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  driverDistanceMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  driverMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  driverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  verifiedShield: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  driverName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.round,
  },
  profileBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  driverSubMeta: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
    fontWeight: '600',
  },
  strikethroughFare: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  currentFareText: {
    fontSize: 17.5,
    fontWeight: '900',
    color: Colors.primary,
  },
  biddingActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 36,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  acceptButton: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 36,
    borderRadius: BorderRadius.md,
    gap: 6,
    ...Shadows.sm,
  },
  acceptButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  radarScanningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.md,
  },
  radarScanningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  radarScanningSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // inDrive Fixed Bottom Bar
  inDriveBottomBar: {
    position: 'absolute',
    bottom: 6,
    left: 12,
    right: 12,
    zIndex: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.md,
  },
  targetOfferWrap: {
    marginRight: 6,
  },
  targetOfferMicro: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  targetOfferAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  quickRaiseGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  quickRaisePill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  quickRaisePillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  cancelSearchPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelSearchPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.danger,
  },
  // Bottom Sheet (when not searching)
  bottomSheet: {
    maxHeight: 320,
    flexShrink: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.lg,
  },
  sheetContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  routeHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.xs,
    gap: 6,
  },
  routePillItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillMicroLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  mapTipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  squareRed: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: Colors.danger,
  },
  routePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  routeDistanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  vehicleRowScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  vehicleChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  vehicleChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  vehicleChipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  vehicleChipFare: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  bargainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bargainLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bargainHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
    paddingHorizontal: Spacing.md,
  },
});
