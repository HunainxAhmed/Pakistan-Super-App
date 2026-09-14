import React from 'react';
import { Search, Bell, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      {/* Global Search Bar */}
      <div style={styles.searchWrap}>
        <Search size={16} color="#64748B" />
        <input
          type="text"
          placeholder="Search requests, drivers, phone (+92...), CNIC, plates..."
          style={styles.searchInput}
        />
      </div>

      {/* Right Controls */}
      <div style={styles.rightControls}>
        {/* City Scope Selector */}
        <div style={styles.cityPill}>
          <Globe size={14} color="#00875A" />
          <span style={styles.cityName}>Karachi, PK (Active)</span>
        </div>

        {/* Live Notification Indicator */}
        <div style={styles.iconCircle}>
          <Bell size={18} color="#94A3B8" />
          <div style={styles.badgeCount}>3</div>
        </div>

        {/* Admin Avatar */}
        <div style={styles.avatar}>HA</div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '64px',
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#1E293B',
    borderRadius: '8px',
    padding: '8px 14px',
    width: '420px',
    border: '1px solid #334155',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  cityPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '6px 14px',
  },
  cityName: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#F8FAFC',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
  },
  badgeCount: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 800,
    width: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
