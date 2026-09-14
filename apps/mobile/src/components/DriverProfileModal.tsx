import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { DriverProfileDetail } from '@superapp/types';

interface DriverProfileModalProps {
  visible: boolean;
  profile: DriverProfileDetail | null;
  onClose: () => void;
  onAcceptOffer?: () => void;
  acceptFare?: number;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onAcceptOffer,
  acceptFare,
}) => {
  if (!profile) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Driver Profile</Text>
              <Text style={styles.headerSubtitle}>Verified Super App Partner</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Driver Identity Card */}
            <View style={styles.identityCard}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={40} color={Colors.primary} />
                </View>
                <View style={styles.verifiedBadgeCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.driverNameText}>{profile.name}</Text>
              <Text style={styles.memberSinceText}>Partner since {profile.memberSince}</Text>

              {/* Verified Credentials Pills */}
              <View style={styles.verificationPillsRow}>
                {profile.cnicVerified && (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="shield-checkmark" size={13} color="#059669" />
                    <Text style={styles.verifiedPillText}>CNIC Verified</Text>
                  </View>
                )}
                {profile.drivingLicenseVerified && (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="card" size={13} color="#059669" />
                    <Text style={styles.verifiedPillText}>License Verified</Text>
                  </View>
                )}
                <View style={styles.verifiedPill}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.verifiedPillText}>Sindh Police Checked</Text>
                </View>
              </View>
            </View>

            {/* Performance & Ratings Banner */}
            <View style={styles.statsBanner}>
              <View style={styles.statItem}>
                <View style={styles.ratingNumberRow}>
                  <Text style={styles.statNumber}>{profile.ratingAverage.toFixed(1)}</Text>
                  <Ionicons name="star" size={18} color="#FFB800" style={{ marginLeft: 3 }} />
                </View>
                <Text style={styles.statLabel}>{profile.totalRatings} Reviews</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.totalTrips}</Text>
                <Text style={styles.statLabel}>Trips Done</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Safety Score</Text>
              </View>
            </View>

            {/* Vehicle Details Card */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Registered Vehicle</Text>
              <View style={styles.vehicleRow}>
                <View style={styles.vehicleIconCircle}>
                  <Ionicons name="car" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.vehicleModelText}>{profile.vehicle.model}</Text>
                  <Text style={styles.vehicleMetaText}>
                    {profile.vehicle.color} • Year {profile.vehicle.year}
                  </Text>
                </View>
                <View style={styles.plateTag}>
                  <Text style={styles.plateText}>{profile.vehicle.plate}</Text>
                </View>
              </View>

              {profile.vehicle.hasAirConditioning && (
                <View style={styles.acVerifiedBadge}>
                  <Ionicons name="snow" size={14} color="#0284C7" />
                  <Text style={styles.acVerifiedText}>
                    ❄️ Chilled Air Conditioning Guaranteed & Inspected
                  </Text>
                </View>
              )}
            </View>

            {/* Badges & Commendations */}
            {profile.badges && profile.badges.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Driver Badges & Compliments</Text>
                <View style={styles.badgeWrap}>
                  {profile.badges.map((badge, idx) => (
                    <View key={idx} style={styles.badgeChip}>
                      <Ionicons name="ribbon-outline" size={14} color={Colors.primary} />
                      <Text style={styles.badgeChipText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Customer Reviews & Feedback */}
            <View style={styles.cardSection}>
              <View style={styles.reviewsHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Passenger Reviews ({profile.reviews.length})
                </Text>
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.ratingPillText}>{profile.ratingAverage.toFixed(1)} / 5.0</Text>
                </View>
              </View>

              {profile.reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet. Be the first to rate!</Text>
              ) : (
                profile.reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.passengerAvatar}>
                          <Text style={styles.passengerInitial}>
                            {rev.customerName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ marginLeft: 8 }}>
                          <Text style={styles.passengerName}>{rev.customerName}</Text>
                          <Text style={styles.reviewDate}>{rev.createdAt}</Text>
                        </View>
                      </View>

                      {/* Star Rating Display */}
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= rev.rating ? 'star' : 'star-outline'}
                            size={14}
                            color={star <= rev.rating ? '#FFB800' : '#CBD5E1'}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Compliment Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <View style={styles.reviewTagsRow}>
                        {rev.tags.map((tag, tIdx) => (
                          <View key={tIdx} style={styles.reviewTagChip}>
                            <Text style={styles.reviewTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Multiline Review Comment */}
                    {rev.comment ? (
                      <Text style={styles.reviewCommentText}>"{rev.comment}"</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomBar}>
            {onAcceptOffer && acceptFare ? (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onAcceptOffer();
                }}
                style={styles.primaryAcceptBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryAcceptBtnText}>
                  Accept Offer • Rs. {acceptFare}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeFullBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.closeFullBtnText}>Close Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 30, 66, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    width: '100%',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  identityCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  verifiedBadgeCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  memberSinceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verificationPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  ratingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.borderLight,
  },
  cardSection: {
    marginTop: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleModelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  plateTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  plateText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  acVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  acVerifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  badgeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  ratingPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  noReviewsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  reviewItem: {
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  passengerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  reviewTagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reviewTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  reviewCommentText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  primaryAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  primaryAcceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeFullBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  closeFullBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
