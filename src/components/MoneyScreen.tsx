import React, { useState } from 'react';
import { RentPayment, Expense } from '../types';
import { MONTHLY_TREND_DATA } from '../data/initialData';

interface MoneyScreenProps {
  rentPayments: RentPayment[];
  expenses: Expense[];
  onMarkPaid: (payment: RentPayment) => void;
  onViewReceipt: (payment: RentPayment) => void;
  onAddExpense: () => void;
  onDeleteExpense?: (id: string) => void;
}

export const MoneyScreen: React.FC<MoneyScreenProps> = ({
  rentPayments,
  expenses,
  onMarkPaid,
  onViewReceipt,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [subTab, setSubTab] = useState<'rent' | 'expenses'>('rent');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5); // 0=Mar .. 5=Aug 2026

  const months = ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
  const currentMonthName = months[selectedMonthIndex];

  const handlePrevMonth = () => {
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : prev));
  };

  // Stats calculation
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const pendingPaymentsCount = rentPayments.filter(
    (p) => p.status === 'Unpaid' || p.status === 'Overdue' || p.status === 'Partial'
  ).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-20 flex flex-col gap-5">
      {/* Sub-tabs: Rent vs Expenses */}
      <div className="flex bg-[#141414] rounded-xl p-1 shadow-md border border-[#262626]">
        <button
          id="tab-sub-rent"
          onClick={() => setSubTab('rent')}
          className={`flex-1 py-2 text-center text-[13px] font-black uppercase tracking-wider rounded-lg transition-all ${
            subTab === 'rent'
              ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Rent Collections
        </button>
        <button
          id="tab-sub-expenses"
          onClick={() => setSubTab('expenses')}
          className={`flex-1 py-2 text-center text-[13px] font-black uppercase tracking-wider rounded-lg transition-all ${
            subTab === 'expenses'
              ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Expenses
        </button>
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-between bg-[#121212] px-4 py-2.5 rounded-2xl border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <button
          id="btn-month-prev"
          onClick={handlePrevMonth}
          disabled={selectedMonthIndex === 0}
          className="h-[40px] w-[40px] flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] disabled:opacity-20 rounded-xl transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>

        <h2 className="text-[20px] font-black text-white uppercase tracking-tight">
          {currentMonthName}
        </h2>

        <button
          id="btn-month-next"
          onClick={handleNextMonth}
          disabled={selectedMonthIndex === months.length - 1}
          className="h-[40px] w-[40px] flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] disabled:opacity-20 rounded-xl transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>
      </div>

      {subTab === 'rent' ? (
        <>
          {/* Summary Section: Collection Trend (6 Mo) */}
          <section className="bg-[#121212] rounded-2xl border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest">
                Collection Trend (6 Mo)
              </h3>
              <span className="text-[11px] text-black font-black uppercase tracking-wider bg-[#E2FF00] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(226,255,0,0.3)]">
                84.5% Efficiency
              </span>
            </div>

            {/* Custom Bar chart */}
            <div className="flex items-end gap-2.5 h-20 w-full mt-3 px-1">
              {MONTHLY_TREND_DATA.map((item, idx) => {
                const isSelected = idx === selectedMonthIndex;
                return (
                  <div
                    key={item.month}
                    onClick={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div
                      className={`w-full rounded-t-md flex items-end justify-center pb-1 transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#E2FF00] ring-2 ring-[#E2FF00]/40 shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                          : 'bg-[#222222] group-hover:bg-[#333333]'
                      }`}
                      style={{ height: `${item.value}%` }}
                    >
                      <span
                        className={`text-[11px] font-black uppercase ${
                          isSelected ? 'text-black' : 'text-[#888888]'
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Target vs Collected breakdown */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#262626]">
              <div>
                <span className="block text-[11px] font-black text-[#888888] uppercase tracking-wider">Target</span>
                <span className="text-[20px] font-black text-white">₹1,45,000</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] font-black text-[#888888] uppercase tracking-wider">Collected</span>
                <span className="text-[20px] font-black text-[#E2FF00]">₹1,22,500</span>
              </div>
            </div>
          </section>

          {/* Pending Actions / Rent View List */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest">
                Pending Actions & Collections
              </h3>
              <span className="bg-[#ff3b30] text-white text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                {pendingPaymentsCount} Due
              </span>
            </div>

            {/* Rent Rows */}
            {rentPayments.map((payment) => {
              const isPaid = payment.status === 'Paid';
              const isUnpaid = payment.status === 'Unpaid';
              const isPartial = payment.status === 'Partial';
              const isOverdue = payment.status === 'Overdue';

              let borderClass = 'border-l-[4px] border-l-[#E2FF00]';
              let badgeBg = 'bg-[#E2FF00] text-black font-black';
              let dueTextColor = 'text-[#E2FF00]';

              if (isOverdue || isUnpaid) {
                borderClass = 'border-l-[4px] border-l-[#ff3b30]';
                badgeBg = 'bg-[#ff3b30] text-white font-black';
                dueTextColor = 'text-[#ff3b30]';
              } else if (isPartial) {
                borderClass = 'border-l-[4px] border-l-[#ffaa00]';
                badgeBg = 'bg-[#ffaa00] text-black font-black';
                dueTextColor = 'text-[#ffaa00]';
              }

              return (
                <div
                  key={payment.id}
                  id={`rent-card-${payment.id}`}
                  className={`bg-[#121212] rounded-2xl border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${borderClass} p-4 flex flex-col gap-3 transition-all hover:border-[#333333]`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[19px] font-black text-white uppercase tracking-tight leading-snug">
                        {payment.tenantName}
                      </h4>
                      <p className="text-[13px] text-[#888888] font-bold mt-0.5">
                        Room {payment.roomNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] font-black uppercase tracking-wider block ${dueTextColor}`}>
                        {isPaid
                          ? `PAID ON ${payment.paidDate || '02 AUG'}`
                          : `DUE ${payment.dueDate}`}
                      </span>
                      <span className="text-[19px] text-white font-black mt-0.5 block">
                        ₹{payment.amount.toLocaleString('en-IN')}{' '}
                        {isPartial && payment.balance > 0 && (
                          <span className="text-[12px] text-[#888888] font-bold">
                            (Bal: ₹{payment.balance.toLocaleString('en-IN')})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#262626]">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeBg}`}
                    >
                      {payment.status}
                    </span>

                    {!isPaid ? (
                      <button
                        onClick={() => onMarkPaid(payment)}
                        className="bg-[#E2FF00] text-black text-[12px] font-black uppercase tracking-wider h-[40px] px-4 rounded-xl shadow-[0_0_12px_rgba(226,255,0,0.3)] hover:bg-[#d4f000] active:scale-95 transition-all"
                      >
                        MARK PAID
                      </button>
                    ) : (
                      <button
                        onClick={() => onViewReceipt(payment)}
                        className="bg-[#1a1a1a] border border-[#E2FF00] text-[#E2FF00] hover:bg-[#E2FF00] hover:text-black text-[12px] font-black uppercase tracking-wider h-[40px] px-4 rounded-xl active:scale-95 transition-all"
                      >
                        RECEIPT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        /* Expenses Tab */
        <section className="flex flex-col gap-4">
          {/* Expenses Overview Card */}
          <div className="bg-[#121212] rounded-2xl border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-4 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-black text-[#888888] uppercase tracking-widest block">
                Total Expenses ({currentMonthName})
              </span>
              <div className="text-[28px] font-black text-[#ff3b30] mt-0.5">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              onClick={onAddExpense}
              className="bg-[#E2FF00] text-black px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#d4f000] active:scale-95 shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Expense
            </button>
          </div>

          {/* Category Breakdown list */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest px-1">
              Expense Records ({expenses.length})
            </h3>

            {expenses.map((expense) => {
              const getCategoryIcon = (cat: Expense['category']) => {
                switch (cat) {
                  case 'Electricity':
                    return 'bolt';
                  case 'Salary':
                    return 'badge';
                  case 'Internet':
                    return 'wifi';
                  case 'Water':
                    return 'water_drop';
                  case 'Repair':
                    return 'handyman';
                  case 'Groceries':
                    return 'shopping_cart';
                  default:
                    return 'receipt';
                }
              };

              return (
                <div
                  key={expense.id}
                  className="bg-[#121212] border border-[#262626] rounded-2xl p-3.5 shadow-md flex items-center justify-between hover:border-[#E2FF00] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1f1f1f] text-[#E2FF00] border border-[#333333] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        {getCategoryIcon(expense.category)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#E2FF00] transition-colors">
                        {expense.title}
                      </h4>
                      <p className="text-[12px] text-[#888888] font-bold flex items-center gap-1.5 mt-0.5">
                        <span>{expense.paidTo}</span>
                        <span>•</span>
                        <span>{expense.date}</span>
                        <span>•</span>
                        <span className="font-black text-[#E2FF00] uppercase">{expense.paymentMode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-black text-[#ff3b30]">
                      -₹{expense.amount.toLocaleString('en-IN')}
                    </span>
                    {onDeleteExpense && (
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-[#666666] hover:text-[#ff3b30] p-1 transition-colors"
                        title="Delete expense"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

