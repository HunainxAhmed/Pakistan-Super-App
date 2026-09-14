import React from 'react';
import { ShieldAlert, RefreshCw, XCircle } from 'lucide-react';

export interface AdminRequestRow {
  id: string;
  requestNumber: string;
  category: 'RIDE' | 'MECHANIC' | 'HOME_SERVICE';
  serviceName: string;
  customerName: string;
  customerPhone: string;
  providerName?: string;
  amountPkr: number;
  pickupAddress: string;
  status: 'REQUESTED' | 'MATCHING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED';
  createdAt: string;
}

interface RequestsTableProps {
  requests: AdminRequestRow[];
  onReassign: (id: string) => void;
  onCancelRefund: (id: string) => void;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  onReassign,
  onCancelRefund,
}) => {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#064E3B', text: '#34D399' };
      case 'IN_PROGRESS':
      case 'ACCEPTED':
        return { bg: '#1E3A8A', text: '#60A5FA' };
      case 'MATCHING':
      case 'REQUESTED':
        return { bg: '#78350F', text: '#FBBF24' };
      case 'DISPUTED':
        return { bg: '#7F1D1D', text: '#F87171' };
      default:
        return { bg: '#334155', text: '#94A3B8' };
    }
  };

  return (
    <div style={styles.tableCard}>
      <div style={styles.tableHeader}>
        <h3 style={styles.tableTitle}>Ecosystem Service Requests Monitor</h3>
        <p style={styles.tableSub}>Real-time dispatch status and operations intervention controls</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              <th style={styles.th}>Request ID</th>
              <th style={styles.th}>Service Type</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Assigned Partner</th>
              <th style={styles.th}>Pickup Area</th>
              <th style={styles.th}>Fare (PKR)</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Intervention</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const badge = getStatusBadgeStyle(r.status);
              return (
                <tr key={r.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#F8FAFC' }}>
                    {r.requestNumber}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.servicePill}>{r.serviceName}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{r.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{r.customerPhone}</div>
                  </td>
                  <td style={styles.td}>
                    {r.providerName ? (
                      <span style={{ fontWeight: 600, color: '#10B981' }}>{r.providerName}</span>
                    ) : (
                      <span style={{ color: '#F59E0B', fontStyle: 'italic' }}>Pending Offer</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, maxWidth: '180px', color: '#94A3B8' }}>
                    {r.pickupAddress}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 800, color: '#F8FAFC' }}>
                    Rs. {r.amountPkr.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: badge.bg,
                        color: badge.text,
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={styles.actionGroup}>
                      <button
                        title="Reassign to another nearby provider"
                        onClick={() => onReassign(r.id)}
                        style={styles.actionBtn}
                      >
                        <RefreshCw size={14} color="#60A5FA" />
                      </button>
                      <button
                        title="Cancel request and issue full wallet refund"
                        onClick={() => onCancelRefund(r.id)}
                        style={{ ...styles.actionBtn, borderColor: '#7F1D1D' }}
                      >
                        <XCircle size={14} color="#F87171" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tableCard: {
    backgroundColor: '#1E293B',
    borderRadius: '14px',
    border: '1px solid #334155',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  tableHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  tableSub: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '2px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #334155',
  },
  th: {
    padding: '12px 16px',
    color: '#94A3B8',
    fontWeight: 700,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  servicePill: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  actionGroup: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionBtn: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
