import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { getTodayDateString, formatMonthYearFromDateString } from '../../utils/dateUtils';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Electricity',
  'Building Rent',
  'Water Tanker',
  'Internet / Wi-Fi',
  'Housekeeping & Cleaning',
  'Plumbing & Repairs',
  'Staff & Caretaker Salary',
  'Waste Disposal',
  'Property Tax / Govt',
  'Miscellaneous',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<number>(1500);
  const [date, setDate] = useState(getTodayDateString());
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onAddExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      paidTo: paidTo.trim() || 'Vendor',
      paymentMode,
      monthYear: formatMonthYearFromDateString(date),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900 leading-tight">Log PG Expense</h3>
              <p className="text-[13px] text-slate-500 font-medium">Record operational cost for balance sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          <div>
            <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
              Expense Title / Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commercial EB Bill August or Water Tanker (2 loads)"
              className="w-full h-[48px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full h-[48px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-[48px] pl-8 pr-3 border border-rose-300 rounded-xl bg-rose-50/30 text-rose-700 font-extrabold text-[16px] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
                Paid To (Vendor / Person)
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. EB Board / Somu Caretaker"
                className="w-full h-[48px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-[48px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 text-[13px] font-bold rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[13px] mb-1.5">
              Receipt / Transaction Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bill #48912, paid from Canara Bank A/c"
              className="w-full h-[48px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-[13px] text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[13px] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
