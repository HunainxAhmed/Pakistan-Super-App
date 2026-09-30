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
import { Badge } from '../../src/components/Badge';
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
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callPillText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.modeSwitchBtn}>
            <Ionicons name="swap-horizontal" size={14} color="#34D399" />
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
            height={260}
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
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.guidanceInstruction}>
              {jobStep === 'EN_ROUTE'
                ? 'Turn right at Clifton Submarine Chowrangi onto Marine Drive'
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
                  color={waitingCountdown < 0 ? '#EF4444' : '#F59E0B'}
                />
                <Text style={styles.waitingTitle}>
                  {waitingCountdown >= 0 ? 'Free Passenger Waiting Time' : 'Overtime Waiting Surcharge'}
                </Text>
              </View>
              <Text
                style={[
                  styles.waitingTimer,
                  waitingCountdown < 0 && { color: '#EF4444' },
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

        {/* Passenger Summary Details Card */}
        <View style={styles.passengerCard}>
          <View style={styles.passengerHeader}>
            <View style={styles.passengerAvatar}>
              <Ionicons name="person" size={24} color="#94A3B8" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.passengerName}>{currentRide.customerName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Text style={styles.passengerRating}>5.0 ★</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.cashBadgeText}>CASH PASSENGER</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fareAmount}>Rs. {totalPayable}</Text>
              <Text style={styles.fareLabel}>Cash to Collect</Text>
            </View>
          </View>

          {/* Quick Communication Presets Bar */}
          <View style={styles.quickChatBar}>
            <TouchableOpacity
              onPress={() => setIsChatModalOpen(true)}
              style={styles.chatActionBtn}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#10B981" />
              <Text style={styles.chatActionText}>Quick Message to Passenger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Police Emergency 15', 'Dialing Sindh Police Emergency Madadgar 15...')}
              style={styles.sosPill}
            >
              <Ionicons name="warning-outline" size={16} color="#EF4444" />
              <Text style={styles.sosPillText}>SOS 15</Text>
            </TouchableOpacity>
          </View>

          {/* Route Details */}
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.greenCircle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTypeLabel}>PICKUP</Text>
                <Text numberOfLines={1} style={styles.routeText}>
                  {currentRide.pickupAddressText}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={styles.redSquare} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTypeLabel}>DROPOFF</Text>
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
              style={[styles.primaryActionButton, { backgroundColor: '#059669' }]}
            />
          )}

          {jobStep === 'IN_PROGRESS' && (
            <Button
              title={`Tap: Complete Trip & Collect Rs. ${totalPayable}`}
              onPress={handleCompleteTrip}
              style={[styles.primaryActionButton, { backgroundColor: '#10B981' }]}
            />
          )}
        </View>
      </ScrollView>

      {/* Cash Collection Receipt Modal */}
      <Modal visible={isReceiptModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.receiptCashIconCircle}>
              <MaterialCommunityIcons name="cash-multiple" size={36} color="#10B981" />
            </View>

            <Text style={styles.receiptTitle}>Collect Cash Payment</Text>
            <Text style={styles.receiptSub}>Collect total cash from {currentRide.customerName}</Text>

            <View style={styles.totalCashBox}>
              <Text style={styles.totalCashLabel}>TOTAL CASH AMOUNT</Text>
              <Text style={styles.totalCashVal}>Rs. {totalPayable}</Text>
            </View>

            {/* Receipt Breakdown Table */}
            <View style={styles.receiptBreakdown}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>Base Agreed inDrive Fare</Text>
                <Text style={styles.receiptRowVal}>Rs. {currentRide.finalAgreedFare || 420}</Text>
              </View>
              {waitingPenaltyAmount > 0 && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>Late Passenger Waiting Fee</Text>
                  <Text style={[styles.receiptRowVal, { color: '#F59E0B' }]}>+Rs. {waitingPenaltyAmount}</Text>
                </View>
              )}
              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>Platform Commission (15%)</Text>
                <Text style={[styles.receiptRowVal, { color: '#EF4444' }]}>-Rs. {platformCommission}</Text>
              </View>
              <View style={[styles.receiptRow, { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8 }]}>
                <Text style={[styles.receiptRowLabel, { fontWeight: '800', color: '#F8FAFC' }]}>
                  Net Earning Added to Wallet
                </Text>
                <Text style={[styles.receiptRowVal, { color: '#10B981', fontWeight: '900', fontSize: 16 }]}>
                  +Rs. {netEarnings}
                </Text>
              </View>
            </View>

            <Button
              title={`Received Rs. ${totalPayable} Cash • Finish Job`}
              onPress={handleFinishCashCollection}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* In-App Quick Messages Modal */}
      <Modal visible={isChatModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Message {currentRide.customerName}</Text>
              <TouchableOpacity onPress={() => setIsChatModalOpen(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <Text style={styles.presetHeading}>Quick Preset Messages</Text>
            {[
              'Assalam-o-Alaikum, I have arrived outside at the gate.',
              'I am in a White Toyota Corolla (KHI-9821) with hazard lights on.',
              'Stuck at chowrangi signal, reaching in 2 minutes.',
              'Chilled AC is turned on for your comfort.',
            ].map((msg, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setIsChatModalOpen(false);
                  Alert.alert('Message Sent 💬', `Sent to passenger: "${msg}"`);
                }}
                style={styles.presetPill}
              >
                <Ionicons name="chatbubble" size={14} color="#10B981" />
                <Text style={styles.presetText}>{msg}</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type custom message to passenger..."
              placeholderTextColor="#64748B"
              style={styles.customChatInput}
            />

            <Button
              title="Send Message"
              onPress={() => {
                if (chatInput.trim()) {
                  setIsChatModalOpen(false);
                  Alert.alert('Message Sent 💬', `Sent: "${chatInput.trim()}"`);
                  setChatInput('');
                }
              }}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
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
    padding: 6,
    backgroundColor: '#064E3B',
    borderRadius: BorderRadius.round,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  mapWrap: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: Spacing.md,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  turnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceInstruction: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  guidanceSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  waitingCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  waitingCardOvertime: {
    borderColor: '#EF4444',
    backgroundColor: '#450A0A',
  },
  waitingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  waitingTimer: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  waitingSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  taximeterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taximeterCol: {
    alignItems: 'center',
  },
  taximeterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  taximeterVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
  },
  taximeterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  passengerCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  passengerRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#64748B',
  },
  cashBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  fareLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  quickChatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450A0A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  sosPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  routeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
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
  bottomActionContainer: {
    marginTop: Spacing.sm,
  },
  primaryActionButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  receiptCashIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  receiptSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  totalCashBox: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: Spacing.lg,
  },
  totalCashLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  totalCashVal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 4,
  },
  receiptBreakdown: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptRowLabel: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  receiptRowVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: Spacing.sm,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#334155',
    gap: Spacing.sm,
  },
  presetText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },
  customChatInput: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: Spacing.sm,
  },
});
