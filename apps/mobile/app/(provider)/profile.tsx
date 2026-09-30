import React from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge } from '../../src/components/Badge';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { driverProfiles, toggleRoleMode } = useAppStore();
  const profile = driverProfiles['prov-driver-001'] || {
    name: 'Captain Tariq Mehmood',
    phone: '+92 301 2345678',
    ratingAverage: 4.9,
    totalRatings: 312,
    totalTrips: 342,
    memberSince: 'March 2023',
    vehicle: {
      model: 'Toyota Corolla GLI',
      plate: 'KHI-9821',
      color: 'White',
      year: 2021,
      hasAirConditioning: true,
    },
    badges: ['Top Rated Partner', 'Chilled AC Guaranteed', 'Safe Driver'],
    reviews: [],
  };

  const handleSwitchToCustomer = () => {
    toggleRoleMode();
    router.push('/(customer)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Captain Account</Text>
          <Text style={styles.userNameText}>Driver Profile & Fleet</Text>
        </View>

        <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.roleSwitchBtn}>
          <Ionicons name="swap-horizontal" size={15} color={Colors.primary} />
          <Text style={styles.roleSwitchText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Captain Hero Profile Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroAvatarCircle}>
            <Ionicons name="person" size={38} color={Colors.primary} />
          </View>
          <Text style={styles.heroName}>{profile.name}</Text>
          <Text style={styles.heroPhone}>{profile.phone}</Text>

          <View style={styles.ratingBadgeRow}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.starText}>{profile.ratingAverage} ★</Text>
            </View>
            <Text style={styles.ratingSub}>({profile.totalRatings} Passenger Reviews)</Text>
          </View>

          <View style={styles.badgesRow}>
            {profile.badges.map((b, i) => (
              <View key={i} style={styles.badgePill}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Verified Pakistani Documentation Card */}
        <Text style={styles.sectionHeader}>NADRA & Government Verification</Text>
        <View style={styles.docCard}>
          <View style={styles.docRow}>
            <View style={styles.docIconWrap}>
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.docTitle}>CNIC (National ID Card)</Text>
              <Text style={styles.docDetail}>42201-1234567-3 • Verified via NADRA</Text>
            </View>
            <Badge label="VERIFIED" variant="success" />
          </View>

          <View style={styles.docRow}>
            <View style={styles.docIconWrap}>
              <MaterialCommunityIcons name="car-traction-control" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.docTitle}>Commercial Driving License</Text>
              <Text style={styles.docDetail}>DL-KHI-89421 • Valid until 2028 (Sindh)</Text>
            </View>
            <Badge label="ACTIVE" variant="success" />
          </View>

          <View style={[styles.docRow, { borderBottomWidth: 0 }]}>
            <View style={styles.docIconWrap}>
              <MaterialCommunityIcons name="file-certificate-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.docTitle}>Vehicle Excise & Fitness</Text>
              <Text style={styles.docDetail}>Approved by Excise & Taxation Department</Text>
            </View>
            <Badge label="APPROVED" variant="success" />
          </View>
        </View>

        {/* Assigned Vehicle Details */}
        <Text style={styles.sectionHeader}>Registered Fleet Vehicle</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeaderRow}>
            <View style={styles.vehicleIconCircle}>
              <MaterialCommunityIcons name="car-side" size={26} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.vehicleModel}>{profile.vehicle.model}</Text>
              <Text style={styles.vehiclePlate}>Plate: {profile.vehicle.plate} • {profile.vehicle.color}</Text>
            </View>
            <Badge label="AC PREMIUM" variant="info" />
          </View>

          <View style={styles.vehicleFeaturesRow}>
            <View style={styles.featureItem}>
              <Ionicons name="snow" size={16} color="#0284C7" />
              <Text style={styles.featureText}>Chilled AC Active</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>4 Passenger Seats</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.featureText}>Model Year {profile.vehicle.year}</Text>
            </View>
          </View>
        </View>

        {/* Passenger Ratings & Reviews */}
        <Text style={styles.sectionHeader}>Passenger Feedback</Text>
        {profile.reviews.slice(0, 3).map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCustomer}>{rev.customerName}</Text>
              <View style={styles.reviewStars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={13} color="#F59E0B" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{rev.comment}</Text>
            <Text style={styles.reviewTime}>{rev.createdAt}</Text>
          </View>
        ))}
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
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  heroAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  starText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  ratingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  // Document Card
  docCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  docDetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Vehicle Card
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehiclePlate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vehicleFeaturesRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Review Card
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCustomer: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  reviewTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
