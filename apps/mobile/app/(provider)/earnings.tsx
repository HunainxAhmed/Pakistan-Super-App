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
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Captain Wallet</Text>
          <Text style={styles.userNameText}>Earnings & Payouts</Text>
        </View>

        <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.roleSwitchBtn}>
          <Ionicons name="swap-horizontal" size={15} color={Colors.primary} />
          <Text style={styles.roleSwitchText}>Customer Mode</Text>
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
              <Ionicons name="wallet" size={26} color={Colors.primary} />
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
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.withdrawBtnText}>Withdraw to JazzCash / Easypaisa</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown Card */}
        <Text style={styles.sectionHeader}>Today's Cash Flow Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="cash-outline" size={18} color="#059669" />
              <Text style={styles.breakdownItemTitle}>Total Passenger Cash Collected</Text>
            </View>
            <Text style={styles.breakdownItemValue}>Rs. {Math.round(providerTodayEarnings * 1.18).toLocaleString()}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="card-outline" size={18} color="#2563EB" />
              <Text style={styles.breakdownItemTitle}>In-App Digital / Online Fares</Text>
            </View>
            <Text style={styles.breakdownItemValue}>Rs. {Math.round(providerTodayEarnings * 0.25).toLocaleString()}</Text>
          </View>

          <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
            <View style={styles.breakdownItemLeft}>
              <Ionicons name="cut-outline" size={18} color="#DC2626" />
              <Text style={styles.breakdownItemTitle}>Platform Commission (15%)</Text>
            </View>
            <Text style={[styles.breakdownItemValue, { color: '#DC2626' }]}>
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
              <Text style={styles.gatewayPillText}>Raast Instant</Text>
            </View>
          </View>
        </View>

        {/* Recent Trip Receipts */}
        <Text style={styles.sectionHeader}>Recent Completed Trips</Text>
        {providerRideHistory.map((item) => (
          <View key={item.id} style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptCustName}>{item.customerName}</Text>
                <Text style={styles.receiptTime}>{item.completedAt}</Text>
              </View>
              <Text style={styles.receiptFare}>Rs. {item.netEarning}</Text>
            </View>

            <View style={styles.receiptAddresses}>
              <View style={styles.addrRow}>
                <View style={styles.greenDot} />
                <Text numberOfLines={1} style={styles.addrText}>{item.pickup}</Text>
              </View>
              <View style={styles.addrRow}>
                <View style={styles.redDot} />
                <Text numberOfLines={1} style={styles.addrText}>{item.dropoff}</Text>
              </View>
            </View>

            <View style={styles.receiptFooter}>
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>CASH</Text>
              </View>
              <Text style={styles.commText}>Fee -Rs. {item.commission} deducted</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={isWithdrawModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Earnings</Text>
              <TouchableOpacity onPress={() => setIsWithdrawModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Available balance: <Text style={styles.balanceHighlight}>Rs. {providerTodayEarnings.toLocaleString()}</Text>
            </Text>

            {/* Select Method */}
            <View style={styles.methodSelector}>
              <TouchableOpacity
                onPress={() => setSelectedMethod('JAZZCASH')}
                style={[styles.methodOption, selectedMethod === 'JAZZCASH' && styles.methodOptionActive]}
              >
                <Text style={[styles.methodOptionText, selectedMethod === 'JAZZCASH' && styles.methodOptionTextActive]}>
                  JazzCash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMethod('EASYPAISA')}
                style={[styles.methodOption, selectedMethod === 'EASYPAISA' && styles.methodOptionActive]}
              >
                <Text style={[styles.methodOptionText, selectedMethod === 'EASYPAISA' && styles.methodOptionTextActive]}>
                  Easypaisa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMethod('BANK')}
                style={[styles.methodOption, selectedMethod === 'BANK' && styles.methodOptionActive]}
              >
                <Text style={[styles.methodOptionText, selectedMethod === 'BANK' && styles.methodOptionTextActive]}>
                  1Link Bank
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Withdrawal Amount (PKR)</Text>
            <TextInput
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="number-pad"
              style={styles.modalInput}
              placeholder="e.g. 1500"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>
              {selectedMethod === 'BANK' ? 'Account IBAN (24 digits)' : 'Mobile Wallet Number'}
            </Text>
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              style={styles.modalInput}
              placeholder={selectedMethod === 'BANK' ? 'PK36MEZN000...' : '0301-2345678'}
              placeholderTextColor={Colors.textMuted}
            />

            <Button
              title="Confirm Instant Cash-Out"
              onPress={handleConfirmWithdrawal}
              style={styles.confirmWithdrawBtn}
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

  // Hero Card
  balanceHeroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
    ...Shadows.sm,
  },
  withdrawBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  // Breakdown Card
  breakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownItemTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Gateways
  gatewaysBanner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  gatewaysTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  gatewaysRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  gatewayPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gatewayPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Receipt Card
  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  receiptCustName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  receiptTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  receiptFare: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  receiptAddresses: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 1.5,
    backgroundColor: '#EF4444',
  },
  addrText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  payBadge: {
    backgroundColor: '#E3FCEF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  payBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  commText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  // Modal
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  balanceHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  methodOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  methodOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  methodOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodOptionTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.xs,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: Spacing.sm,
  },
  confirmWithdrawBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
});
