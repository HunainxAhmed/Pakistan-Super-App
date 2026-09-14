import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OperationsLiveMap } from './components/OperationsLiveMap';
import { RequestsTable, AdminRequestRow } from './components/RequestsTable';
import { ProviderKycWorkbench } from './components/ProviderKycWorkbench';
import {
  TrendingUp,
  CreditCard,
  Car,
  Wrench,
  Users,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const [requests, setRequests] = useState<AdminRequestRow[]>([
    {
      id: 'req-01',
      requestNumber: 'PK-84912',
      category: 'RIDE',
      serviceName: 'Super AC Premium',
      customerName: 'Sara Qureshi',
      customerPhone: '+92 300 1234567',
      providerName: 'Tariq Mehmood',
      amountPkr: 420,
      pickupAddress: 'Dolmen Mall Clifton, Gate 2',
      status: 'IN_PROGRESS',
      createdAt: '12 mins ago',
    },
    {
      id: 'req-02',
      requestNumber: 'MECH-51209',
      category: 'MECHANIC',
      serviceName: 'Roadside Battery Jumpstart',
      customerName: 'Bilal Farooq',
      customerPhone: '+92 321 4455667',
      providerName: 'Ustad Jamil',
      amountPkr: 800,
      pickupAddress: 'Shahrah-e-Faisal near FTC Building',
      status: 'ACCEPTED',
      createdAt: '8 mins ago',
    },
    {
      id: 'req-03',
      requestNumber: 'PK-99124',
      category: 'RIDE',
      serviceName: 'Super Bike',
      customerName: 'Zubair Akhtar',
      customerPhone: '+92 333 9988776',
      providerName: 'Muhammad Asif',
      amountPkr: 180,
      pickupAddress: 'Gulshan Disco Bakery Chowrangi',
      status: 'IN_PROGRESS',
      createdAt: '22 mins ago',
    },
    {
      id: 'req-04',
      requestNumber: 'HS-33219',
      category: 'HOME_SERVICE',
      serviceName: 'Emergency Electrician',
      customerName: 'Hamza Malik',
      customerPhone: '+92 345 1122334',
      amountPkr: 1200,
      pickupAddress: 'Khayaban-e-Shahbaz, DHA Phase 6',
      status: 'MATCHING',
      createdAt: '3 mins ago',
    },
  ]);

  const handleReassign = (id: string) => {
    alert(`Request ${id} marked for priority operational reassignment.`);
  };

  const handleCancelRefund = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'DISPUTED' as const } : r
      )
    );
    alert(`Request ${id} cancelled by admin. 100% wallet refund dispatched to customer.`);
  };

  return (
    <div style={styles.appContainer}>
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div style={styles.mainLayout}>
        <Header />

        <main style={styles.contentArea}>
          {/* Top Live KPI Ticker */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiTitle}>Today's GMV (Karachi)</span>
                <TrendingUp size={16} color="#10B981" />
              </div>
              <div style={styles.kpiValue}>Rs. 2,450,000</div>
              <div style={styles.kpiSub}>+18.4% vs last Thursday</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiTitle}>Platform Revenue (15%)</span>
                <CreditCard size={16} color="#3B82F6" />
              </div>
              <div style={styles.kpiValue}>Rs. 367,500</div>
              <div style={styles.kpiSub}>Commission collected</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiTitle}>Active Trips & Jobs</span>
                <Car size={16} color="#F59E0B" />
              </div>
              <div style={styles.kpiValue}>22 Active</div>
              <div style={styles.kpiSub}>14 Rides • 8 Roadside/Home</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiTitle}>Online Fleet Units</span>
                <ShieldCheck size={16} color="#00875A" />
              </div>
              <div style={styles.kpiValue}>342 Providers</div>
              <div style={styles.kpiSub}>98.2% verified by NADRA</div>
            </div>
          </div>

          {/* Dynamic Screen View */}
          {currentTab === 'dashboard' && (
            <>
              <OperationsLiveMap />
              <RequestsTable
                requests={requests}
                onReassign={handleReassign}
                onCancelRefund={handleCancelRefund}
              />
            </>
          )}

          {currentTab === 'rides' && (
            <RequestsTable
              requests={requests.filter((r) => r.category === 'RIDE')}
              onReassign={handleReassign}
              onCancelRefund={handleCancelRefund}
            />
          )}

          {currentTab === 'assistance' && (
            <RequestsTable
              requests={requests.filter((r) => r.category !== 'RIDE')}
              onReassign={handleReassign}
              onCancelRefund={handleCancelRefund}
            />
          )}

          {currentTab === 'providers' && <ProviderKycWorkbench />}

          {currentTab === 'pricing' && (
            <div style={styles.pricingCard}>
              <h3 style={styles.cardHeaderTitle}>Dynamic Surge & Pricing Engine Policy</h3>
              <p style={styles.cardHeaderSub}>
                Controls administrative multiplier limits. Changes are frozen in PostgreSQL audit logs.
              </p>
              <div style={styles.pricingZoneGrid}>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Clifton & DHA Zone</div>
                  <div style={styles.surgeValue}>1.0x (Normal)</div>
                  <p style={styles.zoneDesc}>Demand: 120 req/h | Supply: 145 drivers</p>
                </div>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Shahrah-e-Faisal Corridor</div>
                  <div style={{ ...styles.surgeValue, color: '#F59E0B' }}>1.3x (Rush Hour)</div>
                  <p style={styles.zoneDesc}>Demand: 210 req/h | Supply: 130 drivers</p>
                </div>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Gulshan & Johar Zone</div>
                  <div style={styles.surgeValue}>1.0x (Normal)</div>
                  <p style={styles.zoneDesc}>Demand: 80 req/h | Supply: 95 drivers</p>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'finance' && (
            <div style={styles.pricingCard}>
              <h3 style={styles.cardHeaderTitle}>Settlement & Double-Entry Ledger Overview</h3>
              <p style={styles.cardHeaderSub}>
                All financial transfers use immutable balanced ledger rows across JazzCash, Easypaisa, and Cash.
              </p>
              <div style={styles.pricingZoneGrid}>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Cash Collected in Hand</div>
                  <div style={styles.surgeValue}>Rs. 1,960,000</div>
                  <p style={styles.zoneDesc}>80% of Pakistani transaction volume</p>
                </div>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Digital Wallets Escrow</div>
                  <div style={{ ...styles.surgeValue, color: '#10B981' }}>Rs. 490,000</div>
                  <p style={styles.zoneDesc}>JazzCash, Easypaisa & in-app balances</p>
                </div>
                <div style={styles.zoneBox}>
                  <div style={styles.zoneName}>Pending Driver Payouts</div>
                  <div style={{ ...styles.surgeValue, color: '#60A5FA' }}>Rs. 142,500</div>
                  <p style={styles.zoneDesc}>Weekly 1Link direct bank transfers</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  mainLayout: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px 20px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kpiTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '4px',
  },
  pricingCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px',
  },
  cardHeaderTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  cardHeaderSub: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '2px',
    marginBottom: '16px',
  },
  pricingZoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  zoneBox: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px',
  },
  zoneName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#F8FAFC',
  },
  surgeValue: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#10B981',
    margin: '6px 0',
  },
  zoneDesc: {
    fontSize: '11px',
    color: '#64748B',
  },
};
