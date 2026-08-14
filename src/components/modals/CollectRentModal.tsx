import React, { useState } from 'react';
import { Tenant, RentPayment } from '../../types';

interface CollectRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
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
  tenants,
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
    initialPayment ? initialPayment.balance || initialPayment.amount : selectedTenant?.rentAmount || 3500
  );
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [month, setMonth] = useState('Aug 2026');
  const [referenceId, setReferenceId] = useState('');
  const [receiptNote, setReceiptNote] = useState('August 2026 Monthly Room Rent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    onConfirmPayment({
      tenantId: selectedTenant.id,
      amountPaid: Number(amount),
      paymentMode,
      month,
      receiptNote: receiptNote + (referenceId ? ` (Ref: ${referenceId})` : ''),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="bg-[#181818] text-white p-4 px-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#E2FF00] text-[24px]">payments</span>
            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Collect Rent</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-[13px]">
          <div>
            <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">Select Tenant</label>
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
              className="w-full h-[46px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
            >
              {activeTenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1a1a1a] text-white">
                  {t.name} (Room {t.roomNumber}) - Due: ₹{t.balance > 0 ? t.balance : t.rentAmount}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#888888] uppercase font-black tracking-wider block">Room & Bed</span>
              <span className="font-bold text-white">
                Room {selectedTenant?.roomNumber} {selectedTenant?.bedNumber ? `• Bed ${selectedTenant.bedNumber}` : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#888888] uppercase font-black tracking-wider block">Standard Rent</span>
              <span className="font-black text-[#E2FF00]">₹{selectedTenant?.rentAmount}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">Amount Receiving (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-[46px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] font-black text-[18px] text-[#E2FF00] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>

            <div>
              <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">Rent Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-[46px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              >
                <option value="Aug 2026" className="bg-[#1a1a1a] text-white">Aug 2026</option>
                <option value="Sep 2026" className="bg-[#1a1a1a] text-white">Sep 2026</option>
                <option value="Jul 2026" className="bg-[#1a1a1a] text-white">Jul 2026</option>
              </select>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2.5 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                      : 'bg-[#181818] text-[#888888] border-[#333333] hover:text-white hover:border-[#555555]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {paymentMode !== 'Cash' && (
            <div>
              <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">
                Transaction / UTR Reference ID
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. UPI/628109923841"
                className="w-full h-[46px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-medium focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          )}

          <div>
            <label className="block font-black text-[#888888] uppercase text-[11px] tracking-wider mb-1.5">Notes / Receipt remarks</label>
            <input
              type="text"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              className="w-full h-[46px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-medium focus:outline-none focus:border-[#E2FF00]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 mt-1 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#333333] rounded-xl font-black uppercase text-[12px] tracking-wider text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#E2FF00] text-black rounded-xl font-black uppercase text-[12px] tracking-wider hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Confirm & Mark Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
