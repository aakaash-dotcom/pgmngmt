import React, { useState, useMemo } from 'react';
import { RentPayment, Expense, Income } from '../types';
import { MONTHLY_TREND_DATA, PG_NAME, OWNER_PHONE_INTL, OWNER_UPI_ID } from '../data/initialData';
import { AgamLogo } from './AgamLogo';

interface MoneyScreenProps {
  rentPayments?: RentPayment[];
  expenses?: Expense[];
  incomes?: Income[];
  onMarkPaid: (payment: RentPayment) => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
}

export const MoneyScreen: React.FC<MoneyScreenProps> = ({
  rentPayments = [],
  expenses = [],
  incomes = [],
  onMarkPaid,
  onAddExpense,
  onAddIncome,
  onDeleteExpense,
  onDeleteIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'balance-sheet' | 'income' | 'expenses'>('balance-sheet');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5); // 0=Mar .. 5=Aug 2026
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState<'all' | 'rent' | 'bulk' | 'deposit' | 'other'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');

  const months = ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
  const currentMonthName = months[selectedMonthIndex];
  const monthShort = currentMonthName.split(' ')[0];

  const handlePrevMonth = () => {
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : prev));
  };

  // Dynamic Month Filtering for Rent Payments, Incomes, and Expenses
  const currentMonthRentPayments = useMemo(() => {
    return rentPayments.filter((p) => {
      if (p.month === currentMonthName) return true;
      if (p.month?.toLowerCase().includes(monthShort.toLowerCase())) return true;
      if (p.paidDate && p.paidDate.includes(monthShort)) return true;
      if (p.dueDate && p.dueDate.includes(monthShort)) return true;
      return false;
    });
  }, [rentPayments, currentMonthName, monthShort]);

  const currentMonthIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      if (inc.monthYear === currentMonthName) return true;
      if (inc.monthYear?.toLowerCase().includes(monthShort.toLowerCase())) return true;
      if (inc.date && inc.date.includes(monthShort)) return true;
      return false;
    });
  }, [incomes, currentMonthName, monthShort]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (exp.monthYear === currentMonthName) return true;
      if (exp.monthYear?.toLowerCase().includes(monthShort.toLowerCase())) return true;
      if (exp.date && exp.date.includes(monthShort)) return true;
      return false;
    });
  }, [expenses, currentMonthName, monthShort]);

  // Dynamic Financial Aggregations based on selected month
  const totalRentCollected = currentMonthRentPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const otherIncomesTotal = currentMonthIncomes
    .filter((i) => i.category !== 'Monthly Rent')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalGrossIncome = totalRentCollected + otherIncomesTotal;
  const totalOperatingExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netOperatingProfit = totalGrossIncome - totalOperatingExpenses;
  const profitMargin = totalGrossIncome > 0 ? Math.round((netOperatingProfit / totalGrossIncome) * 100) : 0;

  // Receivables / Outstanding dues for the selected month
  const totalPendingRent = currentMonthRentPayments
    .filter((p) => p.status !== 'Paid')
    .reduce((sum, p) => sum + (p.balance > 0 ? p.balance : p.amount), 0);

  // Group expenses by category for selected month
  const expensesByCategory: Record<string, number> = {};
  currentMonthExpenses.forEach((exp) => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });

  // Group incomes by category for selected month
  const incomesByCategory: Record<string, number> = {
    'Monthly Individual Rent': totalRentCollected,
  };
  currentMonthIncomes.forEach((inc) => {
    if (inc.category !== 'Monthly Rent') {
      incomesByCategory[inc.category] = (incomesByCategory[inc.category] || 0) + inc.amount;
    }
  });

  const handlePrintBalanceSheet = () => {
    window.print();
  };

  // Max revenue for trend chart scaling
  const maxRevenue = Math.max(...MONTHLY_TREND_DATA.map((d) => d.revenue), 120000);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-1.5 pb-24 flex flex-col gap-3">
      {/* Top Action Bar with Month Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-1 rounded-xl">
          <button
            onClick={handlePrevMonth}
            disabled={selectedMonthIndex === 0}
            className="h-[28px] w-[28px] flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
            title="Previous Month"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="font-black text-[12px] text-slate-900 px-2">
            {currentMonthName}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={selectedMonthIndex === months.length - 1}
            className="h-[28px] w-[28px] flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
            title="Next Month"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddIncome}
            className="h-[36px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">add</span>
            <span>Income</span>
          </button>

          <button
            onClick={onAddExpense}
            className="h-[36px] px-3 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-extrabold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-700">add</span>
            <span>Expense</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (One Word) */}
      <div className="flex bg-white rounded-2xl p-1 shadow-xs border border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab('balance-sheet')}
          className={`flex-1 py-2 text-center text-[12px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'balance-sheet'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 text-center text-[12px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'income'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Income</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 text-center text-[12px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'expenses'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Expenses</span>
        </button>
      </div>

      {/* TAB 1: AUTOMATED BALANCE SHEET & P&L REPORT */}
      {activeTab === 'balance-sheet' && (
        <div className="flex flex-col gap-4">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </span>
              </div>
              <div className="text-[26px] font-black text-emerald-700 mt-1 tracking-tight">
                ₹{totalGrossIncome.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Rent Collections + Advance Deposits
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-rose-200 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Operating Expenses
                </span>
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">trending_down</span>
                </span>
              </div>
              <div className="text-[26px] font-black text-rose-600 mt-1 tracking-tight">
                ₹{totalOperatingExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Electricity, Water, Wi-Fi, Salary
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Net Operating Profit
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#0a332c]/10 text-[#0a332c] border border-[#0a332c]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">savings</span>
                </span>
              </div>
              <div
                className={`text-[26px] font-black mt-1 tracking-tight ${
                  netOperatingProfit >= 0 ? 'text-[#0a332c]' : 'text-rose-600'
                }`}
              >
                ₹{netOperatingProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-800 font-bold">
                Profit Margin: {profitMargin}%
              </span>
            </div>
          </div>

          {/* Printable Formal Balance Sheet Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-5 print:shadow-none print:border-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <AgamLogo size="sm" variant="icon" />
                  <h2 className="text-[18px] font-black text-[#0a332c] leading-tight">
                    {PG_NAME} • Monthly Financial Statement
                  </h2>
                </div>
                <p className="text-[12px] text-slate-500 font-medium mt-1">
                  Accounting Period: <strong>{currentMonthName}</strong> • Managed by Owner ({OWNER_PHONE_INTL}) • UPI: {OWNER_UPI_ID}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintBalanceSheet}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print P&L Statement</span>
                </button>
              </div>
            </div>

            {/* Income & Expense Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Income Ledger Column */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                    <span className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      1. Inflows & Revenues
                    </span>
                    <span className="text-[12px] font-bold text-slate-500">Amount (₹)</span>
                  </div>

                  <div className="flex flex-col gap-2 py-3 text-[13px]">
                    {Object.entries(incomesByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">{category}</span>
                        <span className="font-extrabold text-slate-900">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 flex justify-between items-center font-bold text-[14px]">
                  <span className="text-slate-900">Total Inflows (A):</span>
                  <span className="text-emerald-700 font-black text-[16px]">
                    ₹{totalGrossIncome.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Expense Ledger Column */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                    <span className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      2. Operating Expenses
                    </span>
                    <span className="text-[12px] font-bold text-slate-500">Amount (₹)</span>
                  </div>

                  <div className="flex flex-col gap-2 py-3 text-[13px]">
                    {Object.entries(expensesByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">{category}</span>
                        <span className="font-extrabold text-slate-900">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 flex justify-between items-center font-bold text-[14px]">
                  <span className="text-slate-900">Total Outflows (B):</span>
                  <span className="text-rose-600 font-black text-[16px]">
                    ₹{totalOperatingExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Balance Sheet Net Position */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Net Balance Position (A - B)
                </span>
                <div className="text-[24px] font-black text-[#0a332c]">
                  ₹{netOperatingProfit.toLocaleString('en-IN')}
                </div>
                <p className="text-[12px] text-emerald-800 font-medium">
                  Net profit retained in Agam PG business operating account
                </p>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-200/80 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Uncollected Rent (Accounts Receivable)
                </span>
                <span className="text-[18px] font-black text-amber-700">
                  ₹{totalPendingRent.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 block font-medium">
                  {rentPayments.filter((p) => p.status !== 'Paid').length} residents pending
                </span>
              </div>
            </div>
          </div>

          {/* 6-Month Historic Trend Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  6-Month Revenue & Expense Trend
                </h3>
                <p className="text-[12px] text-slate-500 font-medium">
                  Monthly cash collection performance vs operational costs
                </p>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                84.5% Collection Efficiency
              </span>
            </div>

            <div className="flex items-end gap-3 h-32 w-full mt-4 px-2">
              {MONTHLY_TREND_DATA.map((item, idx) => {
                const isSelected = idx === selectedMonthIndex;
                const revenueHeightPct = Math.round((item.revenue / maxRevenue) * 100);
                const expenseHeightPct = Math.round((item.expense / maxRevenue) * 100);

                return (
                  <div
                    key={item.month}
                    onClick={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                      {/* Revenue Bar */}
                      <div
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#0a332c] ring-2 ring-emerald-400/50 shadow-xs'
                            : 'bg-emerald-600/70 hover:bg-emerald-600'
                        }`}
                        style={{ height: `${revenueHeightPct}%` }}
                        title={`${item.month} Revenue: ₹${item.revenue.toLocaleString('en-IN')}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 rounded-t-md bg-rose-400/80 hover:bg-rose-500 transition-all duration-300"
                        style={{ height: `${expenseHeightPct}%` }}
                        title={`${item.month} Expense: ₹${item.expense.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-1.5 ${
                        isSelected ? 'text-[#0a332c] underline' : 'text-slate-600'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0a332c]"></span>
                <span>Revenue (Inflows)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-400"></span>
                <span>Operating Expenses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME & RENT COLLECTION */}
      {activeTab === 'income' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Revenue & Incomes ({currentMonthName})
              </span>
              <div className="text-[26px] font-black text-emerald-700 mt-0.5 tracking-tight">
                ₹{totalGrossIncome.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAddIncome}
                className="bg-[#0a332c] hover:bg-[#0f4239] active:scale-95 text-white px-4 py-2 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Record Other Inflow</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setIncomeCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
                  incomeCategoryFilter === 'all'
                    ? 'bg-[#0a332c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({rentPayments.length + incomes.length})
              </button>
              <button
                onClick={() => setIncomeCategoryFilter('rent')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
                  incomeCategoryFilter === 'rent'
                    ? 'bg-[#0a332c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Room Rents ({rentPayments.length})
              </button>
              <button
                onClick={() => setIncomeCategoryFilter('bulk')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
                  incomeCategoryFilter === 'bulk'
                    ? 'bg-[#0a332c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Corporate / Bulk
              </button>
              <button
                onClick={() => setIncomeCategoryFilter('deposit')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
                  incomeCategoryFilter === 'deposit'
                    ? 'bg-[#0a332c] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Security Deposits
              </button>
            </div>

            <div className="w-full sm:w-60 relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search resident or company..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-[12px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a332c]/20 focus:border-[#0a332c]"
              />
            </div>
          </div>

          {/* Rent Collections List */}
          {(incomeCategoryFilter === 'all' || incomeCategoryFilter === 'rent' || incomeCategoryFilter === 'bulk') && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[14px] font-black text-slate-900">
                  Monthly Room Rent Dues ({currentMonthName})
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentMonthRentPayments.length} resident dues
                </span>
              </div>

              {currentMonthRentPayments.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-[13px]">
                  No rent dues recorded for {currentMonthName}.
                </div>
              ) : (
                currentMonthRentPayments
                  .filter((p) => {
                    if (incomeCategoryFilter === 'bulk' && !p.isBulkPayment) return false;
                    if (paymentSearch.trim()) {
                      const q = paymentSearch.toLowerCase();
                      return (
                        p.tenantName.toLowerCase().includes(q) ||
                        (p.companyName && p.companyName.toLowerCase().includes(q)) ||
                        p.roomNumber.toString().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((payment) => {
                    const isPaid = payment.status === 'Paid';
                    const isOverdue = payment.status === 'Overdue';
                    const isCompany = payment.status === 'Company Billed' || payment.isBulkPayment;

                    return (
                      <div
                        key={payment.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs hover:border-[#0a332c]/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] shrink-0 ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isCompany
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isPaid ? 'check_circle' : isCompany ? 'corporate_fare' : 'pending_actions'}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                                {payment.tenantName}
                              </h4>
                              {payment.bedNumber && (
                                <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                  {payment.bedNumber}
                                </span>
                              )}
                              {payment.isBulkPayment && (
                                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                                  Corporate Contract
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                              Room {payment.roomNumber} • Due Date: {payment.dueDate}
                              {payment.companyName && ` • ${payment.companyName}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="text-[17px] font-black text-slate-900 block leading-tight">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : isCompany
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {payment.status} {isPaid && payment.paidDate ? `(${payment.paidDate})` : ''}
                            </span>
                          </div>

                          {!isPaid && (
                            <button
                              onClick={() => onMarkPaid(payment)}
                              className="bg-[#0a332c] hover:bg-[#0f4239] text-white text-[12px] font-extrabold px-3.5 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all"
                            >
                              Collect
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* Other PG Incomes & Deposits */}
          {(incomeCategoryFilter === 'all' || incomeCategoryFilter === 'deposit' || incomeCategoryFilter === 'other') && (
            <div className="flex flex-col gap-3 mt-2">
              <h3 className="text-[14px] font-black text-slate-900 px-1">
                Other Inflows & Security Deposits for {currentMonthName} ({currentMonthIncomes.length})
              </h3>

              {currentMonthIncomes.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-[13px]">
                  No other incomes or deposits recorded for {currentMonthName}.
                </div>
              ) : (
                currentMonthIncomes
                  .filter((inc) => {
                    if (incomeCategoryFilter === 'deposit' && inc.category !== 'Security Deposit') return false;
                    if (incomeCategoryFilter === 'other' && inc.category === 'Security Deposit') return false;
                    if (paymentSearch.trim()) {
                      const q = paymentSearch.toLowerCase();
                      return (
                        inc.title.toLowerCase().includes(q) ||
                        inc.receivedFrom.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((income) => (
                    <div
                      key={income.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">add_card</span>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                            {income.title}
                          </h4>
                          <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">{income.category}</span>
                            <span>•</span>
                            <span>{income.receivedFrom}</span>
                            <span>•</span>
                            <span>{income.date}</span>
                            <span>•</span>
                            <span className="font-extrabold text-emerald-800">{income.paymentMode}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[17px] font-black text-emerald-700">
                          +₹{income.amount.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onDeleteIncome(income.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Operating Outflows ({currentMonthName})
              </span>
              <div className="text-[26px] font-black text-rose-600 mt-0.5 tracking-tight">
                ₹{totalOperatingExpenses.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={onAddExpense}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-4 py-2 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Log Expense</span>
            </button>
          </div>

          {/* Expenses List */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[14px] font-black text-slate-900 px-1">
              Expense Records for {currentMonthName} ({currentMonthExpenses.length})
            </h3>

            {currentMonthExpenses.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-[13px]">
                No expenses recorded for {currentMonthName}.
              </div>
            ) : (
              currentMonthExpenses.map((expense) => {
                const getCategoryIcon = (cat: Expense['category']) => {
                  switch (cat) {
                    case 'Electricity':
                      return 'bolt';
                    case 'Staff & Caretaker Salary':
                      return 'badge';
                    case 'Internet / Wi-Fi':
                      return 'wifi';
                    case 'Water Tanker':
                      return 'water_drop';
                    case 'Plumbing & Repairs':
                      return 'handyman';
                    case 'Building Rent':
                      return 'apartment';
                    default:
                      return 'receipt';
                  }
                };

                return (
                  <div
                    key={expense.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">
                          {getCategoryIcon(expense.category)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                          {expense.title}
                        </h4>
                        <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700">{expense.paidTo}</span>
                          <span>•</span>
                          <span>{expense.date}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">{expense.paymentMode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[17px] font-black text-rose-600">
                        -₹{expense.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

