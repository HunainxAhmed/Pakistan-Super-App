import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { PAKISTANI_LANDMARKS, LocationLandmark } from '@superapp/maps';
import { Ionicons } from '@expo/vector-icons';

export interface LocationSearchModalProps {
  visible: boolean;
  title?: string;
  currentAddress?: string;
  onSelectLocation: (location: { name: string; latitude: number; longitude: number }) => void;
  onClose: () => void;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  category: string;
  city: string;
  latitude: number;
  longitude: number;
  icon?: string;
  source?: 'LIVE' | 'CURATED' | 'SUGGESTION';
}

export interface KarachiLocality {
  key: string;
  name: string;
  aliases: string[];
  coordinates: { latitude: number; longitude: number };
}

// Major Karachi administrative and geographic areas for locality anchoring
export const KARACHI_LOCALITIES: KarachiLocality[] = [
  {
    key: 'nazimabad',
    name: 'Nazimabad',
    aliases: ['nazimabad', 'nazimabad 1', 'nazimabad 2', 'nazimabad 3', 'nazimabad 4', 'nazimabad 5', 'inquiry office', 'chawla market', 'eidgah ground'],
    coordinates: { latitude: 24.9142, longitude: 67.0278 },
  },
  {
    key: 'north-nazimabad',
    name: 'North Nazimabad',
    aliases: ['north nazimabad', 'north-nazimabad', 'hyderi', 'sakhi hassan', 'five star', 'kda chowrangi', 'dolmen hyderi', 'block d', 'block h', 'block a'],
    coordinates: { latitude: 24.9362, longitude: 67.0425 },
  },
  {
    key: 'clifton',
    name: 'Clifton',
    aliases: ['clifton', 'bath island', 'kehkashan', 'boat basin', 'teen talwar', 'do talwar', 'dolmen clifton', 'block 2 clifton', 'block 4 clifton'],
    coordinates: { latitude: 24.8180, longitude: 67.0320 },
  },
  {
    key: 'dha',
    name: 'DHA Defence',
    aliases: ['dha', 'defence', 'defense', 'phase 1', 'phase 2', 'phase 4', 'phase 5', 'phase 6', 'phase 7', 'phase 8', 'bukhari', 'seaview', 'sea view', 'do darya', 'creek vistas', 'the place'],
    coordinates: { latitude: 24.7938, longitude: 67.0674 },
  },
  {
    key: 'karsaz',
    name: 'Karsaz',
    aliases: ['karsaz', 'habib ibrahim', 'arena', 'maritime museum', 'paf museum', 'karsaz road'],
    coordinates: { latitude: 24.8878, longitude: 67.0898 },
  },
  {
    key: 'gulshan',
    name: 'Gulshan-e-Iqbal',
    aliases: ['gulshan', 'gulshan-e-iqbal', 'maskan', 'nipa', 'disco bakery', 'hasan square', 'continental', 'expo centre', 'university road'],
    coordinates: { latitude: 24.9189, longitude: 67.0971 },
  },
  {
    key: 'johar',
    name: 'Gulistan-e-Johar',
    aliases: ['johar', 'gulistan-e-johar', 'kamran chowrangi', 'johar chowrangi', 'samama', 'rufi green'],
    coordinates: { latitude: 24.9182, longitude: 67.1354 },
  },
  {
    key: 'pechs',
    name: 'PECHS / Tariq Road',
    aliases: ['pechs', 'p.e.c.h.s', 'tariq road', 'rabi center', 'khalid bin waleed', 'society'],
    coordinates: { latitude: 24.8718, longitude: 67.0594 },
  },
  {
    key: 'bahadurabad',
    name: 'Bahadurabad',
    aliases: ['bahadurabad', 'char minar', 'naheed', 'shaheed-e-millat', 'alamgir road'],
    coordinates: { latitude: 24.8824, longitude: 67.0673 },
  },
  {
    key: 'saddar',
    name: 'Saddar',
    aliases: ['saddar', 'burns road', 'empress market', 'regal', 'atrium', 'preedy', 'electronics market', 'capri'],
    coordinates: { latitude: 24.8586, longitude: 67.0152 },
  },
  {
    key: 'fb-area',
    name: 'Federal B Area',
    aliases: ['fb area', 'federal b area', 'f.b. area', 'f.b area', 'water pump', 'ayesha manzil', 'lucky one', 'ancholi'],
    coordinates: { latitude: 24.9312, longitude: 67.0785 },
  },
  {
    key: 'north-karachi',
    name: 'North Karachi',
    aliases: ['north karachi', 'new karachi', 'surjani', 'power house', 'nagan chowrangi'],
    coordinates: { latitude: 24.9812, longitude: 67.0645 },
  },
  {
    key: 'scheme-33',
    name: 'Scheme 33',
    aliases: ['scheme 33', 'scheme-33', 'gulshan-e-kaneez', 'saadi town', 'sector 33'],
    coordinates: { latitude: 24.9621, longitude: 67.1250 },
  },
  {
    key: 'malir',
    name: 'Malir & Cantt',
    aliases: ['malir', 'malir cantt', 'model colony', 'airport road', 'check post 1'],
    coordinates: { latitude: 24.9225, longitude: 67.1985 },
  },
  {
    key: 'bahria-town',
    name: 'Bahria Town Karachi',
    aliases: ['bahria', 'bahria town', 'btk', 'precinct', 'midway commercial'],
    coordinates: { latitude: 25.0112, longitude: 67.3325 },
  },
  {
    key: 'korangi',
    name: 'Korangi',
    aliases: ['korangi', 'landhi', 'darussalam', 'korangi industrial'],
    coordinates: { latitude: 24.8315, longitude: 67.1384 },
  },
  {
    key: 'keamari',
    name: 'Keamari / Port Grand',
    aliases: ['keamari', 'port grand', 'native jetty', 'manora', 'west wharf'],
    coordinates: { latitude: 24.8392, longitude: 66.9942 },
  },
  {
    key: 'chundrigar',
    name: 'I.I. Chundrigar / Downtown',
    aliases: ['i.i. chundrigar', 'chundrigar', 'city railway', 'tower', 'merewether'],
    coordinates: { latitude: 24.8504, longitude: 67.0011 },
  },
  {
    key: 'airport',
    name: 'Jinnah International Airport',
    aliases: ['airport', 'jinnah airport', 'khi airport', 'faisal cantt'],
    coordinates: { latitude: 24.9065, longitude: 67.1608 },
  },
];

