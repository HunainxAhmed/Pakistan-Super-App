import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';

export default function ProviderEarningsScreen() {
  const router = useRouter();
  const {
    providerTodayEarnings,
    providerCompletedJobsCount,
    providerRideHistory,
    providerWithdrawFunds,
    toggleRoleMode,
  } = useAppStore();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'JAZZCASH' | 'EASYPAISA' | 'BANK'>('JAZZCASH');
  const [withdrawAmount, setWithdrawAmount] = useState('1500');
  const [accountNumber, setAccountNumber] = useState('0301-2345678');

  const handleSwitchToCustomer = () => {
    toggleRoleMode();
    router.push('/(customer)/home');
  };

  const handleConfirmWithdrawal = () => {
    const amountNum = parseInt(withdrawAmount, 10);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amountNum > providerTodayEarnings) {
      Alert.alert('Insufficient Balance', `Your current balance is Rs. ${providerTodayEarnings.toLocaleString()}.`);
      return;
    }

    const success = providerWithdrawFunds(amountNum, selectedMethod, accountNumber);
    if (success) {
      setIsWithdrawModalOpen(false);
      Alert.alert(
        'Payout Successful! 💸',
        `Rs. ${amountNum.toLocaleString()} has been transferred instantly to your ${selectedMethod} account (${accountNumber}).`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>Captain Wallet</Text>
          <Text style={styles.headerTitle}>Earnings & Payouts</Text>
        </View>

        <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.modeSwitchBtn}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.modeSwitchText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Today's Net Earnings Card */}
        <View style={styles.balanceHeroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>TODAY'S NET EARNINGS</Text>
              <Text style={styles.heroAmount}>Rs. {providerTodayEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={26} color="#10B981" />
            </View>
          </View>

          <View style={styles.heroSubRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{providerCompletedJobsCount}</Text>
              <Text style={styles.heroStatLabel}>Trips Completed</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>96%</Text>
              <Text style={styles.heroStatLabel}>Acceptance Rate</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>4.92 ★</Text>
              <Text style={styles.heroStatLabel}>Captain Rating</Text>
            </View>
          </View>

          {/* Quick Cash-Out Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsWithdrawModalOpen(true)}
            style={styles.withdrawBtn}
          >
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
            <Text style={styles.withdrawBtnText}>Withdraw to JazzCash / Easypaisa</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown Card */}
        <Text style={styles.sectionHeader}>Today's Cash Flow Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="cash-outline" size={18} color="#10B981" />
              <Text style={styles.breakdownItemTitle}>Total Passenger Cash Collected</Text>
            </View>
            <Text style={styles.breakdownItemValue}>Rs. {Math.round(providerTodayEarnings * 1.18).toLocaleString()}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="card-outline" size={18} color="#3B82F6" />
              <Text style={styles.breakdownItemTitle}>In-App Digital / Online Fares</Text>
            </View>
            <Text style={styles.breakdownItemValue}>Rs. {Math.round(providerTodayEarnings * 0.25).toLocaleString()}</Text>
          </View>

          <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="cut-outline" size={18} color="#EF4444" />
              <Text style={styles.breakdownItemTitle}>Platform Commission (15%)</Text>
            </View>
            <Text style={[styles.breakdownItemValue, { color: '#EF4444' }]}>
              -Rs. {Math.round(providerTodayEarnings * 0.15).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Supported Local Payment Gateways */}
        <View style={styles.gatewaysBanner}>
          <Text style={styles.gatewaysTitle}>Instant 24/7 Pakistani Payouts</Text>
          <View style={styles.gatewaysRow}>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayPillText}>JazzCash</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayPillText}>Easypaisa</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayPillText}>1Link IBAN</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayPillText}>Meezan Bank</Text>
            </View>
          </View>
        </View>

        {/* Completed Trips History */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
          <Text style={styles.sectionHeader}>Recent Trip Receipts</Text>
          <Badge label={`${providerRideHistory.length} Trips`} variant="info" />
        </View>

        {providerRideHistory.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripHeaderRow}>
              <View style={styles.customerAvatarMini}>
                <Ionicons name="person" size={16} color={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.tripCustomerName}>{trip.customerName}</Text>
                <Text style={styles.tripTime}>{trip.completedAt}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.tripFare}>+Rs. {trip.netEarning}</Text>
                <Text style={styles.tripGross}>Gross: Rs. {trip.fare}</Text>
              </View>
            </View>

            <View style={styles.tripRouteContainer}>
              <View style={styles.tripRoutePoint}>
                <View style={styles.greenDot} />
                <Text numberOfLines={1} style={styles.tripRouteText}>{trip.pickup}</Text>
              </View>
              <View style={styles.tripRouteLine} />
              <View style={styles.tripRoutePoint}>
                <View style={styles.redDot} />
                <Text numberOfLines={1} style={styles.tripRouteText}>{trip.dropoff}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Instant Payout Modal */}
      <Modal visible={isWithdrawModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Earnings</Text>
              <TouchableOpacity onPress={() => setIsWithdrawModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Available balance: Rs. {providerTodayEarnings.toLocaleString()}
            </Text>

            {/* Select Gateway */}
            <Text style={styles.inputLabel}>Select Payout Gateway</Text>
            <View style={styles.methodsRow}>
              {(['JAZZCASH', 'EASYPAISA', 'BANK'] as const).map((method) => {
                const isSelected = selectedMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setSelectedMethod(method)}
                    style={[styles.methodCard, isSelected && styles.methodCardActive]}
                  >
                    <Ionicons
                      name={method === 'BANK' ? 'business' : 'phone-portrait'}
                      size={20}
                      color={isSelected ? '#10B981' : Colors.textMuted}
                    />
                    <Text style={[styles.methodText, isSelected && { color: '#10B981', fontWeight: '800' }]}>
                      {method === 'JAZZCASH' ? 'JazzCash' : method === 'EASYPAISA' ? 'Easypaisa' : '1Link Bank'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Account Number */}
            <Text style={styles.inputLabel}>
              {selectedMethod === 'BANK' ? 'IBAN / Account Number' : 'Mobile Account Number'}
            </Text>
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={selectedMethod === 'BANK' ? 'PK36MEZN000...' : '0300-1234567'}
              style={styles.textInput}
            />

            {/* Amount */}
            <Text style={styles.inputLabel}>Amount (PKR)</Text>
            <TextInput
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              placeholder="e.g. 1500"
              style={styles.textInput}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsWithdrawModalOpen(false)}
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Button
                title="Confirm Payout"
                onPress={handleConfirmWithdrawal}
                style={{ flex: 1.5 }}
              />
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
  balanceHeroCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
    ...Shadows.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 4,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    marginTop: Spacing.lg,
    gap: 8,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  breakdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breakdownItemTitle: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  breakdownItemValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  gatewaysBanner: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gatewaysTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: Spacing.sm,
  },
  gatewaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gatewayPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gatewayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  tripCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCustomerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tripTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  tripFare: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  tripGross: {
    fontSize: 10,
    color: '#94A3B8',
  },
  tripRouteContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tripRoutePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tripRouteLine: {
    width: 2,
    height: 10,
    backgroundColor: '#475569',
    marginLeft: 4,
    marginVertical: 2,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  tripRouteText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 4,
  },
  methodCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  methodText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
});
