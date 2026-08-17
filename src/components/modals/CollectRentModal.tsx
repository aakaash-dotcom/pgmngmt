import React, { useState } from 'react';
import { Tenant, RentPayment } from '../../types';

interface CollectRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants?: Tenant[];
  initialTenantId?: string;
  initialPayment?: RentPayment | null;
  onConfirmPayment: (details: {
    tenantId: string;
    amountPaid: number;
    paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
    month: string;
    receiptNote?: string;
  }) => void;
}

export const CollectRentModal: React.FC<CollectRentModalProps> = ({
  isOpen,
  onClose,
  tenants = [],
  initialTenantId,
  initialPayment,
  onConfirmPayment,
}) => {
  const activeTenants = tenants.filter((t) => t.isActive);
  const defaultTenant =
    tenants.find((t) => t.id === initialTenantId) ||
    (initialPayment ? tenants.find((t) => t.name === initialPayment.tenantName) : null) ||
    activeTenants[0];

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    defaultTenant?.id || activeTenants[0]?.id || ''
  );
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || defaultTenant;

  const [amount, setAmount] = useState<number>(
    initialPayment ? initialPayment.balance || initialPayment.amount : selectedTenant?.rentAmount || 4500
  );
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [month, setMonth] = useState('Aug 2026');
  const [referenceId, setReferenceId] = useState('');
  const [note, setNote] = useState('August 2026 Monthly Room Rent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    onConfirmPayment({
      tenantId: selectedTenant.id,
      amountPaid: Number(amount),
      paymentMode,
      month,
      receiptNote: note + (referenceId ? ` (Ref: ${referenceId})` : ''),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a332c] text-white p-4 px-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold leading-tight">Collect Monthly Rent</h3>
              <p className="text-[11px] text-emerald-100/80 font-medium">Record payment & clear tenant dues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Select Resident
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTenantId(id);
                const t = tenants.find((item) => item.id === id);
                if (t) {
                  setAmount(t.balance > 0 ? t.balance : t.rentAmount);
                }
              }}
              className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {activeTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Room {t.roomNumber} - {t.bedNumber || 'B1'}) — Due: ₹{(t.balance > 0 ? t.balance : t.rentAmount).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Room & Bed
              </span>
              <span className="font-extrabold text-slate-900">
                Room {selectedTenant?.roomNumber} • <span className="text-[#0a332c]">{selectedTenant?.bedNumber || 'B1'}</span>
              </span>
              {selectedTenant?.isBulkContract && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded block mt-0.5">
                  {selectedTenant.companyName || selectedTenant.groupName}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Monthly Rent
              </span>
              <span className="font-black text-[18px] text-[#0a332c]">
                ₹{selectedTenant?.rentAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-[40px] pl-8 pr-3 border border-emerald-300 rounded-xl bg-emerald-50/40 font-black text-[16px] text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Rent Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none"
              >
                <option value="Aug 2026">Aug 2026</option>
                <option value="Sep 2026">Sep 2026</option>
                <option value="Jul 2026">Jul 2026</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['UPI', 'Cash', 'Bank Transfer', 'Cheque'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    paymentMode === mode
                      ? 'bg-white text-[#0a332c] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              UPI Ref / Transaction # (Optional)
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. UPI 89129012 or Cash Handover"
              className="w-full h-[38px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs text-[13px] flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Confirm & Issue Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
