import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface KycApplicant {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  serviceCategory: string;
  vehicle: string;
  plate: string;
  licenseNumber: string;
  submittedDate: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export const ProviderKycWorkbench: React.FC = () => {
  const [applicants, setApplicants] = useState<KycApplicant[]>([
    {
      id: 'kyc-01',
      name: 'Naveed Iqbal',
      phone: '+92 313 4455667',
      cnic: '42101-9876543-1',
      serviceCategory: 'RIDE (AC Car)',
      vehicle: 'Suzuki Cultus VXL (2022)',
      plate: 'KHI-6621',
      licenseNumber: 'LHR-DL-98213',
      submittedDate: 'Today, 09:30 AM',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'kyc-02',
      name: 'Ustad Farhan (AC & Electrician)',
      phone: '+92 301 2233445',
      cnic: '42201-1122334-9',
      serviceCategory: 'HOME_SERVICES',
      vehicle: 'Tool Cargo Bike',
      plate: 'KHI-1102',
      licenseNumber: 'KHI-TECH-4412',
      submittedDate: 'Yesterday, 04:15 PM',
      status: 'PENDING',
    },
    {
      id: 'kyc-03',
      name: 'Tariq Mehmood',
      phone: '+92 321 9876543',
      cnic: '42201-1234567-3',
      serviceCategory: 'RIDE (Premium AC)',
      vehicle: 'Toyota Corolla GLI',
      plate: 'KHI-9821',
      licenseNumber: 'KHI-DL-55210',
      submittedDate: '01 Sept, 2026',
      status: 'APPROVED',
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: KycApplicant['status']) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#00875A" />
          <div>
            <h3 style={styles.title}>Provider Verification & KYC Workbench</h3>
            <p style={styles.sub}>
              Inspect Pakistani CNIC, Driving Licenses, and Police clearance before authorizing live dispatch.
            </p>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headRow}>
              <th style={styles.th}>Applicant</th>
              <th style={styles.th}>Pakistani CNIC</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Vehicle & Plate</th>
              <th style={styles.th}>License / Cert</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Verification Action</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{a.phone}</div>
                </td>
                <td style={{ ...styles.td, fontFamily: 'monospace', color: '#38BDF8' }}>
                  {a.cnic}
                </td>
                <td style={styles.td}>
                  <span style={styles.categoryPill}>{a.serviceCategory}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ color: '#F8FAFC' }}>{a.vehicle}</div>
                  <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
                    {a.plate}
                  </div>
                </td>
                <td style={{ ...styles.td, fontSize: '12px', color: '#94A3B8' }}>
                  {a.licenseNumber}
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusTag,
                      backgroundColor:
                        a.status === 'APPROVED'
                          ? '#064E3B'
                          : a.status === 'REJECTED'
                          ? '#7F1D1D'
                          : '#78350F',
                      color:
                        a.status === 'APPROVED'
                          ? '#34D399'
                          : a.status === 'REJECTED'
                          ? '#F87171'
                          : '#FBBF24',
                    }}
                  >
                    {a.status}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <div style={styles.btnGroup}>
                    {a.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'APPROVED')}
                        style={{ ...styles.actionBtn, backgroundColor: '#00875A', color: '#FFFFFF' }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                    {a.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'REJECTED')}
                        style={{ ...styles.actionBtn, backgroundColor: '#7F1D1D', color: '#FCA5A5' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                    {a.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'SUSPENDED')}
                        style={{ ...styles.actionBtn, backgroundColor: '#334155', color: '#FBBF24' }}
                      >
                        <AlertTriangle size={14} /> Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
  },
  title: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#F8FAFC',
  },
  sub: {
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
  headRow: {
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #334155',
  },
  th: {
    padding: '12px 16px',
    color: '#94A3B8',
    fontWeight: 700,
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  categoryPill: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
  },
  statusTag: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 800,
  },
  btnGroup: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
