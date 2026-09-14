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
import { MechanicProblemType } from '@superapp/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { MapSimulationView } from '../../src/components/MapSimulationView';

export default function MechanicRequestScreen() {
  const router = useRouter();
  const {
    pickupLocation,
    activeMechanic,
    mechanicOffers,
    createMechanicRequest,
    acceptMechanicOffer,
  } = useAppStore();

  const [selectedProblem, setSelectedProblem] = useState<MechanicProblemType>(
    MechanicProblemType.DEAD_BATTERY
  );
  const [vehicleMake, setVehicleMake] = useState('Suzuki');
  const [vehicleModel, setVehicleModel] = useState('Alto 660cc (2022)');
  const [description, setDescription] = useState(
    'Engine won’t crank, clicking noise when turning key. Need jumpstart or replacement.'
  );
  const [offeredFee, setOfferedFee] = useState(800);

  const problems = [
    { type: MechanicProblemType.DEAD_BATTERY, title: 'Dead Battery', icon: 'car-battery', base: 800 },
    { type: MechanicProblemType.FLAT_TIRE, title: 'Flat Tire', icon: 'tire', base: 600 },
    { type: MechanicProblemType.TOWING_SERVICE, title: 'Towing Service', icon: 'tow-truck', base: 2500 },
    { type: MechanicProblemType.OVERHEATING, title: 'Overheating', icon: 'radiator', base: 900 },
    { type: MechanicProblemType.LOCKOUT, title: 'Key Lockout', icon: 'key', base: 1000 },
    { type: MechanicProblemType.FUEL_DELIVERY, title: 'Fuel Delivery', icon: 'gas-station', base: 700 },
    { type: MechanicProblemType.ENGINE_TROUBLE, title: 'Engine Breakdown', icon: 'engine', base: 1200 },
    { type: MechanicProblemType.GENERAL_INSPECTION, title: 'Diagnostic Check', icon: 'wrench', base: 800 },
  ];

  const handleSelectProblem = (item: (typeof problems)[0]) => {
    setSelectedProblem(item.type);
    setOfferedFee(item.base);
  };

  const handleCreateRequest = () => {
    createMechanicRequest(selectedProblem, description, offeredFee);
  };

  const handleAcceptMechanic = (offerId: string) => {
    acceptMechanicOffer(offerId);
    Alert.alert(
      'Mechanic Dispatched!',
      'Ustad Jamil is on his way with mobile diagnostic kit & jump cables.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Auto Roadside Assistance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* If an accepted mechanic exists, show live arrival tracking! */}
        {activeMechanic && activeMechanic.status === 'ACCEPTED' ? (
          <View>
            <MapSimulationView
              pickupName={pickupLocation.name}
              dropoffName="Roadside Breakdown Spot"
              driverName="Ustad Jamil (Auto Electrician)"
              driverVehicle="Mobile Workshop Van • KHI-4421"
              etaMinutes={8}
              distanceKm={2.4}
              statusText="Mechanic is en route with tools & battery kit"
              isProviderEnRoute={true}
            />

            <View style={styles.dispatchedCard}>
              <View style={styles.dispatchedHeader}>
                <View style={styles.mechanicAvatar}>
                  <Ionicons name="construct" size={28} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.mechanicName}>Ustad Jamil</Text>
                  <Text style={styles.mechanicSub}>Master Auto Electrician • 4.95 ★</Text>
                </View>
                <Text style={styles.mechanicFee}>Rs. {activeMechanic.finalAgreedFare}</Text>
              </View>

              <View style={styles.mechanicActions}>
                <TouchableOpacity
                  onPress={() => Alert.alert('Call', 'Dialing mechanic securely...')}
                  style={styles.actionPill}
                >
                  <Ionicons name="call" size={18} color={Colors.primary} />
                  <Text style={styles.actionPillText}>Call Ustad Jamil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Alert.alert('Message', 'Opening chat...')}
                  style={styles.actionPill}
                >
                  <Ionicons name="chatbubble" size={18} color={Colors.primary} />
                  <Text style={styles.actionPillText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Mechanic Arrived & Solved Problem"
              onPress={() => {
                useAppStore.setState({ activeMechanic: null, mechanicOffers: [] });
                Alert.alert('Service Completed', 'Thank you! Fee collected in cash.');
                router.replace('/(customer)/home');
              }}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        ) : activeMechanic && mechanicOffers.length > 0 ? (
          /* Real-Time Mechanic Offers Feed */
          <View>
            <View style={styles.biddingBanner}>
              <Ionicons name="radio-outline" size={26} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.biddingTitle}>Mechanic Offers Incoming</Text>
                <Text style={styles.biddingSub}>
                  Compare nearby mechanics, ratings & arrival times.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Available Quotes ({mechanicOffers.length})</Text>

            {mechanicOffers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerCardHeader}>
                  <View style={styles.offerMechanicAvatar}>
                    <Ionicons name="construct" size={22} color={Colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.offerName}>{offer.providerName}</Text>
                    <Text style={styles.offerMeta}>
                      {offer.providerRating} ★ ({offer.providerTotalJobs} repairs) • {offer.distanceKm} km
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.offerPrice}>Rs. {offer.offeredFare}</Text>
                    <Text style={styles.offerEta}>~{offer.etaMinutes} mins</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleAcceptMechanic(offer.id)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>Select Ustad (Rs. {offer.offeredFare})</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          /* Initial Request Wizard Form */
          <>
            {/* Current Breakdown Location */}
            <View style={styles.locationCard}>
              <Ionicons name="location-sharp" size={20} color={Colors.danger} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.locationLabel}>Breakdown Location</Text>
                <Text numberOfLines={1} style={styles.locationVal}>
                  {pickupLocation.name}
                </Text>
              </View>
            </View>

            {/* Select Breakdown Issue */}
            <Text style={styles.sectionHeader}>Select Breakdown Issue</Text>
            <View style={styles.problemsGrid}>
              {problems.map((p) => {
                const isSelected = p.type === selectedProblem;
                return (
                  <TouchableOpacity
                    key={p.type}
                    onPress={() => handleSelectProblem(p)}
                    style={[styles.problemCard, isSelected && styles.problemCardSelected]}
                  >
                    <MaterialCommunityIcons
                      name={p.icon as any}
                      size={28}
                      color={isSelected ? Colors.primary : Colors.textPrimary}
                    />
                    <Text style={[styles.problemTitle, isSelected && { color: Colors.primary }]}>
                      {p.title}
                    </Text>
                    <Text style={styles.problemPrice}>Est. Rs. {p.base}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vehicle Details */}
            <Text style={styles.sectionHeader}>Your Vehicle Details</Text>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Make & Model</Text>
              <TextInput
                value={`${vehicleMake} ${vehicleModel}`}
                onChangeText={(t) => setVehicleModel(t)}
                style={styles.textInputField}
                placeholder="e.g. Suzuki Alto, Honda Civic"
              />
              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>Problem Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={[styles.textInputField, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Describe symptoms (e.g. dead battery, strange noise)"
              />
            </View>

            {/* inDrive Mechanic Offer Bar */}
            <View style={styles.biddingBar}>
              <View>
                <Text style={styles.biddingBarTitle}>Offered Inspection / Service Fee</Text>
                <Text style={styles.biddingBarSub}>Mechanics will see your suggested price</Text>
              </View>
              <View style={styles.priceStepper}>
                <TouchableOpacity
                  onPress={() => setOfferedFee((prev) => Math.max(300, prev - 100))}
                  style={styles.stepBtn}
                >
                  <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepPriceText}>Rs. {offeredFee}</Text>
                <TouchableOpacity
                  onPress={() => setOfferedFee((prev) => prev + 100)}
                  style={styles.stepBtn}
                >
                  <Ionicons name="add" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={`Broadcast Request to Nearby Mechanics (Rs. ${offeredFee})`}
              onPress={handleCreateRequest}
              style={{ marginTop: Spacing.md }}
            />
          </>
        )}
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
  locationCard: {
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  problemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  problemCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    ...Shadows.sm,
  },
  problemCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  problemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  problemPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  biddingBar: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  biddingBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  biddingBarSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  priceStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: 4,
    alignSelf: 'flex-start',
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  stepPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    paddingHorizontal: Spacing.lg,
  },
  biddingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  biddingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  biddingSub: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  offerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerMechanicAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  offerMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  offerEta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  dispatchedCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  dispatchedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mechanicSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mechanicFee: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  mechanicActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
