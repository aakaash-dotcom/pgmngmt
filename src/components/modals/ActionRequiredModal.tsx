import React from 'react';
import { Tenant } from '../../types';

interface ActionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertType: 'overdue' | 'stayEnding' | 'refundPending';
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onCollectRent: (tenant: Tenant) => void;
}

export const ActionRequiredModal: React.FC<ActionRequiredModalProps> = ({
  isOpen,
  onClose,
  alertType,
  tenants,
  onSelectTenant,
  onCollectRent,
}) => {
  if (!isOpen) return null;

  let title = '';
  let filteredTenants: Tenant[] = [];
  let badgeColor = '';
  let iconName = '';

  if (alertType === 'overdue') {
    title = 'Rent Overdue Actions';
    filteredTenants = tenants.filter((t) => t.isActive && t.status === 'Overdue');
    badgeColor = 'bg-[#ff3b30] text-white';
    iconName = 'warning';
  } else if (alertType === 'stayEnding') {
    title = 'Stay Ending / Vacating Notice';
    filteredTenants = tenants.filter((t) => t.isActive && (t.checkOutDate || t.notes?.toLowerCase().includes('vacating')));
    badgeColor = 'bg-[#E2FF00] text-black';
    iconName = 'logout';
  } else {
    title = 'Security Deposit Refund Pending';
    filteredTenants = tenants.filter((t) => !t.isActive && t.notes?.toLowerCase().includes('refund'));
    badgeColor = 'bg-[#333333] text-white';
    iconName = 'currency_exchange';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-lg rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#181818] text-white p-4 px-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#E2FF00] text-[24px]">{iconName}</span>
            <div>
              <h3 className="text-[18px] font-black text-white uppercase tracking-tight leading-tight">{title}</h3>
              <p className="text-[11px] text-[#888888] font-bold">
                {filteredTenants.length} tenant{filteredTenants.length === 1 ? '' : 's'} requiring immediate attention
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

        {/* Body list */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3 text-[13px]">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col gap-2.5 hover:border-[#E2FF00] transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[17px] font-black text-white uppercase tracking-tight">{tenant.name}</h4>
                  <p className="text-[12px] text-[#888888] font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#E2FF00]">bed</span>
                    <span>Room {tenant.roomNumber}</span>
                    <span>•</span>
                    <span>{tenant.phone}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-black text-[#ff3b30]">
                    ₹{tenant.rentAmount.toLocaleString('en-IN')}
                  </span>
                  <span className={`block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                    {tenant.status}
                  </span>
                </div>
              </div>

              {tenant.notes && (
                <p className="text-[12px] text-[#cccccc] bg-[#141414] border border-[#262626] p-2.5 rounded-lg italic font-medium">
                  "{tenant.notes}"
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
                <button
                  onClick={() => {
                    onClose();
                    onSelectTenant(tenant);
                  }}
                  className="flex-1 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-colors border border-[#333333]"
                >
                  View Profile
                </button>

                {tenant.isActive && (
                  <button
                    onClick={() => {
                      onClose();
                      onCollectRent(tenant);
                    }}
                    className="flex-1 py-2.5 bg-[#E2FF00] hover:bg-[#d4f000] text-black text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(226,255,0,0.3)]"
                  >
                    <span className="material-symbols-outlined text-[15px]">payments</span>
                    Collect Rent
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTenants.length === 0 && (
            <div className="text-center py-8 text-[#888888]">
              <span className="material-symbols-outlined text-[40px] text-[#E2FF00] mb-1">
                check_circle
              </span>
              <p className="font-black text-white uppercase text-[15px]">All clear!</p>
              <p className="text-[12px] mt-1 text-[#888888]">No records in this alert queue.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181818] border-t border-[#262626]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#E2FF00] text-black font-black uppercase text-[12px] tracking-wider rounded-xl hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

