import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Car,
  Wrench,
  Users,
  ShieldCheck,
  Wallet,
  Sliders,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Operations Radar', icon: LayoutDashboard },
    { id: 'rides', label: 'Active Rides', icon: Car },
    { id: 'assistance', label: 'Roadside & Services', icon: Wrench },
    { id: 'providers', label: 'Provider KYC & Fleet', icon: ShieldCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'finance', label: 'Finance & Ledger', icon: Wallet },
    { id: 'pricing', label: 'Surge & Pricing Rules', icon: Sliders },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.brandBadge}>PK</div>
        <div>
          <h1 style={styles.brandTitle}>Pakistan Super App</h1>
          <p style={styles.brandSubtitle}>Command & Operations</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {}),
              }}
            >
              <Icon size={18} color={isActive ? '#00875A' : '#94A3B8'} />
              <span
                style={{
                  ...styles.navLabel,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Operator Session Info */}
      <div style={styles.operatorCard}>
        <div style={styles.statusPulse} />
        <div>
          <p style={styles.operatorRole}>SUPER_ADMIN</p>
          <p style={styles.operatorEmail}>ops.karachi@superapp.pk</p>
        </div>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0F172A',
    borderRight: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '20px 16px',
    flexShrink: 0,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    paddingLeft: '8px',
  },
  brandBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(0, 135, 90, 0.4)',
  },
  brandTitle: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#F8FAFC',
    lineHeight: '1.2',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  navButtonActive: {
    backgroundColor: '#1E293B',
    borderLeft: '3px solid #00875A',
  },
  navLabel: {
    fontSize: '13px',
  },
  operatorCard: {
    marginTop: 'auto',
    backgroundColor: '#1E293B',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusPulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 8px #10B981',
  },
  operatorRole: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#10B981',
  },
  operatorEmail: {
    fontSize: '11px',
    color: '#94A3B8',
  },
};
