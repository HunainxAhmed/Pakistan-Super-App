import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { ServiceRequestStatus } from '@superapp/types';
import { InteractiveMap } from '../../src/components/InteractiveMap';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { DriverProfileModal } from '../../src/components/DriverProfileModal';
import { RateDriverModal } from '../../src/components/RateDriverModal';

const FREE_WAITING_SECONDS = 180; // 3 Minutes Free Grace Period
const PENALTY_RATE_PER_MINUTE = 10; // Rs. 10 PKR per Overtime Minute
const GEOFENCE_THRESHOLD_KM = 0.5; // 500 Meters (~800m diameter, realistic arrival threshold)

export default function RideTrackingScreen() {
  const router = useRouter();
  const {
    activeRide,
    cancelActiveRide,
    setDriverArrived,
    startTrip,
    updateWaitingPenalty,
    driverProfiles,
    submitDriverReview,
    waitingPenaltyAmount: storeWaitingPenalty,
    waitingOvertimeSeconds: storeOvertimeSeconds,
  } = useAppStore();

  // Safely redirect to home if there is no active ride
  useEffect(() => {
    if (!activeRide) {
      router.replace('/(customer)/home');
    }
  }, [activeRide]);

  // Initialize trip state directly from store status
  const [tripState, setTripState] = useState<'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>(() => {
    if (activeRide?.status === ServiceRequestStatus.ARRIVED) return 'ARRIVED';
    if (activeRide?.status === ServiceRequestStatus.IN_PROGRESS) return 'IN_PROGRESS';
    if (activeRide?.status === ServiceRequestStatus.COMPLETED) return 'COMPLETED';
    return 'EN_ROUTE';
  });

  const [graceSecondsRemaining, setGraceSecondsRemaining] = useState<number>(() => {
    if (storeOvertimeSeconds && storeOvertimeSeconds > 0) return 0;
    return FREE_WAITING_SECONDS;
  });
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(() => storeOvertimeSeconds || 0);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [distanceToDestinationKm, setDistanceToDestinationKm] = useState<number>(8.5);
  const [isNearDestination, setIsNearDestination] = useState<boolean>(false);

  // Sync tripState with activeRide status
  useEffect(() => {
    if (!activeRide) return;
    if (
      activeRide.status === ServiceRequestStatus.ACCEPTED ||
      activeRide.status === ServiceRequestStatus.PROVIDER_EN_ROUTE
    ) {
      setTripState('EN_ROUTE');
    } else if (activeRide.status === ServiceRequestStatus.ARRIVED) {
      setTripState('ARRIVED');
    } else if (activeRide.status === ServiceRequestStatus.IN_PROGRESS) {
      setTripState('IN_PROGRESS');
    } else if (activeRide.status === ServiceRequestStatus.COMPLETED) {
      setTripState('COMPLETED');
    }
  }, [activeRide?.id, activeRide?.status]);

  const baseFare = activeRide?.finalAgreedFare || activeRide?.customerOfferedFare || activeRide?.suggestedFare || 450;
  const overtimeMinutes = overtimeSeconds > 0 ? Math.ceil(overtimeSeconds / 60) : 0;
  const waitingPenaltyAmount = overtimeMinutes * PENALTY_RATE_PER_MINUTE;
  const totalCalculatedFare = baseFare + waitingPenaltyAmount;

  // Listen for real DRIVER_ARRIVED and DRIVER_TRIP_PROGRESS message from the InteractiveMap
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleMsg = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'DRIVER_ARRIVED') {
          handleDriverArrived();
        } else if (data && data.type === 'DRIVER_TRIP_PROGRESS') {
          const dist = Number(data.distanceToDestinationKm);
          setDistanceToDestinationKm(dist);
          setIsNearDestination(dist <= GEOFENCE_THRESHOLD_KM);
        } else if (data && data.type === 'ROUTE_CALCULATED') {
          const dist = Number(data.distanceKm);
          setDistanceToDestinationKm(dist);
          setIsNearDestination(dist <= GEOFENCE_THRESHOLD_KM);
        }
      } catch {}
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Real-time ticking timer when driver has arrived
  useEffect(() => {
    let interval: any = null;
    if (tripState === 'ARRIVED') {
      interval = setInterval(() => {
        setGraceSecondsRemaining((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Grace period ended! Start accumulating overtime seconds
            setOvertimeSeconds((ot) => {
              const newOt = ot + 1;
              const newMinutes = Math.ceil(newOt / 60);
              updateWaitingPenalty(newMinutes * PENALTY_RATE_PER_MINUTE, newOt);
              return newOt;
            });
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tripState]);

  const formatClock = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallDriver = () => {
    Alert.alert('Calling Driver', 'Connecting via Super App masked number for privacy.');
  };

  const handleSos = () => {
    Alert.alert(
      'Emergency SOS Triggered',
      'Sindh Police (15) and Super App 24/7 Operations alerted with your live location.'
    );
  };

  // Driver action simulation: Arrive at pickup
  const handleDriverArrived = () => {
    setTripState('ARRIVED');
    setDriverArrived();
  };

  // Driver action simulation: Fast forward overtime
  const handleFastForwardOvertime = () => {
    setGraceSecondsRemaining(0);
    setOvertimeSeconds(135); // Fast-forward to 2 mins 15 sec overtime (+Rs. 30 penalty)
    updateWaitingPenalty(30, 135);
  };

  // Driver action: Driver verifies customer's 4-digit PIN and starts trip
  const handleDriverVerifyPinAndStart = () => {
    setTripState('IN_PROGRESS');
    startTrip();
    Alert.alert(
      'Driver Verified PIN: 5821',
      waitingPenaltyAmount > 0
        ? `Driver confirmed customer boarding. Overtime waiting penalty of Rs. ${waitingPenaltyAmount} (${overtimeMinutes} mins) has been frozen and added to the trip fare.`
        : 'Driver confirmed customer boarding within the free 3-minute grace period! No waiting penalty applied.'
    );
  };

  const handleCompleteTrip = () => {
    setShowReceiptModal(true);
  };

  const handleFinishPaymentAndExit = () => {
    setShowReceiptModal(false);
    // After cash paid & done, open Rate & Review modal!
    setShowRateModal(true);
  };

  const handleReviewSubmit = (rating: number, comment?: string, tags?: string[]) => {
    submitDriverReview(driverId, rating, comment, tags);
    setShowRateModal(false);
    cancelActiveRide();
    Alert.alert(
      'Review Submitted!',
      `Thank you for rating ${driverName}! Your ${rating}★ review has been recorded.`
    );
    router.replace('/(customer)/home');
  };

  const handleReviewSkip = () => {
    // Totally optional - customer can skip!
    setShowRateModal(false);
    cancelActiveRide();
    router.replace('/(customer)/home');
  };

  const pickupLat = activeRide?.pickupLatitude || 24.8138;
  const pickupLng = activeRide?.pickupLongitude || 67.0305;
  const dropoffLat = activeRide?.dropoffLatitude || 24.8568;
  const dropoffLng = activeRide?.dropoffLongitude || 67.0544;

  // Real Karachi inland street coordinate for driver approach
  const [driverApproachCoords] = useState(() => ({
    latitude: pickupLat + 0.011,
    longitude: pickupLng - 0.005,
  }));

  const driverId = activeRide?.assignedProviderId || 'prov-driver-001';
  const currentDriverProfile = driverProfiles[driverId] || driverProfiles['prov-driver-001'];
  const driverName = currentDriverProfile?.name || activeRide?.assignedProviderName || 'Tariq Mehmood';
  const vehicleTitle = currentDriverProfile?.vehicle
    ? `${currentDriverProfile.vehicle.model} (${currentDriverProfile.vehicle.color})`
    : 'Toyota Corolla GLI (White)';
  const vehiclePlate = currentDriverProfile?.vehicle?.plate || 'KHI-9821';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.replace('/(customer)/home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.navTitle}>Live Trip Navigation</Text>
          <View style={styles.liveBadgeRow}>
            <View
              style={[
                styles.pulsingDot,
                tripState === 'ARRIVED' && graceSecondsRemaining === 0
                  ? styles.redDot
                  : styles.greenDot,
              ]}
            />
            <Text
              style={[
                styles.liveBadgeText,
                tripState === 'ARRIVED' && graceSecondsRemaining === 0
                  ? styles.redText
                  : styles.greenText,
              ]}
            >
              {tripState === 'EN_ROUTE'
                ? `DRIVER EN ROUTE • ~1.6 KM`
                : tripState === 'ARRIVED'
                ? graceSecondsRemaining > 0
                  ? 'DRIVER ARRIVED • FREE WAITING'
                  : 'OVERTIME PENALTY ACCUMULATING'
                : isNearDestination
                ? 'NEAR DESTINATION (< 500M)'
                : 'TRIP IN PROGRESS'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSos} style={styles.sosPill}>
          <Text style={styles.sosText}>SOS 15</Text>
        </TouchableOpacity>
      </View>

      {/* 1. MAP-DOMINANT HERO CANVAS (Customer View: No geofence ring) */}
      <View style={styles.mapContainer}>
        <InteractiveMap
          pickupLat={pickupLat}
          pickupLng={pickupLng}
          dropoffLat={dropoffLat}
          dropoffLng={dropoffLng}
          pickupTitle={activeRide?.pickupAddressText || 'Pickup Location'}
          dropoffTitle={activeRide?.dropoffAddressText || 'Dropoff Destination'}
          showUserLocation={true}
          userLat={pickupLat}
          userLng={pickupLng}
          mode="TRACKING"
          tripState={tripState}
          showGeofenceRing={false} // Ring appears only on Driver end
          drivers={[
            {
              id: 'active-driver',
              title: driverName,
              type: 'DRIVER',
              latitude: driverApproachCoords.latitude,
              longitude: driverApproachCoords.longitude,
              bearing: 55,
            },
          ]}
          onDriverArrived={handleDriverArrived}
          onTripProgress={(progress) => {
            setDistanceToDestinationKm(progress.distanceToDestinationKm);
            setIsNearDestination(progress.distanceToDestinationKm <= GEOFENCE_THRESHOLD_KM);
          }}
          height="100%"
        />
      </View>

      {/* 2. FLOATING DRIVER CARD & LIVE CONTROLS */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {/* A. EN_ROUTE PHASE */}
          {tripState === 'EN_ROUTE' && (
            <View style={styles.statusBoxGreen}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="navigate-circle" size={18} color="#059669" />
                  <Text style={styles.statusBoxTitleGreen}>
                    Driver Approaching (~2 mins away)
                  </Text>
                </View>
                <Text style={styles.statusBoxSubtitleGreen}>
                  {driverName} is driving to your pickup location. 3 minutes free waiting begins upon arrival.
                </Text>
              </View>
              <TouchableOpacity onPress={handleDriverArrived} style={styles.simPillButton}>
                <Text style={styles.simPillText}>⚡ Fast Arrive</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* B. ARRIVED - FREE GRACE PERIOD COUNTDOWN (3 MINS) */}
          {tripState === 'ARRIVED' && graceSecondsRemaining > 0 && (
            <View style={styles.statusBoxAmber}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time" size={18} color="#D97706" />
                  <Text style={styles.statusBoxTitleAmber}>
                    Driver Arrived • Free Waiting Time
                  </Text>
                </View>
                <Text style={styles.graceTimerDigits}>{formatClock(graceSecondsRemaining)}</Text>
                <Text style={styles.statusBoxSubtitleAmber}>
                  Free 3-min grace. Share PIN upon boarding to avoid Rs. 10/min penalty.
                </Text>
              </View>
            </View>
          )}

          {/* C. ARRIVED - OVERTIME WAITING PENALTY ACCUMULATING */}
          {tripState === 'ARRIVED' && graceSecondsRemaining === 0 && (
            <View style={styles.statusBoxRed}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="warning" size={18} color="#DC2626" />
                  <Text style={styles.statusBoxTitleRed}>OVERTIME WAITING PENALTY ACTIVE</Text>
                </View>
                <View style={styles.penaltyAmountBadge}>
                  <Text style={styles.penaltyAmountText}>+Rs. {waitingPenaltyAmount}</Text>
                </View>
              </View>

              <View style={styles.overtimeMetricRow}>
                <View>
                  <Text style={styles.overtimeMetricLabel}>Waiting Overtime</Text>
                  <Text style={styles.overtimeMetricValue}>
                    {formatClock(overtimeSeconds)} ({overtimeMinutes} min)
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.overtimeMetricLabel}>Penalty Rate</Text>
                  <Text style={styles.overtimeMetricValue}>Rs. 10 / min</Text>
                </View>
              </View>

              <Text style={styles.statusBoxSubtitleRed}>
                ⚠️ Driver has waited past the 3-min grace period. Penalty accumulates every minute until driver enters your PIN.
              </Text>
            </View>
          )}

          {/* D. IN_PROGRESS PHASE */}
          {tripState === 'IN_PROGRESS' && (
            <View style={styles.statusBoxBlue}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="car-sport" size={20} color="#2563EB" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.statusBoxTitleBlue}>
                    {isNearDestination
                      ? 'Arriving at Destination (< 500m away)'
                      : `Trip In Progress • ~${distanceToDestinationKm.toFixed(1)} km to dropoff`}
                  </Text>
                  <Text style={styles.statusBoxSubtitleBlue}>
                    {waitingPenaltyAmount > 0
                      ? `Overtime waiting fee of Rs. ${waitingPenaltyAmount} locked into final fare.`
                      : 'Boarded within grace period. No waiting fee applied.'}
                  </Text>
                </View>
              </View>

              {/* Visual Route Legend: Covered vs Remaining */}
              <View style={styles.routeLegendContainer}>
                <View style={styles.routeLegendItem}>
                  <View style={styles.legendDotCovered} />
                  <Text style={styles.routeLegendLabel}>Covered Path (Slate)</Text>
                </View>
                <View style={styles.routeLegendDivider} />
                <View style={styles.routeLegendItem}>
                  <View style={styles.legendDotRemaining} />
                  <Text style={styles.routeLegendLabel}>Remaining Route (Blue)</Text>
                </View>
              </View>
            </View>
          )}

          {/* Customer-Facing Trip Start PIN Verification Card */}
          {tripState === 'ARRIVED' && (
            <View style={styles.pinVerificationCard}>
              <View style={styles.pinVerificationHeader}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                <Text style={styles.pinVerificationTitle}>TRIP START OTP / PIN</Text>
              </View>
              <Text style={styles.pinVerificationSub}>
                Give this 4-digit PIN to your driver when you board. Only the driver can verify it to start the ride and stop waiting charges.
              </Text>

              <View style={styles.pinBoxesContainer}>
                {['5', '8', '2', '1'].map((digit, idx) => (
                  <View key={idx} style={styles.pinDigitBox}>
                    <Text style={styles.pinDigitText}>{digit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.waitingForDriverRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.waitingForDriverText}>
                  Waiting for driver to enter PIN on their device...
                </Text>
              </View>
            </View>
          )}

          {/* Driver Information Card - Tap to inspect full profile */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowProfileModal(true)}
            style={styles.driverCardHeader}
          >
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color={Colors.primary} />
              <View style={styles.verifiedShieldMini}>
                <Ionicons name="checkmark" size={8} color="#FFFFFF" />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.driverName}>{driverName}</Text>
                <View style={styles.viewProfileChip}>
                  <Text style={styles.viewProfileChipText}>View Profile</Text>
                </View>
              </View>
              <Text style={styles.driverSub}>
                {vehicleTitle} • {currentDriverProfile?.ratingAverage.toFixed(1) || '4.9'} ★ ({currentDriverProfile?.totalTrips || '342'} trips)
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fareLabel}>Total Fare</Text>
              <Text style={styles.fareText}>Rs. {totalCalculatedFare}</Text>
              {waitingPenaltyAmount > 0 && (
                <Text style={styles.penaltyBreakdownSub}>
                  Base Rs. {baseFare} + Pen. Rs. {waitingPenaltyAmount}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Vehicle License Plate Info */}
          <View style={styles.securityRow}>
            <View style={styles.plateTag}>
              <Text style={styles.plateText}>{vehiclePlate}</Text>
            </View>
            <View style={styles.carModelTag}>
              <Ionicons name="car-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.carModelText}>{vehicleTitle}</Text>
            </View>
            {currentDriverProfile?.vehicle?.hasAirConditioning && (
              <View style={styles.acVerifiedMiniBadge}>
                <Ionicons name="snow" size={12} color="#0284C7" />
                <Text style={styles.acVerifiedMiniText}>Chilled AC</Text>
              </View>
            )}
          </View>

          {/* Action Buttons: Call, Message, Share */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleCallDriver} style={styles.actionBtn}>
              <Ionicons name="call" size={18} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Chat', 'Opening in-app masked chat...')}
              style={styles.actionBtn}
            >
              <Ionicons name="chatbubble" size={18} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Trip Shared', 'Live tracking link copied.')}
              style={styles.actionBtn}
            >
              <Ionicons name="share-social" size={18} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* SIMULATED DRIVER APP TERMINAL (Anti-fraud: Geofenced Trip Completion within 500m) */}
          <View style={styles.driverTerminalCard}>
            <View style={styles.driverTerminalHeader}>
              <View style={styles.driverTerminalBadge}>
                <Ionicons name="phone-portrait" size={13} color="#FFFFFF" />
                <Text style={styles.driverTerminalBadgeText}>DRIVER APP TERMINAL</Text>
              </View>
              <Text style={styles.driverTerminalNote}>Simulation Mode</Text>
            </View>
            <Text style={styles.driverTerminalDesc}>
              In real production, driver enters customer PIN to start, and can only end trip when within 500m of dropoff destination.
            </Text>

            {tripState === 'EN_ROUTE' && (
              <TouchableOpacity
                onPress={handleDriverArrived}
                style={styles.driverTerminalArriveBtn}
              >
                <Ionicons name="location" size={16} color="#FFFFFF" />
                <Text style={styles.driverTerminalBtnText}>
                  Driver: Mark Arrived at Pickup
                </Text>
              </TouchableOpacity>
            )}

            {tripState === 'ARRIVED' && (
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  onPress={handleDriverVerifyPinAndStart}
                  style={styles.driverTerminalVerifyBtn}
                >
                  <Ionicons name="keypad" size={16} color="#FFFFFF" />
                  <Text style={styles.driverTerminalBtnText}>
                    Driver: Enter Customer PIN (5821) & Start Trip
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFastForwardOvertime}
                  style={styles.driverTerminalOvertimeBtn}
                >
                  <Ionicons name="time" size={14} color="#B45309" />
                  <Text style={styles.driverTerminalOvertimeBtnText}>
                    ⚡ Test +2m Overtime Penalty (+Rs. 30)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {tripState === 'IN_PROGRESS' && (
              <View style={{ gap: 8 }}>
                {/* Geofence Notice Box */}
                <View
                  style={[
                    styles.geofenceBox,
                    isNearDestination ? styles.geofenceBoxNear : styles.geofenceBoxFar,
                  ]}
                >
                  <Ionicons
                    name={isNearDestination ? 'checkmark-circle' : 'shield-half'}
                    size={16}
                    color={isNearDestination ? '#059669' : '#D97706'}
                  />
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text
                      style={[
                        styles.geofenceTitle,
                        isNearDestination ? styles.geofenceTitleNear : styles.geofenceTitleFar,
                      ]}
                    >
                      {isNearDestination
                        ? `Near Destination (${distanceToDestinationKm.toFixed(1)} km) • End Trip Unlocked`
                        : `Destination Geofence Active (${distanceToDestinationKm.toFixed(1)} km away)`}
                    </Text>
                    <Text style={styles.geofenceDesc}>
                      {isNearDestination
                        ? 'Vehicle is within 500m of destination. Driver can now end trip.'
                        : 'End Trip is locked until driver is within 500m of dropoff destination.'}
                    </Text>
                  </View>
                </View>

                {/* Primary End Trip Action: Unlocked ONLY when within 500m */}
                {isNearDestination ? (
                  <TouchableOpacity
                    onPress={handleCompleteTrip}
                    style={styles.driverTerminalCompleteBtn}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                    <Text style={styles.driverTerminalBtnText}>
                      Driver: Arrive at Destination & Complete Trip
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        Alert.alert(
                          'Destination Geofence Active',
                          `You are currently ${distanceToDestinationKm.toFixed(1)} km away from the destination. Trips can only be ended when within 500m of the dropoff location.`
                        );
                      }}
                      style={styles.driverTerminalLockedBtn}
                    >
                      <Ionicons name="lock-closed" size={16} color="#94A3B8" />
                      <Text style={styles.driverTerminalLockedBtnText}>
                        End Trip Locked ({distanceToDestinationKm.toFixed(1)} km away)
                      </Text>
                    </TouchableOpacity>

                    {/* Simulation Shortcut: Jump Driver to < 500m */}
                    <TouchableOpacity
                      onPress={() => {
                        setDistanceToDestinationKm(0.3);
                        setIsNearDestination(true);
                        if (Platform.OS === 'web') {
                          window.postMessage({ type: 'SIMULATE_NEAR_DESTINATION' }, '*');
                        }
                      }}
                      style={styles.driverTerminalNearSimBtn}
                    >
                      <Ionicons name="flash" size={13} color="#2563EB" />
                      <Text style={styles.driverTerminalNearSimBtnText}>
                        ⚡ [Simulation] Move Driver Within 500m Dropoff Zone
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Customer action when trip is near destination or finished */}
          {tripState === 'IN_PROGRESS' && isNearDestination && (
            <Button
              title="View Final Bill & Pay Cash"
              onPress={handleCompleteTrip}
              variant="outline"
              style={{ marginTop: Spacing.sm }}
            />
          )}
        </ScrollView>
      </View>

      {/* Itemized Trip Receipt Modal */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.receiptTitle}>Trip Completed!</Text>
              <Text style={styles.receiptSubtitle}>Official Fare & Waiting Charge Breakdown</Text>
            </View>

            <View style={styles.receiptDivider} />

            {/* Line Items */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Base Ride Fare (Agreed)</Text>
              <Text style={styles.receiptValue}>Rs. {baseFare}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Free Waiting Grace (3 min)</Text>
              <Text style={styles.receiptFreeValue}>Rs. 0 (Free)</Text>
            </View>

            {waitingPenaltyAmount > 0 ? (
              <View style={styles.receiptRowPenalty}>
                <View>
                  <Text style={styles.receiptPenaltyLabel}>Overtime Waiting Penalty</Text>
                  <Text style={styles.receiptPenaltySub}>
                    {overtimeMinutes} mins overtime @ Rs. 10/min
                  </Text>
                </View>
                <Text style={styles.receiptPenaltyVal}>+ Rs. {waitingPenaltyAmount}</Text>
              </View>
            ) : (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Overtime Waiting Penalty</Text>
                <Text style={styles.receiptFreeValue}>None (Boarded on time)</Text>
              </View>
            )}

            <View style={styles.receiptDivider} />

            {/* Total Payable */}
            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>TOTAL CASH DUE</Text>
              <Text style={styles.receiptTotalValue}>Rs. {totalCalculatedFare}</Text>
            </View>
            <Text style={styles.receiptCashNotice}>
              💵 Please pay Rs. {totalCalculatedFare} cash to driver {driverName}.
            </Text>

            <Button
              title="Cash Paid & Done"
              onPress={handleFinishPaymentAndExit}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* Rate & Review Driver Modal (Shown after ride completion) */}
      <RateDriverModal
        visible={showRateModal}
        driverName={driverName}
        driverId={driverId}
        vehicleInfo={`${vehicleTitle} • ${vehiclePlate}`}
        onSubmit={handleReviewSubmit}
        onSkip={handleReviewSkip}
      />

      {/* Full Driver Profile & Credentials Modal */}
      <DriverProfileModal
        visible={showProfileModal}
        profile={currentDriverProfile}
        onClose={() => setShowProfileModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingBottom: 0,
  },
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  greenDot: {
    backgroundColor: '#10B981',
  },
  redDot: {
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  greenText: {
    color: '#059669',
  },
  redText: {
    color: '#DC2626',
  },
  sosPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  bottomSheet: {
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

  /* Status Boxes */
  statusBoxGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  statusBoxTitleGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  statusBoxSubtitleGreen: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  simPillButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  simPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statusBoxAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  statusBoxTitleAmber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  graceTimerDigits: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D97706',
    marginVertical: 2,
    letterSpacing: 1,
  },
  statusBoxSubtitleAmber: {
    fontSize: 10,
    color: '#B45309',
  },

  statusBoxRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 3,
    marginBottom: Spacing.md,
  },
  statusBoxTitleRed: {
    fontSize: 11,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  penaltyAmountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  penaltyAmountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  overtimeMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginVertical: 6,
  },
  overtimeMetricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  overtimeMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 1,
  },
  statusBoxSubtitleRed: {
    fontSize: 10,
    color: '#7F1D1D',
    lineHeight: 14,
  },

  statusBoxBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  statusBoxTitleBlue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  statusBoxSubtitleBlue: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
  },
  routeLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#DBEAFE',
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  routeLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDotCovered: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    borderWidth: 1,
    borderColor: '#475569',
  },
  legendDotRemaining: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  routeLegendLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  routeLegendDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#93C5FD',
  },

  /* PIN Verification Card (Customer-facing) */
  pinVerificationCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  pinVerificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pinVerificationTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 0.5,
  },
  pinVerificationSub: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 15,
    marginBottom: Spacing.sm,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 6,
  },
  pinDigitBox: {
    width: 46,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  pinDigitText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#15803D',
  },
  waitingForDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  waitingForDriverText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  /* Driver Information Card */
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  driverSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewProfileChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  viewProfileChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  verifiedShieldMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#059669',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  acVerifiedMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  acVerifiedMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  fareLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fareText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 1,
  },
  penaltyBreakdownSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  plateTag: {
    backgroundColor: '#FDE047',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: '#CA8A04',
  },
  plateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  carModelTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carModelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  /* SIMULATED DRIVER APP TERMINAL */
  driverTerminalCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  driverTerminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  driverTerminalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  driverTerminalBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  driverTerminalNote: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  driverTerminalDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginVertical: 6,
  },
  driverTerminalArriveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  driverTerminalVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    ...Shadows.sm,
  },
  driverTerminalCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    ...Shadows.md,
  },
  driverTerminalBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  driverTerminalOvertimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  driverTerminalOvertimeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },

  /* Geofence Proximity Styles */
  geofenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  geofenceBoxFar: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  geofenceBoxNear: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  geofenceTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  geofenceTitleFar: {
    color: '#92400E',
  },
  geofenceTitleNear: {
    color: '#065F46',
  },
  geofenceDesc: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
  driverTerminalLockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  driverTerminalLockedBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  driverTerminalNearSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  driverTerminalNearSimBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  /* Receipt Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  receiptSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  receiptFreeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  receiptRowPenalty: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginVertical: 4,
  },
  receiptPenaltyLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  receiptPenaltySub: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 1,
  },
  receiptPenaltyVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  receiptTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  receiptCashNotice: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
