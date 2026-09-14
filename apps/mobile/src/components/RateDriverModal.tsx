import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

interface RateDriverModalProps {
  visible: boolean;
  driverName: string;
  driverId?: string;
  vehicleInfo?: string;
  onSubmit: (rating: number, comment?: string, tags?: string[]) => void;
  onSkip: () => void;
}

const QUICK_TAGS = [
  '❄️ Ice Cold AC',
  '🧼 Clean Car',
  '🛡️ Safe Driving',
  '😊 Polite Driver',
  '⏱️ On-Time Pickup',
  '🗺️ Great Navigation',
];

const RATING_MOODS: Record<number, { text: string; color: string }> = {
  5: { text: 'Excellent! Outstanding ride', color: '#059669' },
  4: { text: 'Very Good! Smooth & safe', color: '#10B981' },
  3: { text: 'Average experience', color: '#D97706' },
  2: { text: 'Below expectations', color: '#EA580C' },
  1: { text: 'Needs significant improvement', color: '#DC2626' },
};

export const RateDriverModal: React.FC<RateDriverModalProps> = ({
  visible,
  driverName,
  vehicleInfo = 'Toyota Corolla GLI (White)',
  onSubmit,
  onSkip,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['❄️ Ice Cold AC', '🛡️ Safe Driving']);
  const [comment, setComment] = useState<string>('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit(rating, comment.trim() || undefined, selectedTags);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onSkip}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header with Skip Button */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Rate Your Driver</Text>
              <Text style={styles.headerSubtitle}>Your feedback shapes community standards</Text>
            </View>

            {/* Prominent Optional Skip Button */}
            <TouchableOpacity onPress={onSkip} style={styles.skipHeaderBtn} activeOpacity={0.7}>
              <Text style={styles.skipHeaderBtnText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Driver Identity Card */}
            <View style={styles.driverSummaryCard}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={32} color={Colors.primary} />
                <View style={styles.verifiedShield}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.driverNameText}>{driverName}</Text>
              <Text style={styles.driverVehicleText}>{vehicleInfo}</Text>
            </View>

            {/* 5-Star Interactive Rating Selector */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionQuestion}>How was your ride experience?</Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = star <= rating;
                  return (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.7}
                      onPress={() => setRating(star)}
                      style={styles.starTouchable}
                    >
                      <Ionicons
                        name={isSelected ? 'star' : 'star-outline'}
                        size={40}
                        color={isSelected ? '#FFB800' : '#CBD5E1'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Mood Caption */}
              <View style={styles.moodBadge}>
                <Text style={[styles.moodText, { color: RATING_MOODS[rating]?.color || Colors.primary }]}>
                  {RATING_MOODS[rating]?.text || 'Tap stars to rate'}
                </Text>
              </View>
            </View>

            {/* Quick Compliment Tags */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionBlockTitle}>What did you like the most?</Text>
              <View style={styles.tagsGrid}>
                {QUICK_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      activeOpacity={0.75}
                      onPress={() => toggleTag(tag)}
                      style={[styles.tagChip, isChecked && styles.tagChipActive]}
                    >
                      <Text style={[styles.tagText, isChecked && styles.tagTextActive]}>
                        {tag}
                      </Text>
                      {isChecked && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={Colors.primary}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Few lines of review text input */}
            <View style={styles.sectionBlock}>
              <View style={styles.commentHeaderRow}>
                <Text style={styles.sectionBlockTitle}>Write a review</Text>
                <Text style={styles.optionalTag}>Optional</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Share a few lines about the trip, vehicle cleanliness, AC, or driver courtesy..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={250}
                value={comment}
                onChangeText={setComment}
              />
              <Text style={styles.charCounter}>{comment.length} / 250 characters</Text>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="star" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit {rating}★ Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipBottomBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBottomBtnText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 30, 66, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  skipHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
  },
  skipHeaderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  driverSummaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatarCircle: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  verifiedShield: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  driverVehicleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.sm,
  },
  sectionQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starTouchable: {
    padding: 4,
  },
  moodBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  moodText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBlock: {
    marginTop: Spacing.lg,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionBlockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  footerBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
    ...Shadows.sm,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  skipBottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  skipBottomBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
