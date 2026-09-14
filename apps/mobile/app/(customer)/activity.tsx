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

export default function ActivityScreen() {
  const router = useRouter();
  const { activeRide, activeMechanic } = useAppStore();

  const pastActivities = [
    {
      id: 'past-1',
      service: 'Super AC Premium',
      type: 'RIDE',
      date: 'Yesterday, 6:45 PM',
      from: 'Dolmen Mall Clifton',
      to: 'Khayaban-e-Shahbaz, DHA Phase 6',
      fare: 'Rs. 480',
      status: 'COMPLETED',
      driver: 'Tariq Mehmood (Corolla)',
    },
    {
      id: 'past-2',
      service: 'Roadside Battery Jumpstart',
      type: 'MECHANIC',
      date: '08 Sept, 11:20 AM',
      from: 'Shahrah-e-Faisal near FTC',
      to: 'Fixed on spot',
      fare: 'Rs. 800',
      status: 'COMPLETED',
      driver: 'Ustad Jamil',
    },
    {
      id: 'past-3',
      service: 'Super Bike',
      type: 'RIDE',
      date: '05 Sept, 9:15 AM',
      from: 'Gulshan-e-Iqbal Disco Bakery',
      to: 'I.I. Chundrigar Road',
      fare: 'Rs. 210',
      status: 'COMPLETED',
      driver: 'Muhammad Asif (Honda 70)',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Activity & Orders</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Trips / Requests in Progress */}
        {(activeRide || activeMechanic) && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionHeader}>In Progress</Text>
            {activeRide && (
              <TouchableOpacity
                onPress={() => router.push('/(customer)/ride-tracking')}
                style={styles.activeCard}
              >
                <View style={styles.activeCardTop}>
                  <View style={styles.serviceIconWrap}>
                    <MaterialCommunityIcons name="car" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.activeServiceTitle}>Ride in Progress</Text>
                    <Text style={styles.activeServiceSub}>
                      {activeRide.status === 'ACCEPTED' ? 'Driver En Route' : 'Bargaining / Finding Drivers'}
                    </Text>
                  </View>
                  <Badge
                    label={activeRide.status}
                    variant={activeRide.status === 'ACCEPTED' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.tapToViewText}>Tap to open live tracking map →</Text>
              </TouchableOpacity>
            )}

            {activeMechanic && (
              <TouchableOpacity
                onPress={() => router.push('/(customer)/mechanic-request')}
                style={styles.activeCard}
              >
                <View style={styles.activeCardTop}>
                  <View style={[styles.serviceIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="construct" size={22} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.activeServiceTitle}>Roadside Mechanic</Text>
                    <Text style={styles.activeServiceSub}>
                      {activeMechanic.status === 'ACCEPTED' ? 'Mechanic Dispatched' : 'Quotes Incoming'}
                    </Text>
                  </View>
                  <Badge
                    label={activeMechanic.status}
                    variant={activeMechanic.status === 'ACCEPTED' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.tapToViewText}>Tap to view mechanic details →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Past History */}
        <Text style={styles.sectionHeader}>Past Trips & Services</Text>
        <View style={styles.historyList}>
          {pastActivities.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{item.service}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyFare}>{item.fare}</Text>
              </View>

              <View style={styles.historyRoute}>
                <View style={styles.dotGreen} />
                <Text numberOfLines={1} style={styles.routeAddressText}>
                  {item.from}
                </Text>
              </View>
              <View style={styles.historyRoute}>
                <View style={styles.dotRed} />
                <Text numberOfLines={1} style={styles.routeAddressText}>
                  {item.to}
                </Text>
              </View>

              <View style={styles.historyFooter}>
                <Text style={styles.providerFooterText}>Partner: {item.driver}</Text>
                <Badge label="COMPLETED" variant="success" />
              </View>
            </View>
          ))}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  activeSection: {
    marginBottom: Spacing.xl,
  },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  activeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeServiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activeServiceSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tapToViewText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  historyList: {
    gap: Spacing.md,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyFare: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  historyRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.danger,
    marginRight: Spacing.sm,
  },
  routeAddressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  providerFooterText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
