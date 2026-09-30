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

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { currentUser, driverProfiles, toggleRoleMode } = useAppStore();
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
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>Captain Account</Text>
          <Text style={styles.headerTitle}>Driver Profile & Fleet</Text>
        </View>

        <TouchableOpacity onPress={handleSwitchToCustomer} style={styles.modeSwitchBtn}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.modeSwitchText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Captain Hero Profile Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroAvatarCircle}>
            <Ionicons name="person" size={40} color="#10B981" />
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
                <Ionicons name="shield-checkmark" size={12} color="#34D399" />
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
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.docTitle}>CNIC (National ID Card)</Text>
              <Text style={styles.docDetail}>42201-1234567-3 • Verified via NADRA</Text>
            </View>
            <Badge label="VERIFIED" variant="success" />
          </View>

          <View style={styles.docRow}>
            <View style={styles.docIconWrap}>
              <MaterialCommunityIcons name="car-traction-control" size={22} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.docTitle}>Commercial Driving License</Text>
              <Text style={styles.docDetail}>DL-KHI-89421 • Valid until 2028 (Sindh)</Text>
            </View>
            <Badge label="ACTIVE" variant="success" />
          </View>

          <View style={[styles.docRow, { borderBottomWidth: 0 }]}>
            <View style={styles.docIconWrap}>
              <MaterialCommunityIcons name="file-certificate-outline" size={22} color="#10B981" />
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
              <MaterialCommunityIcons name="car-side" size={26} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.vehicleModel}>{profile.vehicle.model}</Text>
              <Text style={styles.vehiclePlate}>Plate: {profile.vehicle.plate} • {profile.vehicle.color}</Text>
            </View>
            <Badge label="AC PREMIUM" variant="info" />
          </View>

          <View style={styles.vehicleFeaturesRow}>
            <View style={styles.featureItem}>
              <Ionicons name="snow" size={16} color="#38BDF8" />
              <Text style={styles.featureText}>Chilled AC Active</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={16} color="#34D399" />
              <Text style={styles.featureText}>4 Passenger Seats</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Year {profile.vehicle.year}</Text>
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
            {rev.comment && <Text style={styles.reviewComment}>"{rev.comment}"</Text>}
            {rev.tags && (
              <View style={styles.reviewTagsRow}>
                {rev.tags.map((t, idx) => (
                  <View key={idx} style={styles.tagPill}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* 24/7 Safety & Support */}
        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>24/7 Captain Support & Safety</Text>
          <Text style={styles.supportSub}>
            Need immediate help or accident assistance? Reach our dedicated operations desk.
          </Text>
          <View style={styles.supportBtnRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Captain Helpline', 'Connecting to Karachi Operations Desk: 021-111-787372')}
              style={styles.helplineBtn}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.helplineBtnText}>Support Desk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Emergency Helpline', 'Dialing Sindh Police 15 & Rescue 1122...')}
              style={styles.sosBtn}
            >
              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
              <Text style={styles.sosBtnText}>Police 15 SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
    ...Shadows.md,
  },
  heroAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  starText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCD34D',
  },
  ratingSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  docCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  docDetail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  vehicleCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  vehicleFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  reviewCard: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCustomer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tagPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34D399',
  },
  supportBox: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  supportSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  supportBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  helplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    gap: 6,
  },
  helplineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sosBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    gap: 6,
  },
  sosBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
