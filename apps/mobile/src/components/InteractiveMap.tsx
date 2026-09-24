import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: 'PICKUP' | 'DROPOFF' | 'DRIVER' | 'MECHANIC' | 'USER';
  bearing?: number;
}

interface InteractiveMapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  pickupTitle?: string;
  dropoffTitle?: string;
  userLat?: number;
  userLng?: number;
  showUserLocation?: boolean;
  mode?: 'BOOKING' | 'TRACKING';
  tripState?: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  showGeofenceRing?: boolean;
  draggablePins?: boolean;
  drivers?: MapMarker[];
  isSearching?: boolean;
  height?: number | string;
  onPickupMoved?: (coords: { latitude: number; longitude: number }) => void;
  onDropoffMoved?: (coords: { latitude: number; longitude: number }) => void;
  onRouteCalculated?: (metrics: { distanceKm: number; durationMins: number }) => void;
  onDriverArrived?: () => void;
  onTripProgress?: (data: { distanceToDestinationKm: number; isNearDestination: boolean }) => void;
  style?: any;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickupLat = 24.8138, // Dolmen Mall Clifton Karachi
  pickupLng = 67.0305,
  dropoffLat = 24.8568, // FTC Shahrah-e-Faisal Karachi
  dropoffLng = 67.0544,
  pickupTitle = 'Pickup Location',
  dropoffTitle = 'Dropoff Destination',
  userLat,
  userLng,
  showUserLocation = true,
  mode = 'BOOKING',
  tripState = 'EN_ROUTE',
  showGeofenceRing = false,
  draggablePins = true,
  drivers = [
    {
      id: 'd1',
      title: 'Tariq',
      type: 'DRIVER',
      latitude: 24.825,
      longitude: 67.038,
      bearing: 45,
    },
    {
      id: 'd2',
      title: 'Asif',
      type: 'DRIVER',
      latitude: 24.821,
      longitude: 67.034,
      bearing: 120,
    },
  ],
  isSearching = false,
  height = 360,
  onPickupMoved,
  onDropoffMoved,
  onRouteCalculated,
  onDriverArrived,
  onTripProgress,
  style,
}) => {
  // Center halfway between pickup and dropoff
  const centerLat = (pickupLat + dropoffLat) / 2;
  const centerLng = (pickupLng + dropoffLng) / 2;

  // In tracking mode, pins are fixed so user watches live vehicle progress
  const canDrag = mode !== 'TRACKING' && draggablePins;

  // Listen for iframe postMessages when pickup/dropoff pin moves or driver arrives
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'PICKUP_MOVED' && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          onPickupMoved?.({
            latitude: Number(data.latitude.toFixed(4)),
            longitude: Number(data.longitude.toFixed(4)),
          });
        } else if (data && data.type === 'DROPOFF_MOVED' && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          onDropoffMoved?.({
            latitude: Number(data.latitude.toFixed(4)),
            longitude: Number(data.longitude.toFixed(4)),
          });
        } else if (data && data.type === 'ROUTE_CALCULATED') {
          onRouteCalculated?.({
            distanceKm: Number(data.distanceKm),
            durationMins: Number(data.durationMins),
          });
        } else if (data && data.type === 'DRIVER_ARRIVED') {
          onDriverArrived?.();
        } else if (data && data.type === 'DRIVER_TRIP_PROGRESS') {
          onTripProgress?.({
            distanceToDestinationKm: Number(data.distanceToDestinationKm),
            isNearDestination: Boolean(data.isNearDestination),
          });
        }
      } catch {
        // Non-JSON postMessage
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPickupMoved, onDropoffMoved, onRouteCalculated, onDriverArrived, onTripProgress]);

  const driversKey = drivers
    .map((d) => `${d.id}:${d.latitude.toFixed(4)}:${d.longitude.toFixed(4)}:${d.bearing || 0}`)
    .join('|');

  // Generate self-contained Leaflet HTML with real OSRM turn-by-turn routing
  const leafletHtml = useMemo(() => {
    const isTracking = mode === 'TRACKING';
    const activeDriver = drivers.find((d) => d.type === 'DRIVER') || drivers[0];
    const drLat = activeDriver ? activeDriver.latitude : pickupLat + 0.011;
    const drLng = activeDriver ? activeDriver.longitude : pickupLng - 0.005;

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
      background-color: #E5E7EB;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .clean-pin-icon, .clean-car-icon, .custom-div-icon {
      background: transparent !important;
      border: none !important;
    }
    /* Clean Green Pickup Pin */
    .pickup-beacon {
      background-color: #00875A;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ${canDrag ? 'grab' : 'default'};
      user-select: none;
      transition: transform 0.15s ease;
    }
    .pickup-beacon:active {
      cursor: grabbing;
      transform: scale(1.2);
    }
    .pickup-inner-dot {
      width: 7px;
      height: 7px;
      background-color: #FFFFFF;
      border-radius: 50%;
      pointer-events: none;
    }
    /* Clean Red Dropoff Pin */
    .dropoff-beacon {
      background-color: #EF4444;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      cursor: ${canDrag ? 'grab' : 'default'};
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      transition: transform 0.15s ease;
    }
    .dropoff-beacon:active {
      cursor: grabbing;
      transform: scale(1.2);
    }
    .dropoff-inner-square {
      width: 7px;
      height: 7px;
      background-color: #FFFFFF;
      border-radius: 2px;
      pointer-events: none;
    }
    /* Strip bulky Leaflet speech bubble wrapper */
    .leaflet-popup {
      margin-bottom: 5px;
    }
    .leaflet-popup-content-wrapper {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }
    .leaflet-popup-content {
      margin: 0 !important;
      line-height: 1 !important;
    }
    .leaflet-popup-tip-container {
      display: none !important;
    }
    /* Sleek Mini Google Maps Style ETA Pill */
    .route-eta-chip {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 2px 6px rgba(0,0,0,0.22);
      border-radius: 12px;
      padding: 3px 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .route-eta-time {
      font-size: 11px;
      font-weight: 800;
      color: #38BDF8;
    }
    .route-eta-dist {
      font-size: 10px;
      font-weight: 600;
      color: #E2E8F0;
    }
    /* Clean Moving Vehicle Marker */
    .moving-car-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 46px;
    }
    .car-halo {
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.28);
      animation: carHalo 2s infinite ease-out;
    }
    @keyframes carHalo {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .car-svg-wrap {
      position: relative;
      z-index: 2;
      transition: transform 0.4s ease-out;
    }
    /* Route Status Legend Pill */
    .route-legend-pill {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 5px 11px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
    }
    .legend-chip {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .legend-bar-covered {
      width: 14px;
      height: 4px;
      border-radius: 2px;
      background-color: #94A3B8;
      box-shadow: 0 0 0 1px #334155;
    }
    .legend-bar-remaining {
      width: 14px;
      height: 4px;
      border-radius: 2px;
      background-color: #2563EB;
      box-shadow: 0 0 0 1px #1E3A8A;
    }
    .legend-label {
      font-size: 10px;
      font-weight: 700;
      color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  ${
    isTracking
      ? `
  <div class="route-legend-pill">
    <div class="legend-chip">
      <div class="legend-bar-covered"></div>
      <span class="legend-label">Covered</span>
    </div>
    <div style="width: 1px; height: 10px; background: rgba(255,255,255,0.25);"></div>
    <div class="legend-chip">
      <div class="legend-bar-remaining"></div>
      <span class="legend-label">Remaining</span>
    </div>
  </div>
  `
      : ''
  }
  <script>
    // Authentic top-down vehicle SVG
    var CAR_SVG = '<svg width="22" height="36" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="12" cy="20" rx="9" ry="16" fill="rgba(0,0,0,0.22)"/>' +
      '<rect x="3" y="4" width="18" height="32" rx="6" fill="#1E293B"/>' +
      '<rect x="4" y="5" width="16" height="30" rx="5" fill="#FFFFFF"/>' +
      '<path d="M5 11 Q12 9 19 11 L18 16 Q12 15 6 16 Z" fill="#334155"/>' +
      '<path d="M6 25 Q12 26 18 25 L19 28 Q12 30 5 28 Z" fill="#334155"/>' +
      '<rect x="6" y="16" width="12" height="9" rx="2" fill="#E2E8F0"/>' +
      '<circle cx="6" cy="5" r="1.5" fill="#FBBF24"/>' +
      '<circle cx="18" cy="5" r="1.5" fill="#FBBF24"/>' +
      '<circle cx="6" cy="34" r="1.2" fill="#EF4444"/>' +
      '<circle cx="18" cy="34" r="1.2" fill="#EF4444"/>' +
    '</svg>';

    function calcBearing(lat1, lng1, lat2, lng2) {
      var dLng = (lng2 - lng1) * Math.PI / 180;
      var y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
      var x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
      var b = Math.atan2(y, x) * 180 / Math.PI;
      return (b + 360) % 360;
    }

    function calcHaversineKm(lat1, lon1, lat2, lon2) {
      var R = 6371;
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    var map = L.map('map', {
      center: [${centerLat}, ${centerLng}],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 1. Clean Pickup Marker
    var pickupIcon = L.divIcon({
      className: 'clean-pin-icon',
      html: '<div class="pickup-beacon" title="Pickup Location"><div class="pickup-inner-dot"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var pickupMarker = L.marker([${pickupLat}, ${pickupLng}], {
      icon: pickupIcon,
      draggable: ${canDrag ? 'true' : 'false'},
      autoPan: true,
      zIndexOffset: 1000
    }).addTo(map);

    // 2. Clean Dropoff Marker
    var dropoffIcon = L.divIcon({
      className: 'clean-pin-icon',
      html: '<div class="dropoff-beacon" title="Dropoff Destination"><div class="dropoff-inner-square"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var dropoffMarker = L.marker([${dropoffLat}, ${dropoffLng}], {
      icon: dropoffIcon,
      draggable: ${canDrag ? 'true' : 'false'},
      autoPan: true,
      zIndexOffset: 1000
    }).addTo(map);

    // 3. Compact 400m Destination Geofence Ring (RENDER ONLY ON DRIVER END)
    var showGeofenceVisual = ${Boolean(showGeofenceRing)};
    var destinationGeofence = null;
    if (showGeofenceVisual) {
      destinationGeofence = L.circle([${dropoffLat}, ${dropoffLng}], {
        radius: 400, // Compact 400m radius (~800m diameter, realistic city block size)
        color: '#3B82F6',
        fillColor: '#60A5FA',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map);
    }

    // Covered / Completed Route Polylines (Area already traversed by driver)
    var coveredRouteBorder = L.polyline([], {
      color: '#334155', // Slate 700 outer casing
      weight: 8,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var coveredRouteLine = L.polyline([], {
      color: '#94A3B8', // Slate 400 clean muted grey (shows covered area)
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Remaining Route Polylines (Route remaining ahead: Driver Position -> Dropoff)
    var routeBorder = L.polyline([], {
      color: '#1E3A8A', // Deep navy outer casing
      weight: 8,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var routeLine = L.polyline([], {
      color: '#2563EB', // Vibrant electric navigation blue
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    function updateRouteSplit(step) {
      if (!mainRouteCoordinates || mainRouteCoordinates.length < 2) return;

      if (!isTrackingMode || currentTripPhase !== 'IN_PROGRESS' || step <= 0) {
        // Full route is remaining / pending (before trip start)
        coveredRouteBorder.setLatLngs([]);
        coveredRouteLine.setLatLngs([]);
        routeBorder.setLatLngs(mainRouteCoordinates);
        routeLine.setLatLngs(mainRouteCoordinates);
        return;
      }

      var total = mainRouteCoordinates.length;
      var clampedStep = Math.min(step, total - 1);

      // Area already covered by the driver
      var coveredPts = mainRouteCoordinates.slice(0, clampedStep + 1);
      // Remaining route left to destination
      var remainingPts = mainRouteCoordinates.slice(clampedStep);

      coveredRouteBorder.setLatLngs(coveredPts);
      coveredRouteLine.setLatLngs(coveredPts);

      routeBorder.setLatLngs(remainingPts);
      routeLine.setLatLngs(remainingPts);
    }

    var routePopup = L.popup({
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      offset: [0, -6]
    });

    var liveDriverMarker = null;
    var approachRouteLine = null;
    var mainRouteCoordinates = [];
    var isTrackingMode = ${isTracking ? 'true' : 'false'};
    var currentTripPhase = '${tripState}';
    var tripStep = 0;
    var mainTripTimer = null;

    // Real turn-by-turn OSRM routing engine for Main Trip
    function fetchOptimalRoadRoute(pLat, pLng, dLat, dLng) {
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
                pLng + ',' + pLat + ';' + dLng + ',' + dLat +
                '?overview=full&geometries=geojson';

      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var pts = route.geometry.coordinates.map(function(c) {
              return [c[1], c[0]];
            });
            mainRouteCoordinates = pts;
            updateRouteSplit(tripStep);

            var distanceKm = (route.distance / 1000).toFixed(1);
            var durationMins = Math.ceil(route.duration / 60);

            // In tracking mode, avoid intrusive popups that block the road and vehicle
            if (!isTrackingMode && pts.length > 2) {
              var midIdx = Math.floor(pts.length / 2);
              routePopup
                .setLatLng(pts[midIdx])
                .setContent('<div class="route-eta-chip"><span class="route-eta-time">' + durationMins + ' min</span><span class="route-eta-dist">(' + distanceKm + ' km)</span></div>')
                .openOn(map);
            }

            fitAllInView();

            window.parent.postMessage({
              type: 'ROUTE_CALCULATED',
              distanceKm: Number(distanceKm),
              durationMins: durationMins,
            }, '*');

            // If trip is in progress, navigate vehicle to dropoff
            if (currentTripPhase === 'IN_PROGRESS' && liveDriverMarker) {
              startMainTripDrive(mainRouteCoordinates);
            }
          } else {
            fallbackRoadRoute(pLat, pLng, dLat, dLng);
          }
        })
        .catch(function() {
          fallbackRoadRoute(pLat, pLng, dLat, dLng);
        });
    }

    function fallbackRoadRoute(pLat, pLng, dLat, dLng) {
      var midLat = Number(pLat) + (dLat - Number(pLat)) * 0.45;
      var midLng = Number(pLng) + (dLng - Number(pLng)) * 0.65;
      var pts = [
        [Number(pLat), Number(pLng)],
        [Number(pLat) + (midLat - Number(pLat)) * 0.5, Number(pLng)],
        [midLat, midLng],
        [dLat, Number(pLng) + (dLng - Number(pLng)) * 0.85],
        [dLat, dLng]
      ];
      mainRouteCoordinates = pts;
      updateRouteSplit(tripStep);

      if (!isTrackingMode && pts.length > 2) {
        var midIdx = Math.floor(pts.length / 2);
        routePopup
          .setLatLng(pts[midIdx])
          .setContent('<div class="route-eta-chip"><span class="route-eta-time">12 min</span><span class="route-eta-dist">(8.5 km)</span></div>')
          .openOn(map);
      }
      fitAllInView();

      if (currentTripPhase === 'IN_PROGRESS' && liveDriverMarker) {
        startMainTripDrive(mainRouteCoordinates);
      }
    }

    function fitAllInView() {
      var groupItems = [pickupMarker, dropoffMarker];
      if (liveDriverMarker) groupItems.push(liveDriverMarker);
      var group = new L.featureGroup(groupItems);
      map.fitBounds(group.getBounds().pad(0.24));
    }

    ${
      isTracking
        ? `
      // Setup Live Driver vehicle marker
      var liveCarHtml = '<div class="moving-car-container">' +
                        '<div class="car-halo"></div>' +
                        '<div class="car-svg-wrap">' + CAR_SVG + '</div>' +
                        '</div>';

      var driverIcon = L.divIcon({
        className: 'clean-car-icon',
        html: liveCarHtml,
        iconSize: [36, 46],
        iconAnchor: [18, 23]
      });

      var initialDriverPos = currentTripPhase === 'EN_ROUTE' ? [${drLat}, ${drLng}] : [${pickupLat}, ${pickupLng}];
      liveDriverMarker = L.marker(initialDriverPos, {
        icon: driverIcon,
        interactive: false,
        zIndexOffset: 999
      }).addTo(map);

      // Phase 1: EN_ROUTE Approach Navigation (to pickup)
      function fetchDriverApproachRoute(dLat, dLng, pLat, pLng) {
        var url = 'https://router.project-osrm.org/route/v1/driving/' +
                  dLng + ',' + dLat + ';' + pLng + ',' + pLat +
                  '?overview=full&geometries=geojson';

        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data && data.routes && data.routes.length > 0) {
              var approachPts = data.routes[0].geometry.coordinates.map(function(c) {
                return [c[1], c[0]];
              });
              startDriverTurnNavigation(approachPts);
            } else {
              fallbackApproachNavigation(dLat, dLng, pLat, pLng);
            }
          })
          .catch(function() {
            fallbackApproachNavigation(dLat, dLng, pLat, pLng);
          });
      }

      function startDriverTurnNavigation(pts) {
        if (!pts || pts.length < 2) return;

        approachRouteLine = L.polyline(pts, {
          color: '#10B981',
          weight: 5,
          opacity: 0.9,
          dashArray: '7, 7',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        liveDriverMarker.setLatLng(pts[0]);
        fitAllInView();

        var step = 0;
        var total = pts.length;

        var moveTimer = setInterval(function() {
          if (step < total - 1) {
            step++;
            var cur = pts[step];
            var prev = pts[step - 1];

            liveDriverMarker.setLatLng(cur);

            var angle = calcBearing(prev[0], prev[1], cur[0], cur[1]);
            var el = liveDriverMarker.getElement();
            if (el) {
              var wrap = el.querySelector('.car-svg-wrap');
              if (wrap) wrap.style.transform = 'rotate(' + angle + 'deg)';
            }

            approachRouteLine.setLatLngs(pts.slice(step));
          } else {
            // DRIVER HAS ARRIVED AT PICKUP LOCATION!
            clearInterval(moveTimer);
            liveDriverMarker.setLatLng([${pickupLat}, ${pickupLng}]);
            if (approachRouteLine) map.removeLayer(approachRouteLine);

            window.parent.postMessage({ type: 'DRIVER_ARRIVED' }, '*');
          }
        }, 650);
      }

      function fallbackApproachNavigation(dLat, dLng, pLat, pLng) {
        var pts = [];
        var corner1 = [dLat + (pLat - dLat) * 0.40, dLng];
        var corner2 = [dLat + (pLat - dLat) * 0.40, dLng + (pLng - dLng) * 0.70];
        var corner3 = [pLat, dLng + (pLng - dLng) * 0.70];
        function addLeg(p1, p2, n) {
          for (var i = 0; i < n; i++) {
            var f = i / n;
            pts.push([p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f]);
          }
        }
        addLeg([dLat, dLng], corner1, 8);
        addLeg(corner1, corner2, 8);
        addLeg(corner2, corner3, 8);
        pts.push([pLat, pLng]);
        startDriverTurnNavigation(pts);
      }

      // Phase 3: IN_PROGRESS Main Trip Navigation (to dropoff)
      function startMainTripDrive(pts) {
        if (!pts || pts.length < 2) return;
        tripStep = 0;
        var total = pts.length;
        liveDriverMarker.setLatLng(pts[0]);
        updateRouteSplit(0);

        if (mainTripTimer) clearInterval(mainTripTimer);

        // Initial progress post
        var initDist = calcHaversineKm(pts[0][0], pts[0][1], ${dropoffLat}, ${dropoffLng});
        window.parent.postMessage({
          type: 'DRIVER_TRIP_PROGRESS',
          distanceToDestinationKm: Number(initDist.toFixed(1)),
          isNearDestination: initDist <= 0.5
        }, '*');

        mainTripTimer = setInterval(function() {
          if (tripStep < total - 1) {
            tripStep++;
            var cur = pts[tripStep];
            var prev = pts[tripStep - 1];

            liveDriverMarker.setLatLng(cur);
            updateRouteSplit(tripStep);

            var angle = calcBearing(prev[0], prev[1], cur[0], cur[1]);
            var el = liveDriverMarker.getElement();
            if (el) {
              var wrap = el.querySelector('.car-svg-wrap');
              if (wrap) wrap.style.transform = 'rotate(' + angle + 'deg)';
            }

            var distKm = calcHaversineKm(cur[0], cur[1], ${dropoffLat}, ${dropoffLng});
            var isNear = distKm <= 0.5;

            if (destinationGeofence && isNear) {
              destinationGeofence.setStyle({ color: '#10B981', fillColor: '#34D399', fillOpacity: 0.25 });
            }

            window.parent.postMessage({
              type: 'DRIVER_TRIP_PROGRESS',
              distanceToDestinationKm: Number(distKm.toFixed(1)),
              isNearDestination: isNear
            }, '*');
          } else {
            clearInterval(mainTripTimer);
            tripStep = total - 1;
            updateRouteSplit(tripStep);
            liveDriverMarker.setLatLng([${dropoffLat}, ${dropoffLng}]);
            if (destinationGeofence) {
              destinationGeofence.setStyle({ color: '#10B981', fillColor: '#34D399', fillOpacity: 0.3 });
            }
            window.parent.postMessage({
              type: 'DRIVER_TRIP_PROGRESS',
              distanceToDestinationKm: 0,
              isNearDestination: true
            }, '*');
          }
        }, 750);
      }

      // Listen for fast-forward to near destination
      window.addEventListener('message', function(event) {
        try {
          var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.type === 'SIMULATE_NEAR_DESTINATION' && mainRouteCoordinates.length > 0) {
            var nearIdx = Math.max(0, mainRouteCoordinates.length - 2);
            tripStep = nearIdx;
            var pt = mainRouteCoordinates[nearIdx];
            liveDriverMarker.setLatLng(pt);
            updateRouteSplit(tripStep);
            if (destinationGeofence) {
              destinationGeofence.setStyle({ color: '#10B981', fillColor: '#34D399', fillOpacity: 0.3 });
            }
            window.parent.postMessage({
              type: 'DRIVER_TRIP_PROGRESS',
              distanceToDestinationKm: 0.3,
              isNearDestination: true
            }, '*');
          }
        } catch(e) {}
      });

      if (currentTripPhase === 'EN_ROUTE') {
        fetchDriverApproachRoute(${drLat}, ${drLng}, ${pickupLat}, ${pickupLng});
      } else if (currentTripPhase === 'ARRIVED') {
        liveDriverMarker.setLatLng([${pickupLat}, ${pickupLng}]);
      } else if (currentTripPhase === 'IN_PROGRESS') {
        // Will be triggered when main route loads
      } else if (currentTripPhase === 'COMPLETED') {
        liveDriverMarker.setLatLng([${dropoffLat}, ${dropoffLng}]);
        tripStep = 999999;
        updateRouteSplit(tripStep);
      }
    `
        : `
      // Booking Mode: Render clean cars on nearby roads
      var driverData = ${JSON.stringify(drivers)};
      driverData.forEach(function(d) {
        var icon = L.divIcon({
          className: 'clean-car-icon',
          html: '<div style="display:flex; align-items:center; justify-content:center; transform: rotate(' + (d.bearing || 0) + 'deg);">' + CAR_SVG + '</div>',
          iconSize: [24, 38],
          iconAnchor: [12, 19]
        });
        L.marker([d.latitude, d.longitude], {
          icon: icon,
          interactive: false,
          zIndexOffset: 200
        }).addTo(map);
      });
    `
    }

    // Initial load route calculation (Pickup to Dropoff)
    fetchOptimalRoadRoute(${pickupLat}, ${pickupLng}, ${dropoffLat}, ${dropoffLng});

    ${
      canDrag
        ? `
      pickupMarker.on('dragend', function(e) {
        var pos = pickupMarker.getLatLng();
        var dropPos = dropoffMarker.getLatLng();
        fetchOptimalRoadRoute(pos.lat, pos.lng, dropPos.lat, dropPos.lng);
        window.parent.postMessage({
          type: 'PICKUP_MOVED',
          latitude: pos.lat,
          longitude: pos.lng
        }, '*');
      });

      dropoffMarker.on('dragend', function(e) {
        var pos = dropoffMarker.getLatLng();
        var pickPos = pickupMarker.getLatLng();
        fetchOptimalRoadRoute(pickPos.lat, pickPos.lng, pos.lat, pos.lng);
        window.parent.postMessage({
          type: 'DROPOFF_MOVED',
          latitude: pos.lat,
          longitude: pos.lng
        }, '*');
      });

      map.on('click', function(e) {
        var clickLat = e.latlng.lat;
        var clickLng = e.latlng.lng;
        var pickPos = pickupMarker.getLatLng();
        var dropPos = dropoffMarker.getLatLng();

        var distToPickup = Math.hypot(clickLat - pickPos.lat, clickLng - pickPos.lng);
        var distToDropoff = Math.hypot(clickLat - dropPos.lat, clickLng - dropPos.lng);

        if (distToPickup < distToDropoff) {
          pickupMarker.setLatLng(e.latlng);
          fetchOptimalRoadRoute(clickLat, clickLng, dropPos.lat, dropPos.lng);
          window.parent.postMessage({ type: 'PICKUP_MOVED', latitude: clickLat, longitude: clickLng }, '*');
        } else {
          dropoffMarker.setLatLng(e.latlng);
          fetchOptimalRoadRoute(pickPos.lat, pickPos.lng, clickLat, clickLng);
          window.parent.postMessage({ type: 'DROPOFF_MOVED', latitude: clickLat, longitude: clickLng }, '*');
        }
      });
    `
        : ''
    }
  </script>
</body>
</html>
    `;
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driversKey, isSearching, pickupTitle, dropoffTitle, mode, tripState, showGeofenceRing, canDrag]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }, style]}>
        <iframe
          title="OpenStreetMap Karachi Live"
          srcDoc={leafletHtml}
          style={styles.webIframe as any}
          frameBorder="0"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <Text style={styles.liveText}>OpenStreetMap Active</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  webIframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  liveText: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
});
