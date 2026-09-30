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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { InteractiveMap } from '../../src/components/InteractiveMap';
import { Button } from '../../src/components/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ServiceRequestStatus } from '@superapp/types';

export default function ProviderJobActiveScreen() {
  const router = useRouter();
  const {
    activeRide,
    setDriverArrived,
    startTrip,
    providerCompleteJob,
    updateWaitingPenalty,
    waitingPenaltyAmount,
    waitingOvertimeSeconds,
    toggleRoleMode,
  } = useAppStore();

  // If no active ride from store, fallback to default Karachi job for testing
  const currentRide = activeRide || {
    id: 'req-live-101',
    requestNumber: 'PK-829104',
    customerName: 'Sara Qureshi',
    customerPhone: '+92 300 1234567',
    pickupAddressText: 'Dolmen Mall Clifton, Gate 2, Karachi',
    pickupLatitude: 24.8138,
    pickupLongitude: 67.0305,
    dropoffAddressText: 'FTC Building Shahrah-e-Faisal, Karachi',
    dropoffLatitude: 24.8568,
    dropoffLongitude: 67.0544,
    finalAgreedFare: 420,
    status: ServiceRequestStatus.ACCEPTED,
    estimatedDistanceKm: 5.2,
    estimatedDurationMinutes: 16,
  };

  // Derive driver's current trip step from active ride status
  const getInitialStep = () => {
    if (currentRide.status === ServiceRequestStatus.ARRIVED) return 'ARRIVED';
    if (currentRide.status === ServiceRequestStatus.IN_PROGRESS) return 'IN_PROGRESS';
    return 'EN_ROUTE';
  };

  const [jobStep, setJobStep] = useState<'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>(getInitialStep);
  const [waitingCountdown, setWaitingCountdown] = useState(180); // 3 minutes free waiting (180s)
  const [tripElapsedSeconds, setTripElapsedSeconds] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Switch to Customer mode handler
  const handleSwitchToCustomer = () => {
    toggleRoleMode();
    router.push('/(customer)/home');
  };

  // Free waiting timer countdown & overtime penalty calculation
  useEffect(() => {
    if (jobStep !== 'ARRIVED') return;

    const timer = setInterval(() => {
      setWaitingCountdown((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          // Overtime penalty: Rs. 5 per minute
          const overtime = Math.abs(prev - 1);
          const penalty = Math.ceil(overtime / 60) * 5;
          updateWaitingPenalty(penalty, overtime);
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jobStep]);

  // Trip taximeter elapsed timer
  useEffect(() => {
    if (jobStep !== 'IN_PROGRESS') return;

    const timer = setInterval(() => {
      setTripElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [jobStep]);

  // Step transitions
  const handleArrivedAtPickup = () => {
    setJobStep('ARRIVED');
    setDriverArrived();
    Alert.alert(
      'Arrived at Pickup 📍',
      `Passenger ${currentRide.customerName} has been notified that you are waiting outside. Free waiting time: 3 mins.`
    );
  };

  const handleStartTrip = () => {
    setJobStep('IN_PROGRESS');
    startTrip();
    Alert.alert(
      'Trip Started 🚀',
      'Taximeter is running. Follow GPS navigation to destination: FTC Shahrah-e-Faisal.'
    );
  };

  const handleCompleteTrip = () => {
    setIsReceiptModalOpen(true);
  };

  const handleFinishCashCollection = () => {
    const totalFare = (currentRide.finalAgreedFare || 420) + waitingPenaltyAmount;
    providerCompleteJob(currentRide.id, totalFare);
    setIsReceiptModalOpen(false);
    Alert.alert(
      'Trip Finished! 🎉',
      `Successfully collected Rs. ${totalFare} from ${currentRide.customerName}. Wallet earnings updated.`
    );
    router.replace('/(provider)/dashboard');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(Math.abs(sec) / 60);
    const s = Math.abs(sec) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalPayable = (currentRide.finalAgreedFare || 420) + waitingPenaltyAmount;
  const platformCommission = Math.round(totalPayable * 0.15);
  const netEarnings = totalPayable - platformCommission;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.navSubtitle}>Active Trip Navigation</Text>
          <Text style={styles.navTitle}>
            {jobStep === 'EN_ROUTE'
              ? 'En Route to Pickup'
              : jobStep === 'ARRIVED'
              ? 'Waiting at Pickup'
              : 'Trip In Progress'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Customer Phone', `Calling ${currentRide.customerName}: ${currentRide.customerPhone || '+92 300 1234567'}`)}
            style={styles.callPill}
          >
            <Ionicons name="call" size={15} color="#FFFFFF" />
            <Text style={styles.callPillText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.modeSwitchBtn}>
            <Ionicons name="swap-horizontal" size={15} color={Colors.primary} />
            <Text style={styles.modeSwitchText}>Customer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Navigation Map */}
        <View style={styles.mapWrap}>
          <InteractiveMap
            mode="TRACKING"
            tripState={jobStep}
            pickupLat={currentRide.pickupLatitude || 24.8138}
            pickupLng={currentRide.pickupLongitude || 67.0305}
            dropoffLat={currentRide.dropoffLatitude || 24.8568}
            dropoffLng={currentRide.dropoffLongitude || 67.0544}
            pickupTitle={currentRide.pickupAddressText}
            dropoffTitle={currentRide.dropoffAddressText}
            height={270}
          />
        </View>

        {/* Turn-by-Turn Guidance Banner */}
        <View style={styles.guidanceCard}>
          <View style={styles.turnIconWrap}>
            <MaterialCommunityIcons
              name={
                jobStep === 'EN_ROUTE'
                  ? 'arrow-right-top'
                  : jobStep === 'ARRIVED'
                  ? 'car-brake-parking'
                  : 'arrow-up-bold'
              }
              size={22}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.guidanceInstruction}>
              {jobStep === 'EN_ROUTE'
                ? 'Turn right onto Marine Drive toward Dolmen Mall Gate 2'
                : jobStep === 'ARRIVED'
                ? 'Waiting outside Gate 2 for passenger'
                : 'Continue straight on Shahrah-e-Faisal for 3.4 km'}
            </Text>
            <Text style={styles.guidanceSub}>
              {jobStep === 'IN_PROGRESS'
                ? `Elapsed: ${formatSeconds(tripElapsedSeconds)} • Speed 48 km/h`
                : 'Karachi Traffic: Moderate Flow • Speed limit 50 km/h'}
            </Text>
          </View>
        </View>

        {/* Phase 2: Live Waiting Timer Card */}
        {jobStep === 'ARRIVED' && (
          <View style={[styles.waitingCard, waitingCountdown < 0 && styles.waitingCardOvertime]}>
            <View style={styles.waitingHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons
                  name={waitingCountdown < 0 ? 'alert-circle' : 'time'}
                  size={20}
                  color={waitingCountdown < 0 ? '#DC2626' : '#D97706'}
                />
                <Text style={styles.waitingTitle}>
                  {waitingCountdown >= 0 ? 'Free Passenger Waiting Time' : 'Overtime Waiting Surcharge'}
                </Text>
              </View>
              <Text
                style={[
                  styles.waitingTimer,
                  waitingCountdown < 0 && { color: '#DC2626' },
                ]}
              >
                {waitingCountdown >= 0
                  ? formatSeconds(waitingCountdown)
                  : `+${formatSeconds(waitingCountdown)}`}
              </Text>
            </View>

            <Text style={styles.waitingSub}>
              {waitingCountdown >= 0
                ? 'Free 3:00 minutes allowed by platform. Taximeter will start if passenger is late.'
                : `Overtime fee: Rs. 5/min • Penalty of Rs. ${waitingPenaltyAmount} will be added to cash fare.`}
            </Text>
          </View>
        )}

        {/* Phase 3: Taximeter Bar */}
        {jobStep === 'IN_PROGRESS' && (
          <View style={styles.taximeterCard}>
            <View style={styles.taximeterCol}>
              <Text style={styles.taximeterLabel}>TRIP TIME</Text>
              <Text style={styles.taximeterVal}>{formatSeconds(tripElapsedSeconds)}</Text>
            </View>
            <View style={styles.taximeterDivider} />
            <View style={styles.taximeterCol}>
              <Text style={styles.taximeterLabel}>DISTANCE</Text>
              <Text style={styles.taximeterVal}>3.2 / 5.2 km</Text>
            </View>
            <View style={styles.taximeterDivider} />
            <View style={styles.taximeterCol}>
              <Text style={styles.taximeterLabel}>CURRENT FARE</Text>
              <Text style={styles.taximeterVal}>Rs. {totalPayable}</Text>
            </View>
          </View>
        )}

        {/* Passenger Info & Trip Details Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.custName}>{currentRide.customerName}</Text>
              <Text style={styles.custSub}>
                Agreed Fare: <Text style={styles.fareHighlight}>Rs. {currentRide.finalAgreedFare || 420}</Text> (Cash)
              </Text>
            </View>

            {/* In-App Chat Action */}
            <TouchableOpacity
              onPress={() => setIsChatModalOpen(true)}
              style={styles.chatActionBtn}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
              <Text style={styles.chatActionText}>Chat</Text>
            </TouchableOpacity>

            {/* Police 15 SOS */}
            <TouchableOpacity
              onPress={() => Alert.alert('Police Emergency 15', 'Dialing Sindh Police Emergency Madadgar 15...')}
              style={styles.sosPill}
            >
              <Ionicons name="warning-outline" size={15} color="#DC2626" />
              <Text style={styles.sosPillText}>SOS 15</Text>
            </TouchableOpacity>
          </View>

          {/* Route Details */}
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.greenCircle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTypeLabel}>PICKUP LOCATION</Text>
                <Text numberOfLines={1} style={styles.routeText}>
                  {currentRide.pickupAddressText}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={styles.redSquare} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTypeLabel}>DROPOFF DESTINATION</Text>
                <Text numberOfLines={1} style={styles.routeText}>
                  {currentRide.dropoffAddressText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* State Machine Transition Action Buttons */}
        <View style={styles.bottomActionContainer}>
          {jobStep === 'EN_ROUTE' && (
            <Button
              title="Tap: I Have Arrived at Pickup (Notify Passenger)"
              onPress={handleArrivedAtPickup}
              style={styles.primaryActionButton}
            />
          )}

          {jobStep === 'ARRIVED' && (
            <Button
              title="Tap: Start Trip (Passenger Onboard)"
              onPress={handleStartTrip}
              style={[styles.primaryActionButton, { backgroundColor: Colors.primary }]}
            />
          )}

          {jobStep === 'IN_PROGRESS' && (
            <Button
              title={`Tap: Complete Trip & Collect Rs. ${totalPayable}`}
              onPress={handleCompleteTrip}
              style={[styles.primaryActionButton, { backgroundColor: '#059669' }]}
            />
          )}
        </View>
      </ScrollView>

      {/* Cash Collection Receipt Modal */}
      <Modal visible={isReceiptModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.receiptCashIconCircle}>
              <Ionicons name="cash" size={32} color="#00875A" />
            </View>

            <Text style={styles.receiptTitle}>Trip Completed!</Text>
            <Text style={styles.receiptSub}>Collect cash fare directly from passenger</Text>

            <View style={styles.receiptTable}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>Base Agreed Fare</Text>
                <Text style={styles.receiptRowVal}>Rs. {currentRide.finalAgreedFare || 420}</Text>
              </View>

              {waitingPenaltyAmount > 0 && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptRowLabel, { color: '#DC2626' }]}>
                    Waiting Surcharge ({Math.round(waitingOvertimeSeconds / 60)} min overtime)
                  </Text>
                  <Text style={[styles.receiptRowVal, { color: '#DC2626' }]}>+Rs. {waitingPenaltyAmount}</Text>
                </View>
              )}

              <View style={styles.receiptDivider} />

              <View style={styles.receiptRow}>
                <Text style={styles.receiptTotalLabel}>Total Cash to Collect</Text>
                <Text style={styles.receiptTotalVal}>Rs. {totalPayable}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptFeeLabel}>Platform Fee (15%)</Text>
                <Text style={styles.receiptFeeVal}>-Rs. {platformCommission}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptNetLabel}>Your Net Take-Home</Text>
                <Text style={styles.receiptNetVal}>Rs. {netEarnings}</Text>
              </View>
            </View>

            <Button
              title={`Confirm Rs. ${totalPayable} Cash Collected`}
              onPress={handleFinishCashCollection}
              style={styles.finishCashBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Quick In-App Chat Modal */}
      <Modal visible={isChatModalOpen} transparent animationType="fade">
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModalContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with {currentRide.customerName}</Text>
              <TouchableOpacity onPress={() => setIsChatModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.presetChips}>
              <TouchableOpacity
                onPress={() => setChatInput('Assalam-o-Alaikum, I have arrived outside your location.')}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>"I have arrived outside"</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChatInput('Traffic on road, arriving in 2 minutes.')}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>"Arriving in 2 mins"</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChatInput('I am parked near Gate 2 with hazard lights on.')}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>"Parked near Gate 2"</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatInputRow}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type Urdu / English message..."
                placeholderTextColor={Colors.textMuted}
                style={styles.chatInput}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!chatInput) return;
                  Alert.alert('Message Sent', `Sent to ${currentRide.customerName}: "${chatInput}"`);
                  setChatInput('');
                  setIsChatModalOpen(false);
                }}
                style={styles.sendMsgBtn}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  callPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#B3F5D1',
    gap: 4,
  },
  modeSwitchText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 90,
  },
  mapWrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },

  // Guidance Banner
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  turnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceInstruction: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guidanceSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Waiting Card
  waitingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  waitingCardOvertime: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  waitingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  waitingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  waitingTimer: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
  },
  waitingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Taximeter
  taximeterCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Shadows.sm,
  },
  taximeterCol: {
    alignItems: 'center',
  },
  taximeterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  taximeterVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  taximeterDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },

  // Customer Card
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  custName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  custSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fareHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
    gap: 4,
  },
  chatActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  sosPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  // Route
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeTypeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  routeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },

  // Action Button
  bottomActionContainer: {
    marginTop: Spacing.xs,
  },
  primaryActionButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },

  // Receipt Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  receiptCashIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3FCEF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#A3E635',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  receiptSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  receiptTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptRowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  receiptRowVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  receiptTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  receiptFeeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  receiptFeeVal: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  receiptNetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  receiptNetVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  finishCashBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  // Chat Modal
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  chatModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetChips: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sendMsgBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
