import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { LocationSearchModal } from '../../src/components/LocationSearchModal';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { currentUser, walletBalance, pickupLocation, setPickup, setDropoff, toggleRoleMode } = useAppStore();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');

  const services = [
    {
      id: 'ride',
      title: 'Ride',
      subtitle: 'Bike, Rickshaw, Car',
      icon: 'car',
      iconLib: 'MaterialCommunityIcons',
      color: Colors.primary,
      bgColor: '#E3FCEF',
      route: '/(customer)/ride-booking',
    },
    {
      id: 'mechanic',
      title: 'Auto Assist',
      subtitle: 'Mechanic, Battery, Towing',
      icon: 'wrench',
      iconLib: 'Ionicons',
      color: '#D97706',
      bgColor: '#FEF3C7',
      route: '/(customer)/mechanic-request',
    },
    {
      id: 'food',
      title: 'Food',
      subtitle: 'Biryani, Burgers & more',
      icon: 'food-fork-drink',
      iconLib: 'MaterialCommunityIcons',
      color: '#EA580C',
      bgColor: '#FFEDD5',
      route: '/(customer)/food',
    },
    {
      id: 'home',
      title: 'Home Services',
      subtitle: 'Electrician, Plumber, AC',
      icon: 'home-lightning-bolt-outline',
      iconLib: 'MaterialCommunityIcons',
      color: '#2563EB',
      bgColor: '#DBEAFE',
      route: '/(customer)/home-services',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Assalam-o-Alaikum,</Text>
            <Text style={styles.userNameText}>{currentUser.fullName}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Quick Testing Dual Role Switcher */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleRoleMode}
              style={styles.roleSwitchButton}
            >
              <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
              <Text style={styles.roleSwitchText}>Provider Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Location Pill (Opens Search / GPS Scan Modal) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setModalMode('PICKUP');
            setIsLocationModalOpen(true);
          }}
          style={styles.locationPill}
        >
          <Ionicons name="location-sharp" size={18} color={Colors.primary} />
          <View style={styles.locationTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text style={styles.locationChangeHint}>Change / Scan GPS</Text>
            </View>
            <Text numberOfLines={1} style={styles.locationValue}>
              {pickupLocation.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>

        {/* Quick Search / 'Where do you need to go?' */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setModalMode('DROPOFF');
            setIsLocationModalOpen(true);
          }}
          style={styles.searchBar}
        >
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Where to or what do you need in Karachi?</Text>
        </TouchableOpacity>

        {/* Primary Service Grid (Commercial 2x2 Grid) */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.servicesGrid}>
          {services.map((svc) => (
            <TouchableOpacity
              key={svc.id}
              activeOpacity={0.85}
              onPress={() => router.push(svc.route as any)}
              style={styles.serviceCard}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: svc.bgColor }]}>
                {svc.iconLib === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={svc.icon as any} size={28} color={svc.color} />
                ) : (
                  <Ionicons name={svc.icon as any} size={26} color={svc.color} />
                )}
              </View>
              <Text style={styles.serviceTitle}>{svc.title}</Text>
              <Text numberOfLines={1} style={styles.serviceSubtitle}>
                {svc.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet & Cash Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Super Wallet Balance</Text>
            <Text style={styles.walletAmount}>Rs. {walletBalance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/profile')}
            style={styles.topUpButton}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* inDrive-Style Feature Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>Bargain & Save</Text>
          </View>
          <Text style={styles.bannerTitle}>Name Your Own Price</Text>
          <Text style={styles.bannerSubtitle}>
            Choose rides or roadside mechanics by offering your fair price directly to nearby providers.
          </Text>
        </View>

        {/* Popular Pakistani Destinations */}
        <Text style={styles.sectionTitle}>Popular in Karachi</Text>
        <View style={styles.destinationsList}>
          {[
            { name: 'Jinnah International Airport', time: '25 min', tag: 'Airport' },
            { name: 'FTC Shahrah-e-Faisal', time: '12 min', tag: 'Business' },
            { name: 'Dolmen Mall Clifton', time: '8 min', tag: 'Shopping' },
          ].map((dest, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push('/(customer)/ride-booking')}
              style={styles.destinationItem}
            >
              <View style={styles.destinationIcon}>
                <Ionicons name="navigate-circle-outline" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destMeta}>{dest.tag} • ~{dest.time}</Text>
              </View>
              <Ionicons name="arrow-forward-outline" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Location Selector Modal with GPS Auto-Scan and Karachi Autocomplete */}
      <LocationSearchModal
        visible={isLocationModalOpen}
        title={modalMode === 'PICKUP' ? 'Change Current Location' : 'Where are you going?'}
        currentAddress={modalMode === 'PICKUP' ? pickupLocation.name : ''}
        onSelectLocation={(loc) => {
          if (modalMode === 'PICKUP') {
            setPickup(loc.name, loc.latitude, loc.longitude);
          } else {
            setDropoff(loc.name, loc.latitude, loc.longitude);
            router.push('/(customer)/ride-booking');
          }
          setIsLocationModalOpen(false);
        }}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  locationChangeHint: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    height: 52,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  searchPlaceholder: {
    marginLeft: Spacing.sm,
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  serviceCard: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  walletAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textWhite,
    marginTop: 2,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  topUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerContainer: {
    backgroundColor: '#004D40',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#E0F2F1',
    marginTop: 4,
    lineHeight: 18,
  },
  destinationsList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  destinationIcon: {
    marginRight: Spacing.md,
  },
  destName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  destMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
