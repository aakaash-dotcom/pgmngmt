import React from 'react';
import { Tenant } from '../../types';

interface ActionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertType: 'overdue' | 'stayEnding' | 'refundPending';
  tenants?: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onCollectRent: (tenant: Tenant) => void;
}

export const ActionRequiredModal: React.FC<ActionRequiredModalProps> = ({
  isOpen,
  onClose,
  alertType,
  tenants = [],
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
    badgeColor = 'bg-rose-100 text-rose-800';
    iconName = 'warning';
  } else if (alertType === 'stayEnding') {
    title = 'Stay Ending / Vacating Notice';
    filteredTenants = tenants.filter((t) => t.isActive && (t.checkOutDate || t.notes?.toLowerCase().includes('vacating')));
    badgeColor = 'bg-amber-100 text-amber-900';
    iconName = 'logout';
  } else {
    title = 'Security Deposit Refund Pending';
    filteredTenants = tenants.filter((t) => !t.isActive && t.notes?.toLowerCase().includes('refund'));
    badgeColor = 'bg-blue-100 text-blue-800';
    iconName = 'currency_exchange';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">{iconName}</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900 leading-tight">{title}</h3>
              <p className="text-[12px] text-slate-500 font-medium">
                {filteredTenants.length} resident{filteredTenants.length === 1 ? '' : 's'} requiring manager attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body list */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3 text-[13px]">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[16px] font-bold text-slate-900">{tenant.name}</h4>
                  <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">bed</span>
                    <span>Room {tenant.roomNumber}</span>
                    <span>•</span>
                    <span>{tenant.phone}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-extrabold text-rose-600">
                    ₹{tenant.rentAmount.toLocaleString('en-IN')}
                  </span>
                  <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                    {tenant.status}
                  </span>
                </div>
              </div>

              {tenant.notes && (
                <p className="text-[12px] text-slate-600 bg-white border border-slate-200 p-2.5 rounded-lg italic font-medium">
                  "{tenant.notes}"
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    onClose();
                    onSelectTenant(tenant);
                  }}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 text-[12px] font-bold rounded-xl transition-colors border border-slate-200"
                >
                  View Resident
                </button>

                {tenant.isActive && (
                  <button
                    onClick={() => {
                      onClose();
                      onCollectRent(tenant);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    Collect Rent
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTenants.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-[40px] text-emerald-600 mb-1">
                check_circle
              </span>
              <p className="font-bold text-slate-800 text-[15px]">All clear!</p>
              <p className="text-[12px] mt-1 text-slate-500">No records pending in this queue.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
