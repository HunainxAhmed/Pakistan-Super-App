import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { ServiceRequest } from '@superapp/types';

interface DriverRadarMapProps {
  driverLat?: number;
  driverLng?: number;
  driverAddress?: string;
  requests: ServiceRequest[];
  selectedRequestId?: string | null;
  onSelectRequest?: (requestId: string) => void;
  isOnline: boolean;
  height?: number;
  onMetricsCalculated?: (metrics: { distanceKm: number; durationMins: number }) => void;
  style?: any;
}

export const DriverRadarMap: React.FC<DriverRadarMapProps> = ({
  driverLat = 24.819, // Near Dolmen Mall Clifton, Karachi
  driverLng = 67.034,
  driverAddress = 'Dolmen Mall Clifton, Karachi',
  requests = [],
  selectedRequestId = null,
  onSelectRequest,
  isOnline = true,
  height = 340,
  onMetricsCalculated,
  style,
}) => {
  // Listen for iframe postMessages when customer marker is clicked
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'SELECT_REQUEST' && data.id) {
          onSelectRequest?.(data.id);
        } else if (data && data.type === 'APPROACH_METRICS') {
          onMetricsCalculated?.({
            distanceKm: Number(data.distanceKm),
            durationMins: Number(data.durationMins),
          });
        }
      } catch {
        // Non-JSON message
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectRequest, onMetricsCalculated]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0] || null;

  const serializedRequests = useMemo(() => {
    return JSON.stringify(
      requests.map((r) => ({
        id: r.id,
        name: r.customerName,
        fare: r.customerOfferedFare || r.suggestedFare || 400,
        pickupLat: r.pickupLatitude,
        pickupLng: r.pickupLongitude,
        dropoffLat: r.dropoffLatitude,
        dropoffLng: r.dropoffLongitude,
        pickupAddress: r.pickupAddressText,
        dropoffAddress: r.dropoffAddressText,
        isSelected: selectedRequest?.id === r.id,
      }))
    );
  }, [requests, selectedRequest?.id]);

  const leafletHtml = useMemo(() => {
    const selPickupLat = selectedRequest ? selectedRequest.pickupLatitude : driverLat + 0.008;
    const selPickupLng = selectedRequest ? selectedRequest.pickupLongitude : driverLng - 0.005;
    const selDropoffLat = selectedRequest ? selectedRequest.dropoffLatitude : 24.8568;
    const selDropoffLng = selectedRequest ? selectedRequest.dropoffLongitude : 67.0544;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .custom-marker {
      background: transparent !important;
      border: none !important;
    }
    /* Driver Vehicle Halo & Icon */
    .driver-halo-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
    }
    .driver-radar-wave {
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 135, 90, 0.22);
      border: 1.5px solid rgba(0, 135, 90, 0.45);
      animation: radarPulse 2.2s infinite ease-out;
    }
    @keyframes radarPulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .driver-car-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #00875A;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }
    /* Customer Request Pin */
    .cust-pin-card {
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 18px;
      padding: 3px 8px 3px 5px;
      box-shadow: 0 3px 12px rgba(15, 23, 42, 0.15);
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
      transform-origin: center bottom;
    }
    .cust-pin-card:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.22);
    }
    .cust-pin-card.selected {
      background: #00875A;
      border-color: #006644;
      box-shadow: 0 4px 16px rgba(0, 135, 90, 0.45);
      transform: scale(1.1);
      z-index: 1000;
    }
    .cust-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10B981;
      border: 1.5px solid #FFFFFF;
    }
    .cust-pin-card.selected .cust-dot {
      background: #FFFFFF;
      border-color: #00875A;
    }
    .cust-pin-name {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
    }
    .cust-pin-card.selected .cust-pin-name {
      color: #FFFFFF;
    }
    .cust-pin-fare {
      font-size: 11px;
      font-weight: 800;
      color: #00875A;
      background: #E3FCEF;
      padding: 1px 5px;
      border-radius: 8px;
    }
    .cust-pin-card.selected .cust-pin-fare {
      color: #00875A;
      background: #FFFFFF;
    }
    /* Dropoff Destination Pin */
    .dest-pin {
      background: #EF4444;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      white-space: nowrap;
    }
    /* Floating Navigation Guidance Bar */
    .nav-guidance-bar {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 1000;
      background: #FFFFFF;
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 3px 12px rgba(15, 23, 42, 0.12);
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-guidance-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    .nav-turn-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 14px;
    }
    .nav-text-col {
      display: flex;
      flex-direction: column;
    }
    .nav-title {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
    }
    .nav-sub {
      font-size: 10px;
      color: #64748B;
      font-weight: 500;
    }
    .nav-eta-badge {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .nav-eta-time {
      font-size: 12px;
      font-weight: 800;
      color: #1D4ED8;
    }
    .nav-eta-dist {
      font-size: 9px;
      font-weight: 600;
      color: #60A5FA;
    }
    /* Offline Overlay */
    .offline-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(248, 250, 252, 0.88);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
    .offline-title {
      font-size: 15px;
      font-weight: 800;
      color: #334155;
      margin-top: 8px;
    }
    .offline-sub {
      font-size: 12px;
      color: #64748B;
      margin-top: 4px;
    }
    /* Route ETA Tooltip */
    .eta-pill {
      background: #1E293B;
      color: #F8FAFC;
      border-radius: 10px;
      padding: 2px 7px;
      font-size: 10px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  ${
    isOnline && selectedRequest
      ? `
  <div class="nav-guidance-bar">
    <div class="nav-guidance-left">
      <div class="nav-turn-icon">↑</div>
      <div class="nav-text-col">
        <span class="nav-title" id="nav-guide-text">Pickup: ${selectedRequest.customerName}</span>
        <span class="nav-sub" id="nav-address-text">${selectedRequest.pickupAddressText.slice(0, 36)}...</span>
      </div>
    </div>
    <div class="nav-eta-badge">
      <span class="nav-eta-time" id="nav-eta-mins">... min</span>
      <span class="nav-eta-dist" id="nav-eta-dist">... km</span>
    </div>
  </div>
  `
      : ''
  }

  ${
    !isOnline
      ? `
  <div class="offline-overlay">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <div class="offline-title">Captain Radar Offline</div>
    <div class="offline-sub">Turn the Online switch above to scan for live passenger rides</div>
  </div>
  `
      : ''
  }

  <script>
    var requestsData = ${serializedRequests};
    var driverLat = ${driverLat};
    var driverLng = ${driverLng};
    var selPickupLat = ${selPickupLat};
    var selPickupLng = ${selPickupLng};
    var selDropoffLat = ${selDropoffLat};
    var selDropoffLng = ${selDropoffLng};

    var map = L.map('map', {
      center: [driverLat, driverLng],
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 1. Driver Location Marker
    var driverCarSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>' +
    '</svg>';

    var driverIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="driver-halo-container" title="Your Captain Position"><div class="driver-radar-wave"></div><div class="driver-car-icon-wrap">' + driverCarSvg + '</div></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    var driverMarker = L.marker([driverLat, driverLng], {
      icon: driverIcon,
      zIndexOffset: 1200
    }).addTo(map);

    // 2. Customer Request Pins
    var boundsPoints = [[driverLat, driverLng]];

    requestsData.forEach(function(req) {
      var isSelected = req.isSelected;
      var pinHtml = '<div class="cust-pin-card ' + (isSelected ? 'selected' : '') + '" onclick="window.parent.postMessage({ type: \'SELECT_REQUEST\', id: \'' + req.id + '\' }, \'*\')">' +
        '<div class="cust-dot"></div>' +
        '<span class="cust-pin-name">' + req.name + '</span>' +
        '<span class="cust-pin-fare">Rs. ' + req.fare + '</span>' +
      '</div>';

      var custIcon = L.divIcon({
        className: 'custom-marker',
        html: pinHtml,
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });

      var marker = L.marker([req.pickupLat, req.pickupLng], {
        icon: custIcon,
        zIndexOffset: isSelected ? 1100 : 900
      }).addTo(map);

      boundsPoints.push([req.pickupLat, req.pickupLng]);

      marker.on('click', function() {
        window.parent.postMessage({ type: 'SELECT_REQUEST', id: req.id }, '*');
      });
    });

    // 3. Polylines for Selected Request
    // Approach Route (Driver -> Customer Pickup)
    var approachRouteBorder = L.polyline([], {
      color: '#1E3A8A',
      weight: 7,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var approachRouteLine = L.polyline([], {
      color: '#2563EB', // Blue for Driver navigation to customer
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Main Passenger Route (Pickup -> Dropoff)
    var tripRouteBorder = L.polyline([], {
      color: '#064E3B',
      weight: 6,
      opacity: 0.7,
      dashArray: '6, 6'
    }).addTo(map);

    var tripRouteLine = L.polyline([], {
      color: '#00875A', // Green for Passenger Trip
      weight: 3.5,
      opacity: 0.9,
      dashArray: '6, 6'
    }).addTo(map);

    // Dropoff Marker for selected trip
    var dropoffPin = null;
    if (requestsData.length > 0) {
      var destIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="dest-pin">🏁 Dropoff</div>',
        iconSize: [70, 22],
        iconAnchor: [35, 11]
      });
      dropoffPin = L.marker([selDropoffLat, selDropoffLng], {
        icon: destIcon,
        zIndexOffset: 800
      }).addTo(map);
      boundsPoints.push([selDropoffLat, selDropoffLng]);
    }

    // Helper: Haversine distance
    function calcDistKm(lat1, lon1, lat2, lon2) {
      var R = 6371;
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // Fetch Approach Road Route (Driver -> Pickup)
    function fetchApproachRoute() {
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
                driverLng + ',' + driverLat + ';' + selPickupLng + ',' + selPickupLat +
                '?overview=full&geometries=geojson';

      fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var pts = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            approachRouteBorder.setLatLngs(pts);
            approachRouteLine.setLatLngs(pts);

            var distKm = (route.distance / 1000).toFixed(1);
            var durationMins = Math.max(2, Math.round(route.duration / 60));

            var etaMinsEl = document.getElementById('nav-eta-mins');
            var etaDistEl = document.getElementById('nav-eta-dist');
            if (etaMinsEl) etaMinsEl.innerText = durationMins + ' min away';
            if (etaDistEl) etaDistEl.innerText = distKm + ' km to pickup';

            window.parent.postMessage({
              type: 'APPROACH_METRICS',
              distanceKm: Number(distKm),
              durationMins: durationMins
            }, '*');
          } else {
            // Fallback direct line
            var fallbackPts = [[driverLat, driverLng], [selPickupLat, selPickupLng]];
            approachRouteLine.setLatLngs(fallbackPts);
            var directKm = calcDistKm(driverLat, driverLng, selPickupLat, selPickupLng).toFixed(1);
            var directMins = Math.max(2, Math.round(directKm * 2.8));
            var etaMinsEl = document.getElementById('nav-eta-mins');
            var etaDistEl = document.getElementById('nav-eta-dist');
            if (etaMinsEl) etaMinsEl.innerText = directMins + ' min away';
            if (etaDistEl) etaDistEl.innerText = directKm + ' km to pickup';
          }
        })
        .catch(function() {
          var fallbackPts = [[driverLat, driverLng], [selPickupLat, selPickupLng]];
          approachRouteLine.setLatLngs(fallbackPts);
        });
    }

    // Fetch Trip Route (Pickup -> Dropoff)
    function fetchTripRoute() {
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
                selPickupLng + ',' + selPickupLat + ';' + selDropoffLng + ',' + selDropoffLat +
                '?overview=full&geometries=geojson';

      fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var pts = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            tripRouteBorder.setLatLngs(pts);
            tripRouteLine.setLatLngs(pts);
          } else {
            tripRouteLine.setLatLngs([[selPickupLat, selPickupLng], [selDropoffLat, selDropoffLng]]);
          }
        })
        .catch(function() {
          tripRouteLine.setLatLngs([[selPickupLat, selPickupLng], [selDropoffLat, selDropoffLng]]);
        });
    }

    if (requestsData.length > 0) {
      fetchApproachRoute();
      fetchTripRoute();

      // Fit bounds to show driver and customer locations
      if (boundsPoints.length > 1) {
        map.fitBounds(boundsPoints, {
          padding: [50, 40],
          maxZoom: 15
        });
      }
    }
  </script>
</body>
</html>
    `;
  }, [
    driverLat,
    driverLng,
    driverAddress,
    serializedRequests,
    selectedRequest,
    isOnline,
  ]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }, style]}>
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Captain Radar Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <Text style={styles.fallbackText}>Captain Radar Map</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  fallbackText: {
    alignSelf: 'center',
    marginTop: 20,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