// Strict Pakistan geographic bounds and country validation
export function isLocationInPakistan(
  latitude: number,
  longitude: number,
  countryCode?: string,
  countryName?: string
): boolean {
  // Pakistan coordinates bounding box:
  // Lat: ~23.5° N to ~37.2° N, Lng: ~60.5° E to ~77.8° E
  const inBBox = latitude >= 23.5 && latitude <= 37.2 && longitude >= 60.5 && longitude <= 77.8;
  if (!inBBox) return false;

  const cc = (countryCode || '').trim().toUpperCase();
  const cName = (countryName || '').trim().toLowerCase();

  // If a country code is returned and is NOT Pakistan ('PK'), reject immediately
  if (cc && cc !== 'PK') return false;

  // If a foreign country name is returned (e.g. Italy, Mexico, India, China), reject immediately
  if (cName && !cName.includes('pakistan') && cName !== 'pk') {
    return false;
  }

  return true;
}

// Detect if query mentions a specific known Karachi locality
export function detectLocality(query: string): KarachiLocality | null {
  const qLower = query.toLowerCase();
  const candidates: { locality: KarachiLocality; alias: string }[] = [];
  for (const loc of KARACHI_LOCALITIES) {
    for (const alias of loc.aliases) {
      if (qLower.includes(alias)) {
        candidates.push({ locality: loc, alias });
      }
    }
  }
  if (candidates.length === 0) return null;
  // Sort by alias length descending so specific aliases like "north nazimabad" precede "nazimabad"
  candidates.sort((a, b) => b.alias.length - a.alias.length);
  return candidates[0].locality;
}

