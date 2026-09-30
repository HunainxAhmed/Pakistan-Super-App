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
        pickupLat: Number(r.pickupLatitude || 24.8138),
        pickupLng: Number(r.pickupLongitude || 67.0305),
        dropoffLat: Number(r.dropoffLatitude || 24.8568),
        dropoffLng: Number(r.dropoffLongitude || 67.0544),
        pickupAddress: r.pickupAddressText || 'Karachi',
        dropoffAddress: r.dropoffAddressText || 'Karachi',
        isSelected: selectedRequest?.id === r.id,
      }))
    );
  }, [requests, selectedRequest?.id]);

  const leafletHtml = useMemo(() => {
    const selPickupLat = selectedRequest ? Number(selectedRequest.pickupLatitude || 24.8138) : driverLat + 0.008;
    const selPickupLng = selectedRequest ? Number(selectedRequest.pickupLongitude || 67.0305) : driverLng - 0.005;
    const selDropoffLat = selectedRequest ? Number(selectedRequest.dropoffLatitude || 24.8568) : 24.8568;
    const selDropoffLng = selectedRequest ? Number(selectedRequest.dropoffLongitude || 67.0544) : 67.0544;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background-color: #E2E8F0;
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
      border: 1.5px solid rgba(0, 135, 90, 0.5);
      animation: radarPulse 2.2s infinite ease-out;
    }
    @keyframes radarPulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .driver-car-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #00875A;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
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
      box-shadow: 0 3px 12px rgba(15, 23, 42, 0.18);
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      transform-origin: center bottom;
    }
    .cust-pin-card:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
    }
    .cust-pin-card.selected {
      background: #00875A;
      border-color: #006644;
      box-shadow: 0 4px 16px rgba(0, 135, 90, 0.5);
      transform: scale(1.12);
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    /* Floating Navigation Guidance Bar */
    .nav-guidance-bar {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      background: #FFFFFF;
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 3px 12px rgba(15, 23, 42, 0.15);
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
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
        <span class="nav-sub" id="nav-address-text">${(selectedRequest.pickupAddressText || '').slice(0, 36)}...</span>
      </div>
    </div>
    <div class="nav-eta-badge">
      <span class="nav-eta-time" id="nav-eta-mins">Calculating...</span>
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
    try {
      var requestsData = ${serializedRequests};
      var driverLat = Number(${driverLat});
      var driverLng = Number(${driverLng});
      var selPickupLat = Number(${selPickupLat});
      var selPickupLng = Number(${selPickupLng});
      var selDropoffLat = Number(${selDropoffLat});
      var selDropoffLng = Number(${selDropoffLng});

      function calcDistKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Number((R * c).toFixed(1));
      }

      // Initialize map with center at driver
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

      // Force size update to prevent blank grey tiles in iframe
      setTimeout(function() {
        map.invalidateSize();
      }, 200);

      // 1. Driver Location Marker
      var driverCarSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>' +
      '</svg>';

      var driverIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="driver-halo-container" title="Your Position"><div class="driver-radar-wave"></div><div class="driver-car-icon-wrap">' + driverCarSvg + '</div></div>',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      L.marker([driverLat, driverLng], {
        icon: driverIcon,
        zIndexOffset: 1200
      }).addTo(map);

      // 2. Customer Request Pins
      var boundsPoints = [[driverLat, driverLng]];

      requestsData.forEach(function(req) {
        var isSelected = req.isSelected;
        var pinHtml = '<div class="cust-pin-card ' + (isSelected ? 'selected' : '') + '">' +
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

        // Clean marker click handler without fragile inline HTML quotes
        marker.on('click', function() {
          window.parent.postMessage({ type: 'SELECT_REQUEST', id: req.id }, '*');
        });
      });

      // 3. Polylines for Selected Request
      var approachRouteBorder = L.polyline([], {
        color: '#1E3A8A',
        weight: 7,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      var approachRouteLine = L.polyline([], {
        color: '#2563EB',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      var tripRouteBorder = L.polyline([], {
        color: '#064E3B',
        weight: 6,
        opacity: 0.7,
        dashArray: '6, 6'
      }).addTo(map);

      var tripRouteLine = L.polyline([], {
        color: '#00875A',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(map);

      // Dropoff Pin for selected trip
      if (requestsData.length > 0) {
        var destIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="dest-pin">🏁 Dropoff</div>',
          iconSize: [70, 22],
          iconAnchor: [35, 11]
        });
        L.marker([selDropoffLat, selDropoffLng], {
          icon: destIcon,
          zIndexOffset: 800
        }).addTo(map);
        boundsPoints.push([selDropoffLat, selDropoffLng]);
      }

      // Instant Proximity Calculation (Never show blank "... min")
      var directDistKm = calcDistKm(driverLat, driverLng, selPickupLat, selPickupLng);
      var directMins = Math.max(2, Math.round(directDistKm * 2.8));

      var etaMinsEl = document.getElementById('nav-eta-mins');
      var etaDistEl = document.getElementById('nav-eta-dist');
      if (etaMinsEl) etaMinsEl.innerText = directMins + ' min away';
      if (etaDistEl) etaDistEl.innerText = directDistKm + ' km to pickup';

      // Draw initial instant straight lines
      var initialApproachPts = [[driverLat, driverLng], [selPickupLat, selPickupLng]];
      approachRouteLine.setLatLngs(initialApproachPts);
      tripRouteLine.setLatLngs([[selPickupLat, selPickupLng], [selDropoffLat, selDropoffLng]]);

      // Fit bounds to show driver and customer locations
      if (boundsPoints.length > 1) {
        try {
          var bounds = L.latLngBounds(boundsPoints);
          map.fitBounds(bounds.pad(0.18));
        } catch(e) {}
      }

      // Fetch Turn-by-Turn OSRM Route asynchronously
      function fetchOptimalRoads() {
        var approachUrl = 'https://router.project-osrm.org/route/v1/driving/' +
                          driverLng + ',' + driverLat + ';' + selPickupLng + ',' + selPickupLat +
                          '?overview=full&geometries=geojson';

        fetch(approachUrl)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data && data.routes && data.routes.length > 0) {
              var route = data.routes[0];
              var pts = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
              approachRouteBorder.setLatLngs(pts);
              approachRouteLine.setLatLngs(pts);

              var distKm = (route.distance / 1000).toFixed(1);
              var durationMins = Math.max(2, Math.round(route.duration / 60));

              if (etaMinsEl) etaMinsEl.innerText = durationMins + ' min away';
              if (etaDistEl) etaDistEl.innerText = distKm + ' km to pickup';

              window.parent.postMessage({
                type: 'APPROACH_METRICS',
                distanceKm: Number(distKm),
                durationMins: durationMins
              }, '*');
            }
          })
          .catch(function() {});

        var tripUrl = 'https://router.project-osrm.org/route/v1/driving/' +
                      selPickupLng + ',' + selPickupLat + ';' + selDropoffLng + ',' + selDropoffLat +
                      '?overview=full&geometries=geojson';

        fetch(tripUrl)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data && data.routes && data.routes.length > 0) {
              var route = data.routes[0];
              var pts = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
              tripRouteBorder.setLatLngs(pts);
              tripRouteLine.setLatLngs(pts);
            }
          })
          .catch(function() {});
      }

      fetchOptimalRoads();
    } catch(err) {
      console.error('Radar Map Error:', err);
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
          style={styles.webIframe as any}
          title="Captain Radar Map"
          frameBorder="0"
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
    position: 'relative',
    overflow: 'hidden',
  },
  webIframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  fallbackText: {
    alignSelf: 'center',
    marginTop: 20,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
