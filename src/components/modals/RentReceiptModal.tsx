import React from 'react';
import { RentPayment } from '../../types';

interface RentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: RentPayment | null;
}

export const RentReceiptModal: React.FC<RentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Agam PG Rent Receipt - ${payment.tenantName}`,
        text: `Rent Receipt for Room ${payment.roomNumber} (${payment.month}): Amount ₹${payment.amount} Paid successfully.`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Agam PG Rent Receipt\nTenant: ${payment.tenantName}\nRoom: ${payment.roomNumber}\nAmount: ₹${payment.amount}\nMonth: ${payment.month} ${payment.year}\nStatus: PAID\nReceipt No: ${payment.receiptNo || 'RCP-2026-08'}`
      );
      alert('Receipt summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col">
        {/* Top brand header */}
        <div className="bg-[#181818] text-white p-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#E2FF00] text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <div>
              <h3 className="text-[20px] font-black text-white uppercase tracking-tight leading-tight">Agam PG</h3>
              <p className="text-[10px] text-[#888888] font-black uppercase tracking-wider">Official Payment Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Receipt Voucher Body */}
        <div className="p-6 flex flex-col gap-4 text-[13px] bg-[#121212]">
          {/* Status and Receipt Number */}
          <div className="flex justify-between items-center pb-3 border-b border-[#262626]">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Receipt No</span>
              <span className="font-bold text-white font-mono">
                {payment.receiptNo || `RCP-2026-08${payment.roomNumber}`}
              </span>
            </div>
            <div className="text-right">
              <span className="bg-[#E2FF00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_10px_rgba(226,255,0,0.3)]">
                PAID & VERIFIED
              </span>
            </div>
          </div>

          {/* Tenant & Room details */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Tenant Name</span>
              <span className="text-[16px] font-black text-white uppercase">{payment.tenantName}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Room Number</span>
              <span className="text-[16px] font-black text-white">Room {payment.roomNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 border-t border-[#262626]">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Rent Period</span>
              <span className="font-bold text-white uppercase">
                {payment.month} {payment.year || 2026}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Payment Mode</span>
              <span className="font-bold text-[#E2FF00]">{payment.paymentMode || 'UPI / Online'}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-[#181818] border border-[#262626] text-white p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Total Amount Paid</span>
              <span className="text-[28px] font-black text-[#E2FF00] tracking-tight">
                ₹{payment.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="material-symbols-outlined text-[36px] text-[#E2FF00]">check_circle</span>
          </div>

          {/* Timestamp & Notes */}
          <div className="text-[11px] text-[#888888] flex flex-col gap-1 pt-2 font-medium">
            <p>Date: {payment.paidDate || '02 AUG 2026'} • Authorized by Agam PG Management</p>
            <p className="italic">Note: This is a system-generated electronic receipt voucher.</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#181818] border-t border-[#262626] flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 border border-[#333333] text-white rounded-xl font-black uppercase text-[12px] tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#262626] hover:border-[#E2FF00] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share Receipt
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#E2FF00] text-black rounded-xl font-black uppercase text-[12px] tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
