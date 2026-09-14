import React from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge } from '../../src/components/Badge';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, walletBalance, toggleRoleMode } = useAppStore();

  const handleTopUp = () => {
    Alert.alert(
      'Top Up Wallet',
      'Select payment gateway:',
      [
        { text: 'JazzCash (+Rs. 1,000)', onPress: () => Alert.alert('JazzCash', 'Rs. 1,000 added!') },
        { text: 'Easypaisa (+Rs. 1,000)', onPress: () => Alert.alert('Easypaisa', 'Rs. 1,000 added!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Account & Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.userName}>{currentUser.fullName}</Text>
            <Text style={styles.userPhone}>{currentUser.phoneNumber}</Text>
            <View style={{ marginTop: 4 }}>
              <Badge label="VERIFIED CUSTOMER" variant="success" />
            </View>
          </View>
        </View>

        {/* Dual Mode Switcher Banner */}
        <View style={styles.switcherCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switcherTitle}>Want to earn as a Partner?</Text>
            <Text style={styles.switcherSub}>
              Switch to Provider Mode to accept rides, mechanic jobs, or technician requests.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleRoleMode}
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>Switch Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Super App Digital Wallet */}
        <View style={styles.walletBox}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletTitle}>Super App Cash Wallet</Text>
              <Text style={styles.walletBalance}>Rs. {walletBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={handleTopUp} style={styles.topUpBtn}>
              <Ionicons name="add-circle" size={20} color={Colors.textWhite} />
              <Text style={styles.topUpBtnText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentGatewaysRow}>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayText}>JazzCash</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayText}>Easypaisa</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayText}>1Link Bank</Text>
            </View>
            <View style={styles.gatewayPill}>
              <Text style={styles.gatewayText}>Cash</Text>
            </View>
          </View>
        </View>

        {/* Saved Addresses */}
        <Text style={styles.sectionHeader}>Saved Addresses</Text>
        <View style={styles.addressesCard}>
          <View style={styles.addressItem}>
            <Ionicons name="home" size={20} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.addressLabel}>Home</Text>
              <Text style={styles.addressText}>Marine Drive, Block 4, Clifton, Karachi</Text>
            </View>
            <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
          </View>
          <View style={styles.addressDivider} />
          <View style={styles.addressItem}>
            <Ionicons name="briefcase" size={20} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.addressLabel}>Work</Text>
              <Text style={styles.addressText}>FTC Building, Shahrah-e-Faisal, Karachi</Text>
            </View>
            <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
          </View>
        </View>

        {/* Safety & Emergency Contacts */}
        <Text style={styles.sectionHeader}>Safety & Support</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            onPress={() => Alert.alert('Safety Center', 'Emergency contacts registered: 15 Police, 1122 Rescue')}
            style={styles.menuItem}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Safety Center & Emergency Contacts</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            onPress={() => Alert.alert('24/7 Support', 'Connecting to 24/7 Super App Support Hotline in Pakistan...')}
            style={styles.menuItem}
          >
            <Ionicons name="headset-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>24/7 Customer Support</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switcherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  switcherTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  switcherSub: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 4,
    lineHeight: 16,
  },
  switchButton: {
    backgroundColor: Colors.accentGold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.md,
  },
  switchButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  walletBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  topUpBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  paymentGatewaysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  gatewayPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  gatewayText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  addressesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
});
