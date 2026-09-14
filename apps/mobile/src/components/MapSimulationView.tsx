import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapSimulationViewProps {
  pickupName?: string;
  dropoffName?: string;
  driverName?: string;
  driverVehicle?: string;
  etaMinutes?: number;
  distanceKm?: number;
  statusText?: string;
  isProviderEnRoute?: boolean;
}

export const MapSimulationView: React.FC<MapSimulationViewProps> = ({
  pickupName = 'Dolmen Mall Clifton, Karachi',
  dropoffName = 'FTC Shahrah-e-Faisal, Karachi',
  driverName,
  driverVehicle,
  etaMinutes = 6,
  distanceKm = 4.8,
  statusText = 'Driver is en route to pickup',
  isProviderEnRoute = true,
}) => {
  // Simulated progress along route: 0.0 to 1.0
  const [progress, setProgress] = useState(0.2);

  useEffect(() => {
    if (!isProviderEnRoute) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.9) return 0.2; // loop for demo
        return Number((prev + 0.04).toFixed(3));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isProviderEnRoute]);

  // Coordinates interpolation within the visual map box
  const mapWidth = SCREEN_WIDTH - Spacing.lg * 2;
  const mapHeight = 260;

  // Path coordinates: from top-left (pickup) to bottom-right (dropoff)
  const pickupX = 40;
  const pickupY = 50;
  const dropoffX = mapWidth - 50;
  const dropoffY = mapHeight - 60;

  const currentX = pickupX + (dropoffX - pickupX) * progress;
  const currentY = pickupY + (dropoffY - pickupY) * progress;

  return (
    <View style={styles.container}>
      {/* Map Surface Representation */}
      <View style={styles.mapCanvas}>
        {/* Stylized Grid Lines resembling Karachi Road Network */}
        <View style={[styles.gridRoadHorizontal, { top: 70 }]} />
        <View style={[styles.gridRoadHorizontal, { top: 140 }]} />
        <View style={[styles.gridRoadHorizontal, { top: 200 }]} />
        <View style={[styles.gridRoadVertical, { left: 80 }]} />
        <View style={[styles.gridRoadVertical, { left: 180 }]} />
        <View style={[styles.gridRoadVertical, { left: 280 }]} />

        {/* Route Polyline (dashed trail) */}
        <View style={styles.routeLine} />

        {/* Landmark Chips */}
        <View style={[styles.landmarkChip, { top: 20, right: 20 }]}>
          <Text style={styles.landmarkText}>Shahrah-e-Faisal</Text>
        </View>
        <View style={[styles.landmarkChip, { bottom: 20, left: 20 }]}>
          <Text style={styles.landmarkText}>Clifton Beach Rd</Text>
        </View>

        {/* Pickup Pin */}
        <View style={[styles.markerPin, { left: pickupX, top: pickupY }]}>
          <View style={styles.pickupHalo} />
          <Ionicons name="location" size={24} color={Colors.primary} />
        </View>

        {/* Dropoff Pin */}
        <View style={[styles.markerPin, { left: dropoffX, top: dropoffY }]}>
          <Ionicons name="flag" size={22} color={Colors.danger} />
        </View>

        {/* Moving Provider Vehicle */}
        {isProviderEnRoute && (
          <View
            style={[
              styles.vehicleMarker,
              { left: currentX - 16, top: currentY - 16 },
            ]}
          >
            <View style={styles.vehicleHalo} />
            <MaterialCommunityIcons name="car" size={22} color={Colors.textWhite} />
          </View>
        )}

        {/* Top Floating ETA & Distance Pill */}
        <View style={styles.floatingStatsPill}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.statBold}>{etaMinutes} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="navigate-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{distanceKm} km</Text>
          </View>
        </View>
      </View>

      {/* Live Status Bar below Map */}
      <View style={styles.statusFooter}>
        <View style={styles.statusPulseDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{statusText}</Text>
          {driverName && (
            <Text style={styles.statusSub}>
              {driverName} • {driverVehicle || 'Toyota Corolla (White)'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  mapCanvas: {
    height: 260,
    backgroundColor: '#E8ECEF', // Subtle map canvas tint
    position: 'relative',
    overflow: 'hidden',
  },
  gridRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D0D5DD',
  },
  gridRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D0D5DD',
  },
  routeLine: {
    position: 'absolute',
    left: 55,
    top: 65,
    width: '78%',
    height: 5,
    backgroundColor: Colors.primary,
    opacity: 0.85,
    transform: [{ rotate: '25deg' }],
  },
  landmarkChip: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  landmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  markerPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupHalo: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  vehicleMarker: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadows.md,
  },
  vehicleHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 135, 90, 0.25)',
  },
  floatingStatsPill: {
    position: 'absolute',
    top: Spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBold: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statusPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
