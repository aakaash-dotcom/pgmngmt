import React, { useState, useEffect, useMemo } from 'react';
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
  // Only active tenants
  const activeTenants = useMemo(() => tenants.filter((t) => t.isActive), [tenants]);

  // Unpaid/Pending Dues tenants (filter out already paid ones for collection dropdown)
  const pendingTenants = useMemo(() => {
    return activeTenants.filter(
      (t) => t.status !== 'Paid' && (t.balance > 0 || t.status === 'Overdue' || t.status === 'Unpaid' || t.status === 'Partial')
    );
  }, [activeTenants]);

  // Determine the target tenant based on direct click or fallback
  const determineTargetTenant = () => {
    if (initialTenantId) {
      const found = tenants.find((t) => t.id === initialTenantId);
      if (found) return found;
    }
    if (initialPayment) {
      const found = tenants.find(
        (t) => t.id === initialPayment.tenantId || t.name.toLowerCase() === initialPayment.tenantName.toLowerCase()
      );
      if (found) return found;
    }
    // If opening generically, pick first pending due resident; if none pending, fallback to first active tenant
    return pendingTenants.length > 0 ? pendingTenants[0] : activeTenants[0];
  };

  const initialTarget = determineTargetTenant();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(initialTarget?.id || '');
  const [amount, setAmount] = useState<number>(4500);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [month, setMonth] = useState('Aug 2026');
  const [referenceId, setReferenceId] = useState('');
  const [note, setNote] = useState('August 2026 Monthly Room Rent');
  const [showPaidTenants, setShowPaidTenants] = useState(false);

  // Auto-select when modal opens or initialTenantId/initialPayment changes
  useEffect(() => {
    if (isOpen) {
      const target = determineTargetTenant();
      if (target) {
        setSelectedTenantId(target.id);
        const dueAmt =
          initialPayment?.balance !== undefined && initialPayment.balance > 0
            ? initialPayment.balance
            : target.balance > 0
            ? target.balance
            : target.rentAmount;
        setAmount(dueAmt);
        setNote(`${month} Monthly Room Rent - Room ${target.roomNumber}`);
      }
      setShowPaidTenants(false);
    }
  }, [isOpen, initialTenantId, initialPayment]);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || initialTarget;

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

  // Only display pending dues residents by default so user doesn't have to scroll through paid ones.
  // If the currently selected tenant was explicitly clicked (even if paid), keep them in the selectable list.
  const displayTenants = showPaidTenants || pendingTenants.length === 0
    ? activeTenants
    : activeTenants.filter((t) => {
        const isPending = t.status !== 'Paid' && (t.balance > 0 || t.status === 'Overdue' || t.status === 'Unpaid' || t.status === 'Partial');
        return isPending || t.id === selectedTenantId;
      });

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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-bold text-slate-700 text-[11px]">
                Select Resident
              </label>
              {pendingTenants.length > 0 && (
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  {pendingTenants.length} Pending Due{pendingTenants.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <select
              value={selectedTenantId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTenantId(id);
                const t = tenants.find((item) => item.id === id);
                if (t) {
                  setAmount(t.balance > 0 ? t.balance : t.rentAmount);
                  setNote(`${month} Monthly Room Rent - Room ${t.roomNumber}`);
                }
              }}
              className="w-full h-[44px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {displayTenants.map((t) => {
                const hasDue = t.status !== 'Paid' && (t.balance > 0 || t.status === 'Overdue' || t.status === 'Unpaid' || t.status === 'Partial');
                const dueAmount = t.balance > 0 ? t.balance : t.rentAmount;
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} (Room {t.roomNumber} - {t.bedNumber || 'B1'}) — ₹{dueAmount.toLocaleString('en-IN')}{hasDue ? ' [PENDING DUE]' : ' [PAID]'}
                  </option>
                );
              })}
            </select>

            {/* Toggle show all residents if needed */}
            {activeTenants.length > pendingTenants.length && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowPaidTenants(!showPaidTenants)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline"
                >
                  {showPaidTenants ? 'Show only residents with pending dues' : 'Include already paid residents in list'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Room & Bed
              </span>
              <span className="font-extrabold text-slate-900 text-[14px]">
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
                Pending Due / Rent
              </span>
              <span className="font-black text-[18px] text-[#0a332c]">
                ₹{((selectedTenant?.balance && selectedTenant.balance > 0) ? selectedTenant.balance : (selectedTenant?.rentAmount || 0)).toLocaleString('en-IN')}
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
            <div className="grid grid-cols-4 gap-1.5">
              {(['UPI', 'Cash', 'Bank Transfer', 'Cheque'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`h-[36px] rounded-xl font-bold text-[11px] transition-all flex items-center justify-center ${
                    paymentMode === mode
                      ? 'bg-[#0a332c] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              UPI Reference ID / Transaction Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GPay UPI #89129012"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Receipt Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-[13px]"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Confirm & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
