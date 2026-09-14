import React, { useState } from 'react';
import { Car, Wrench, Shield, Navigation, AlertCircle } from 'lucide-react';

export interface RadarProvider {
  id: string;
  name: string;
  phone: string;
  category: 'RIDE' | 'MECHANIC' | 'TECH';
  vehicle: string;
  plate: string;
  rating: number;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'ON_JOB' | 'IDLE';
  zone: string;
}

export const OperationsLiveMap: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'RIDE' | 'MECHANIC'>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<RadarProvider | null>(null);

  const activeProviders: RadarProvider[] = [
    {
      id: 'prov-driver-001',
      name: 'Tariq Mehmood',
      phone: '+92 321 9876543',
      category: 'RIDE',
      vehicle: 'Toyota Corolla GLI (White)',
      plate: 'KHI-9821',
      rating: 4.9,
      latitude: 24.8145,
      longitude: 67.0315,
      status: 'ON_JOB',
      zone: 'Clifton Block 4',
    },
    {
      id: 'prov-driver-002',
      name: 'Muhammad Asif',
      phone: '+92 333 5551234',
      category: 'RIDE',
      vehicle: 'Honda CD 70',
      plate: 'KHI-5541',
      rating: 4.8,
      latitude: 24.858,
      longitude: 67.055,
      status: 'ONLINE',
      zone: 'Shahrah-e-Faisal',
    },
    {
      id: 'prov-driver-003',
      name: 'Rashid Khan',
      phone: '+92 345 8889999',
      category: 'RIDE',
      vehicle: 'Sazgar 4-Stroke Rickshaw',
      plate: 'KHI-7712',
      rating: 4.7,
      latitude: 24.919,
      longitude: 67.098,
      status: 'ONLINE',
      zone: 'Gulshan-e-Iqbal',
    },
    {
      id: 'prov-mech-001',
      name: 'Ustad Jamil',
      phone: '+92 300 4443322',
      category: 'MECHANIC',
      vehicle: 'Mobile Auto Electrician Van',
      plate: 'KHI-4421',
      rating: 4.95,
      latitude: 24.815,
      longitude: 67.032,
      status: 'ONLINE',
      zone: 'Clifton / Sea View',
    },
    {
      id: 'prov-mech-002',
      name: 'Korangi Mobile Towing',
      phone: '+92 312 6667788',
      category: 'MECHANIC',
      vehicle: 'Heavy Recovery Flatbed Crane',
      plate: 'KHI-3319',
      rating: 4.88,
      latitude: 24.857,
      longitude: 67.054,
      status: 'ON_JOB',
      zone: 'Korangi Industrial / Shahrah',
    },
  ];

  const filtered = activeProviders.filter(
    (p) => filterCategory === 'ALL' || p.category === filterCategory
  );

  return (
    <div style={styles.container}>
      {/* Top Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterTitleRow}>
          <div style={styles.radarDot} />
          <h2 style={styles.filterTitle}>Live Operations Radar — Karachi Metropolitan Zone</h2>
          <span style={styles.providerCountBadge}>{filtered.length} Units Active</span>
        </div>

        <div style={styles.tabButtons}>
          <button
            onClick={() => setFilterCategory('ALL')}
            style={{
              ...styles.tabBtn,
              ...(filterCategory === 'ALL' ? styles.tabBtnActive : {}),
            }}
          >
            All Fleets
          </button>
          <button
            onClick={() => setFilterCategory('RIDE')}
            style={{
              ...styles.tabBtn,
              ...(filterCategory === 'RIDE' ? styles.tabBtnActive : {}),
            }}
          >
            Rides (Cars, Bikes, Rickshaws)
          </button>
          <button
            onClick={() => setFilterCategory('MECHANIC')}
            style={{
              ...styles.tabBtn,
              ...(filterCategory === 'MECHANIC' ? styles.tabBtnActive : {}),
            }}
          >
            Roadside Mechanics & Towing
          </button>
        </div>
      </div>

      {/* Main Radar Canvas */}
      <div style={styles.mapCanvas}>
        {/* Stylized Dark Operations Grid */}
        <div style={{ ...styles.gridLineHorizontal, top: '25%' }} />
        <div style={{ ...styles.gridLineHorizontal, top: '50%' }} />
        <div style={{ ...styles.gridLineHorizontal, top: '75%' }} />
        <div style={{ ...styles.gridLineVertical, left: '20%' }} />
        <div style={{ ...styles.gridLineVertical, left: '50%' }} />
        <div style={{ ...styles.gridLineVertical, left: '80%' }} />

        {/* Karachi Geographic Landmarks */}
        <div style={{ ...styles.geoTag, top: '18%', left: '16%' }}>
          <Navigation size={12} color="#64748B" />
          <span>Shahrah-e-Faisal Corridor</span>
        </div>
        <div style={{ ...styles.geoTag, top: '75%', left: '42%' }}>
          <Navigation size={12} color="#64748B" />
          <span>Clifton Beach & DHA Marine Drive</span>
        </div>
        <div style={{ ...styles.geoTag, top: '25%', left: '76%' }}>
          <Navigation size={12} color="#64748B" />
          <span>Jinnah International Airport Zone</span>
        </div>

        {/* Provider Markers */}
        {filtered.map((prov, index) => {
          // Calculate scatter positions across the map
          const posX = 22 + (index % 4) * 22;
          const posY = 28 + (index % 3) * 22;
          const isSelected = selectedProvider?.id === prov.id;

          return (
            <div
              key={prov.id}
              onClick={() => setSelectedProvider(prov)}
              style={{
                ...styles.markerWrapper,
                top: `${posY}%`,
                left: `${posX}%`,
                zIndex: isSelected ? 20 : 10,
              }}
            >
              <div
                style={{
                  ...styles.markerBeacon,
                  backgroundColor:
                    prov.category === 'MECHANIC'
                      ? '#D97706'
                      : prov.status === 'ON_JOB'
                      ? '#00875A'
                      : '#3B82F6',
                }}
              >
                {prov.category === 'MECHANIC' ? (
                  <Wrench size={16} color="#FFFFFF" />
                ) : (
                  <Car size={16} color="#FFFFFF" />
                )}
              </div>
              <div style={styles.markerLabel}>
                <span style={styles.markerName}>{prov.name}</span>
                <span style={styles.markerPlate}>{prov.plate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Provider Details Drawer */}
      {selectedProvider && (
        <div style={styles.providerDrawer}>
          <div style={styles.drawerHeader}>
            <div>
              <h3 style={styles.drawerName}>{selectedProvider.name}</h3>
              <p style={styles.drawerSub}>
                {selectedProvider.vehicle} • {selectedProvider.plate}
              </p>
            </div>
            <button onClick={() => setSelectedProvider(null)} style={styles.closeBtn}>
              ✕
            </button>
          </div>

          <div style={styles.drawerGrid}>
            <div>
              <p style={styles.drawerMetaLabel}>Zone</p>
              <p style={styles.drawerMetaVal}>{selectedProvider.zone}</p>
            </div>
            <div>
              <p style={styles.drawerMetaLabel}>Status</p>
              <p style={{ ...styles.drawerMetaVal, color: '#10B981' }}>{selectedProvider.status}</p>
            </div>
            <div>
              <p style={styles.drawerMetaLabel}>Rating</p>
              <p style={styles.drawerMetaVal}>{selectedProvider.rating} ★</p>
            </div>
            <div>
              <p style={styles.drawerMetaLabel}>Contact</p>
              <p style={styles.drawerMetaVal}>{selectedProvider.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1E293B',
    borderRadius: '14px',
    border: '1px solid #334155',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  filterBar: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  radarDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 10px #10B981',
  },
  filterTitle: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  providerCountBadge: {
    fontSize: '11px',
    backgroundColor: '#0F172A',
    color: '#94A3B8',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: 700,
  },
  tabButtons: {
    display: 'flex',
    gap: '8px',
  },
  tabBtn: {
    backgroundColor: '#0F172A',
    color: '#94A3B8',
    border: '1px solid #334155',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tabBtnActive: {
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    borderColor: '#00875A',
  },
  mapCanvas: {
    height: '380px',
    backgroundColor: '#0B132B',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  geoTag: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#64748B',
    fontWeight: 700,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  markerWrapper: {
    position: 'absolute',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  markerBeacon: {
    width: '34px',
    height: '34px',
    borderRadius: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  markerLabel: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  markerName: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#F8FAFC',
  },
  markerPlate: {
    display: 'block',
    fontSize: '10px',
    color: '#D97706',
    fontWeight: 800,
  },
  providerDrawer: {
    padding: '16px 20px',
    backgroundColor: '#0F172A',
    borderTop: '1px solid #334155',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  drawerName: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  drawerSub: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '2px',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    fontSize: '16px',
    cursor: 'pointer',
  },
  drawerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  drawerMetaLabel: {
    fontSize: '11px',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  drawerMetaVal: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#F8FAFC',
    marginTop: '2px',
  },
};
