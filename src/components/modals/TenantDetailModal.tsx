import React, { useState } from 'react';
import { Tenant } from '../../types';

interface TenantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onCollectRent: (tenant: Tenant) => void;
  onToggleActiveStatus: (tenantId: string) => void;
  onUpdateTenantNotes: (tenantId: string, notes: string) => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onCollectRent,
  onToggleActiveStatus,
  onUpdateTenantNotes,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(tenant?.notes || '');

  if (!isOpen || !tenant) return null;

  const handleSaveNotes = () => {
    onUpdateTenantNotes(tenant.id, notesText);
    setIsEditingNotes(false);
  };

  const getStatusColor = (status: Tenant['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-[#c6eadd] text-[#002019]';
      case 'Overdue':
        return 'bg-[#ffdad6] text-[#ba1a1a]';
      case 'Partial':
      case 'Unpaid':
        return 'bg-[#ffdb8f] text-[#795f1f]';
      default:
        return 'bg-[#e5e2e1] text-[#414845]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-lg rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#181818] text-white p-5 flex justify-between items-start border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#262626] text-[#E2FF00] flex items-center justify-center font-black text-[22px] border border-[#333333]">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-black text-white uppercase tracking-tight">{tenant.name}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  tenant.status === 'Paid'
                    ? 'bg-[#E2FF00] text-black'
                    : tenant.status === 'Overdue'
                    ? 'bg-[#ff3b30] text-white'
                    : 'bg-[#333333] text-white'
                }`}>
                  {tenant.isActive ? tenant.status : 'Left'}
                </span>
              </div>
              <p className="text-[12px] text-[#888888] font-bold mt-0.5">
                Room {tenant.roomNumber} {tenant.bedNumber ? `• Bed ${tenant.bedNumber}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Quick Contact buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${tenant.phone}`}
              className="flex items-center justify-center gap-2 py-3 bg-[#1e1e1e] border border-[#333333] text-white font-black text-[12px] uppercase rounded-xl hover:bg-[#262626] hover:border-[#E2FF00] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#E2FF00]">call</span>
              <span>Call ({tenant.phone})</span>
            </a>
            <a
              href={`https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-black font-black text-[12px] uppercase rounded-xl hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Financial summary card */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Monthly Rent</span>
              <span className="text-[24px] font-black text-[#E2FF00] tracking-tight">
                ₹{tenant.rentAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Security Deposit</span>
              <span className="text-[18px] font-black text-white">
                ₹{tenant.securityDeposit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex justify-between py-1 border-b border-[#262626]">
              <span className="text-[#888888] font-bold">Check-In Date</span>
              <span className="font-bold text-white">{tenant.checkInDate}</span>
            </div>
            {tenant.checkOutDate && (
              <div className="flex justify-between py-1 border-b border-[#262626]">
                <span className="text-[#888888] font-bold">Check-Out Date</span>
                <span className="font-bold text-[#ff3b30]">{tenant.checkOutDate}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-[#262626]">
              <span className="text-[#888888] font-bold">Next Rent Due</span>
              <span className="font-bold text-white">{tenant.dueDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#262626]">
              <span className="text-[#888888] font-bold">Emergency Contact</span>
              <span className="font-bold text-white">
                {tenant.emergencyContact} ({tenant.emergencyPhone})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#888888] font-bold">ID Proof</span>
              <span className="font-bold text-white">
                {tenant.idProofType}: {tenant.idProofNumber}
              </span>
            </div>
          </div>

          {/* Remarks & Notes */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Admin Remarks & Notes</span>
              {!isEditingNotes ? (
                <button
                  onClick={() => {
                    setNotesText(tenant.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-[11px] text-[#E2FF00] font-black uppercase hover:underline"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-[11px] text-[#E2FF00] font-black uppercase hover:underline"
                >
                  Save
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-[#333333] rounded-lg text-[13px] bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              />
            ) : (
              <p className="text-[13px] text-[#cccccc] italic font-medium">
                {tenant.notes || 'No specific remarks recorded.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#181818] border-t border-[#262626] flex gap-3">
          {tenant.isActive && (
            <button
              onClick={() => {
                onClose();
                onCollectRent(tenant);
              }}
              className="flex-1 py-3 bg-[#E2FF00] text-black rounded-xl font-black uppercase text-[12px] tracking-wider hover:bg-[#d4f000] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Collect Rent
            </button>
          )}

          <button
            onClick={() => {
              if (
                window.confirm(
                  tenant.isActive
                    ? `Mark ${tenant.name} as Vacated/Left PG? Room bed will be freed.`
                    : `Restore ${tenant.name} back to Active tenant list?`
                )
              ) {
                onToggleActiveStatus(tenant.id);
                onClose();
              }
            }}
            className={`px-4 py-3 border rounded-xl font-black uppercase text-[12px] tracking-wider transition-colors ${
              tenant.isActive
                ? 'border-[#ff3b30] text-[#ff3b30] hover:bg-[#ff3b30]/10'
                : 'border-[#E2FF00] text-[#E2FF00] hover:bg-[#E2FF00]/10'
            }`}
          >
            {tenant.isActive ? 'Vacate / Check-out' : 'Reactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};
