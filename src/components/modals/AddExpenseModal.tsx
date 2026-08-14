import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<number>(1000);
  const [paidTo, setPaidTo] = useState('');
  const [date, setDate] = useState('2026-08-14');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert('Please provide a valid title and amount.');
      return;
    }

    onAddExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      paidTo: paidTo.trim() || 'Vendor',
      paymentMode,
      monthYear: 'Aug 2026',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="bg-[#181818] text-white p-4 px-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E2FF00] text-[24px]">receipt_long</span>
            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Record PG Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-[13px]">
          <div>
            <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Expense Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bescom Electricity Bill"
              className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full h-[44px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold text-[12px] uppercase focus:outline-none focus:border-[#E2FF00]"
              >
                <option value="Electricity" className="bg-[#1a1a1a] text-white">⚡ Electricity</option>
                <option value="Salary" className="bg-[#1a1a1a] text-white">👨‍🍳 Staff Salary</option>
                <option value="Internet" className="bg-[#1a1a1a] text-white">🌐 Internet / Wi-Fi</option>
                <option value="Water" className="bg-[#1a1a1a] text-white">💧 Water Tanker</option>
                <option value="Repair" className="bg-[#1a1a1a] text-white">🔧 Repair & Maint</option>
                <option value="Groceries" className="bg-[#1a1a1a] text-white">🛒 Groceries</option>
                <option value="Other" className="bg-[#1a1a1a] text-white">📄 Other Expense</option>
              </select>
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-[#ff3b30] font-black text-[18px] focus:outline-none focus:border-[#ff3b30]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Paid To Vendor</label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Vendor / Staff name"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Date Paid</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMode(m)}
                  className={`py-2 text-[11px] font-black uppercase rounded-xl border text-center transition-all ${
                    paymentMode === m
                      ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                      : 'bg-[#181818] text-[#888888] border-[#333333] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Notes / Bill reference</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice # or voucher note"
              className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#333333] rounded-xl font-black uppercase text-[12px] tracking-wider text-[#888888] hover:text-white hover:bg-[#222222] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#E2FF00] text-black rounded-xl font-black uppercase text-[12px] tracking-wider hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
            >
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