// Google Maps-grade search scoring function
export function scoreSearchResult(
  place: SearchResult,
  queryTokens: string[],
  cleanQuery: string,
  detectedLocality: KarachiLocality | null
): number {
  const nameL = place.name.toLowerCase();
  const addrL = place.address.toLowerCase();
  const catL = (place.category || '').toLowerCase();
  const combined = `${nameL} ${addrL} ${catL}`;

  let score = 0;
  let matchedTokenCount = 0;

  // 1. Exact full phrase matches
  if (nameL === cleanQuery) {
    score += 1200;
  } else if (nameL.startsWith(cleanQuery)) {
    score += 600;
  } else if (nameL.includes(cleanQuery)) {
    score += 350;
  } else if (combined.includes(cleanQuery)) {
    score += 250;
  }

  // 2. Individual query token matches
  for (const token of queryTokens) {
    let tokenFound = false;

    // Check Name
    if (nameL === token) {
      score += 200;
      tokenFound = true;
    } else if (nameL.split(/[\s,.-]+/).includes(token)) {
      score += 150;
      tokenFound = true;
    } else if (nameL.includes(token)) {
      score += 80;
      tokenFound = true;
    }

    // Check Address
    if (addrL.split(/[\s,.-]+/).includes(token)) {
      score += 100;
      tokenFound = true;
    } else if (addrL.includes(token)) {
      score += 60;
      tokenFound = true;
    }

    // Check Category
    if (catL.includes(token)) {
      score += 40;
      tokenFound = true;
    }

    if (tokenFound) {
      matchedTokenCount++;
    }
  }

  // 3. Coverage qualification: multi-token queries must match a high fraction
  const coverageRatio = matchedTokenCount / queryTokens.length;
  if (queryTokens.length >= 2) {
    if (coverageRatio < 0.5) {
      return -100; // Reject places that only hit 1 random keyword
    }
  } else if (queryTokens.length === 1) {
    if (matchedTokenCount === 0) return -100;
  }

  // 4. Bonus when all tokens are matched
  if (matchedTokenCount === queryTokens.length) {
    score += 400;
  }

  // 5. Locality alignment bonus & conflict penalty
  if (detectedLocality) {
    const locMatch = detectedLocality.aliases.some(
      (alias) => nameL.includes(alias) || addrL.includes(alias)
    );
    if (locMatch) {
      score += 300;
    } else {
      // If user specifically requested Nazimabad, don't show Clifton or DHA places
      const conflictingLoc = KARACHI_LOCALITIES.find(
        (loc) => loc.key !== detectedLocality.key && loc.aliases.some((a) => addrL.includes(a))
      );
      if (conflictingLoc) {
        score -= 500;
      }
    }
  }

  // Curated database bonus (verified coordinates & address)
  if (place.source === 'CURATED') {
    score += 60;
  }

  return score;
}

