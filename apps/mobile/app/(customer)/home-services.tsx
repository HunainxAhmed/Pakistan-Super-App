import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { HomeServiceCategory } from '@superapp/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';

export default function HomeServicesScreen() {
  const router = useRouter();
  const { pickupLocation } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<HomeServiceCategory>(
    HomeServiceCategory.ELECTRICIAN
  );
  const [problemTitle, setProblemTitle] = useState('Ceiling Fan & Breaker Issue');
  const [description, setDescription] = useState(
    'Living room main circuit breaker trips whenever AC and fan run concurrently. Need urgent wiring inspection.'
  );
  const [isEmergency, setIsEmergency] = useState(false);

  const categories = [
    { cat: HomeServiceCategory.ELECTRICIAN, name: 'Electrician', icon: 'flash', fee: 800 },
    { cat: HomeServiceCategory.PLUMBER, name: 'Plumber', icon: 'water', fee: 750 },
    { cat: HomeServiceCategory.AC_TECHNICIAN, name: 'AC Technician', icon: 'snowflake', fee: 1200 },
    { cat: HomeServiceCategory.CARPENTER, name: 'Carpenter', icon: 'hammer', fee: 900 },
    { cat: HomeServiceCategory.APPLIANCE_REPAIR, name: 'Appliance Repair', icon: 'washing-machine', fee: 1000 },
    { cat: HomeServiceCategory.CLEANING, name: 'Home Deep Clean', icon: 'broom', fee: 2500 },
  ];

  const currentCatConfig = categories.find((c) => c.cat === selectedCategory) || categories[0];
  const totalInspectionFee = currentCatConfig.fee + (isEmergency ? 400 : 0);

  const handleBookService = () => {
    Alert.alert(
      'Service Booking Confirmed!',
      `A NADRA-verified ${currentCatConfig.name} will arrive at ${pickupLocation.name} with standard diagnostic toolset.\nInspection Fee: Rs. ${totalInspectionFee}`
    );
    router.replace('/(customer)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Home Maintenance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Location Banner */}
        <View style={styles.locationPill}>
          <Ionicons name="home-outline" size={18} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.locationLabel}>Service Address</Text>
            <Text numberOfLines={1} style={styles.locationVal}>
              {pickupLocation.name}
            </Text>
          </View>
        </View>

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Select Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((c) => {
            const isSelected = c.cat === selectedCategory;
            return (
              <TouchableOpacity
                key={c.cat}
                onPress={() => setSelectedCategory(c.cat)}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              >
                <MaterialCommunityIcons
                  name={c.icon as any}
                  size={26}
                  color={isSelected ? Colors.primary : Colors.textPrimary}
                />
                <Text style={[styles.categoryName, isSelected && { color: Colors.primary }]}>
                  {c.name}
                </Text>
                <Text style={styles.categoryFee}>From Rs. {c.fee}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Emergency Dispatch Switch */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsEmergency(!isEmergency)}
          style={[styles.emergencyBanner, isEmergency && styles.emergencyBannerActive]}
        >
          <Ionicons
            name={isEmergency ? 'flash' : 'flash-outline'}
            size={22}
            color={isEmergency ? '#DC2626' : Colors.textSecondary}
          />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={[styles.emergencyTitle, isEmergency && { color: '#DC2626' }]}>
              Emergency Immediate Dispatch (Within 30 min)
            </Text>
            <Text style={styles.emergencySub}>+Rs. 400 emergency technician priority surcharge</Text>
          </View>
          <View style={[styles.checkCircle, isEmergency && styles.checkCircleActive]}>
            {isEmergency && <Ionicons name="checkmark" size={14} color={Colors.textWhite} />}
          </View>
        </TouchableOpacity>

        {/* Job Details Input */}
        <Text style={styles.sectionTitle}>Describe the Job</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            value={problemTitle}
            onChangeText={setProblemTitle}
            style={styles.textInputField}
            placeholder="e.g. AC Gas Leak, Water Pipe Burst"
          />
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>Instructions & Details</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[styles.textInputField, { height: 75, textAlignVertical: 'top' }]}
            placeholder="Provide specific details about the issue..."
          />
        </View>

        {/* Pricing Summary */}
        <View style={styles.pricingSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Diagnostic Fee</Text>
            <Text style={styles.summaryVal}>Rs. {currentCatConfig.fee}</Text>
          </View>
          {isEmergency && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Emergency Rush Fee</Text>
              <Text style={styles.summaryVal}>Rs. 400</Text>
            </View>
          )}
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm }]}>
            <Text style={[styles.summaryLabel, { fontWeight: '800' }]}>Total Initial Inspection</Text>
            <Text style={[styles.summaryVal, { fontWeight: '800', color: Colors.primary }]}>
              Rs. {totalInspectionFee}
            </Text>
          </View>
        </View>

        <Button
          title={`Book Verified ${currentCatConfig.name} (Rs. ${totalInspectionFee})`}
          onPress={handleBookService}
          style={{ marginTop: Spacing.md }}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  locationVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  categoryFee: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  emergencyBannerActive: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emergencySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  textInputField: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pricingSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