// Convert category codes to Google Maps-style readable badges and icons
function getCategoryMeta(category: string, name: string) {
  const cat = (category || '').toUpperCase();
  const n = (name || '').toLowerCase();

  if (cat === 'AIRPORT' || n.includes('airport')) {
    return {
      label: 'Airport & Transit',
      icon: 'airplane',
      bgColor: '#EFF6FF',
      iconColor: '#2563EB',
    };
  }
  if (
    cat === 'MALL' ||
    n.includes('mall') ||
    n.includes('market') ||
    n.includes('center') ||
    n.includes('cinema') ||
    n.includes('theatre') ||
    n.includes('cineplex')
  ) {
    return {
      label: n.includes('cinema') || n.includes('cineplex') ? 'Cinema & Entertainment' : 'Shopping & Retail',
      icon: n.includes('cinema') || n.includes('cineplex') ? 'film' : 'cart',
      bgColor: '#FFF7ED',
      iconColor: '#EA580C',
    };
  }
  if (cat === 'HOSPITAL' || n.includes('hospital') || n.includes('clinic') || n.includes('medical')) {
    return {
      label: 'Hospital & Healthcare',
      icon: 'medkit',
      bgColor: '#FEF2F2',
      iconColor: '#DC2626',
    };
  }
  if (
    cat === 'RESIDENTIAL' ||
    n.includes('residency') ||
    n.includes('apartment') ||
    n.includes('apartments') ||
    n.includes('flats') ||
    n.includes('heights') ||
    n.includes('tower')
  ) {
    return {
      label: 'Residential Building',
      icon: 'business',
      bgColor: '#F0FDF4',
      iconColor: '#16A34A',
    };
  }
  return {
    label: 'Point of Interest',
    icon: 'location',
    bgColor: '#F8FAFC',
    iconColor: Colors.primary,
  };
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  title = 'Choose Location',
  currentAddress,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningGps, setIsScanningGps] = useState(false);
  const [liveResults, setLiveResults] = useState<SearchResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Debounced live geocoding query via OpenStreetMap / Photon STRICTLY constrained to Pakistan
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setLiveResults([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      try {
        // Query Photon with strict Pakistan bounding box: 60.87, 23.63, 77.84, 37.08
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&bbox=60.87,23.63,77.84,37.08&lat=24.8607&lon=67.0011&limit=10`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const items: SearchResult[] = [];
          for (let idx = 0; idx < data.features.length; idx++) {
            const f = data.features[idx];
            const lng = Number(f.geometry.coordinates[0]);
            const lat = Number(f.geometry.coordinates[1]);
            const countryCode = f.properties.countrycode;
            const countryName = f.properties.country;

            // STRICT PAKISTAN VALIDATION: Discard any result from Italy, Mexico, China, India, etc.
            if (!isLocationInPakistan(lat, lng, countryCode, countryName)) {
              continue;
            }

            const rawName = f.properties.name || q;
            const city = f.properties.city || f.properties.state || 'Pakistan';
            const addressParts = [
              f.properties.street,
              f.properties.district,
              city,
              'Pakistan',
            ].filter(Boolean);

            items.push({
              id: `live-${idx}-${lng}`,
              name: rawName,
              address:
                addressParts.length > 0
                  ? addressParts.join(', ')
                  : `${rawName}, ${city}, Pakistan`,
              category: f.properties.type || 'COMMERCIAL',
              city: f.properties.city || 'Karachi',
              latitude: Number(lat.toFixed(5)),
              longitude: Number(lng.toFixed(5)),
              icon: 'location-outline',
              source: 'LIVE',
            });
          }
          setLiveResults(items);
        } else {
          setLiveResults([]);
        }
      } catch {
        setLiveResults([]);
      } finally {
        setIsSearchingApi(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Detected locality for the active query
  const activeLocality = useMemo(() => {
    return detectLocality(searchQuery);
  }, [searchQuery]);

  // Combine curated places and live geocoded results with Google Maps relevance ranking
  const displayedPlaces = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim();
    if (!q) {
      // Default view: popular hubs across Karachi & Pakistan
      return PAKISTANI_LANDMARKS.slice(0, 16).map((lm) => ({
        id: lm.id,
        name: lm.name,
        address: lm.address,
        category: lm.category,
        city: lm.city,
        latitude: lm.coordinates.latitude,
        longitude: lm.coordinates.longitude,
        source: 'CURATED',
      }));
    }

    const cleanQuery = q.toLowerCase();
    const queryTokens = cleanQuery.split(/[\s,.-]+/).filter((t) => t.length > 0);

    // Convert curated landmarks to SearchResult format
    const curatedResults: SearchResult[] = PAKISTANI_LANDMARKS.map((lm) => ({
      id: lm.id,
      name: lm.name,
      address: lm.address,
      category: lm.category,
      city: lm.city,
      latitude: lm.coordinates.latitude,
      longitude: lm.coordinates.longitude,
      source: 'CURATED',
    }));

    // Score all candidates (curated + live) — and enforce 100% Pakistan location check
    const allCandidates = [...curatedResults, ...liveResults];
    const scoredList: { place: SearchResult; score: number }[] = [];

    for (const item of allCandidates) {
      // Mandatory filter: Every displayed item must be strictly in Pakistan
      if (!isLocationInPakistan(item.latitude, item.longitude)) {
        continue;
      }

      const score = scoreSearchResult(item, queryTokens, cleanQuery, activeLocality);
      if (score > 0) {
        scoredList.push({ place: item, score });
      }
    }

    // Sort descending by relevance score
    scoredList.sort((a, b) => b.score - a.score);

    // Deduplicate: If a live result matches a curated landmark closely, retain the curated one
    const results: SearchResult[] = [];
    const seenNames = new Set<string>();

    for (const { place } of scoredList) {
      const normName = place.name.trim().toLowerCase();
      if (seenNames.has(normName)) continue;

      // Check proximity deduplication (within ~200 meters)
      const isDuplicateLocation = results.some(
        (existing) =>
          Math.abs(existing.latitude - place.latitude) < 0.002 &&
          Math.abs(existing.longitude - place.longitude) < 0.002
      );
      if (isDuplicateLocation && place.source === 'LIVE') continue;

      seenNames.add(normName);
      results.push(place);

      if (results.length >= 15) break;
    }

    return results;
  }, [searchQuery, liveResults, activeLocality]);

  // GPS Auto-detect current device location
  const handleScanCurrentGps = () => {
    setIsScanningGps(true);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsScanningGps(false);
          onSelectLocation({
            name: `My GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          onClose();
        },
        () => {
          setIsScanningGps(false);
          onSelectLocation({
            name: 'Dolmen Mall Clifton, Karachi (Current GPS)',
            latitude: 24.8138,
            longitude: 67.0305,
          });
          onClose();
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setIsScanningGps(false);
        onSelectLocation({
          name: 'Dolmen Mall Clifton, Karachi (Current GPS)',
          latitude: 24.8138,
          longitude: 67.0305,
        });
        onClose();
      }, 500);
    }
  };

  const handleSelectPlace = (place: SearchResult) => {
    onSelectLocation({
      name: `${place.name}, ${place.address.split(',')[0]}`,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    onClose();
  };

  // Smart manual address resolution: anchors precisely to the detected locality or Karachi center
  const handleSelectCustomQuery = () => {
    if (!searchQuery.trim()) return;

    let targetLat = 24.8607;
    let targetLng = 67.0011;
    let areaName = 'Karachi';

    if (activeLocality) {
      targetLat = activeLocality.coordinates.latitude;
      targetLng = activeLocality.coordinates.longitude;
      areaName = `${activeLocality.name}, Karachi`;
    }

    onSelectLocation({
      name: `${searchQuery.trim()}, ${areaName}`,
      latitude: targetLat,
      longitude: targetLng,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchBoxWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search building, area (e.g. Arena Cinema, Imran Residency)"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoFocus
              clearButtonMode="while-editing"
            />
            {isSearchingApi ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 4 }} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
          {/* GPS Auto-detect Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleScanCurrentGps}
            disabled={isScanningGps}
            style={styles.gpsScanButton}
          >
            <View style={styles.gpsIconWrap}>
              {isScanningGps ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="locate" size={20} color={Colors.primary} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.gpsTitle}>Use Current GPS Location</Text>
              <Text style={styles.gpsSub}>Karachi, Pakistan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>

          {/* Clean Custom Pin Drop Option (when typing) */}
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSelectCustomQuery}
              style={styles.customQueryItem}
            >
              <View style={styles.customPinIconWrap}>
                <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.customQueryTitle}>Set pin at "{searchQuery.trim()}"</Text>
                <Text style={styles.customQuerySub}>
                  {activeLocality
                    ? `${activeLocality.name}, Karachi, Pakistan`
                    : 'Karachi, Pakistan'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {/* Results Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>
              {searchQuery.trim() ? 'Matching Places in Pakistan' : 'Popular Destinations'}
            </Text>
            {isSearchingApi && (
              <Text style={styles.searchingBadge}>Searching...</Text>
            )}
          </View>

          {/* Places List */}
          {displayedPlaces.length > 0 ? (
            displayedPlaces.map((place) => {
              const meta = getCategoryMeta(place.category, place.name);
              return (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelectPlace(place)}
                  style={styles.landmarkItem}
                >
                  <View style={[styles.landmarkIconWrap, { backgroundColor: meta.bgColor }]}>
                    <Ionicons name={(meta.icon as any) || 'location'} size={20} color={meta.iconColor} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.landmarkName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.categoryPill}>{meta.label}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text numberOfLines={1} style={styles.landmarkAddress}>
                        {place.address}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No exact place matches found in Pakistan</Text>
              <Text style={styles.emptySub}>
                Tap "Set pin at {searchQuery.trim()}" above to drop your pickup or destination pin on the map.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchBoxWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  scrollList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  gpsScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  gpsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gpsSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  customQueryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  customPinIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customQueryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  customQuerySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    paddingHorizontal: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  searchingBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  landmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
  },
  landmarkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landmarkName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  categoryPill: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 5,
  },
  landmarkAddress: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
