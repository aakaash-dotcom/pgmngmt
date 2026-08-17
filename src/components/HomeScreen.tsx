import React from 'react';
import { Room, Tenant, Expense, Income, TabType, BulkGroup } from '../types';
import { OWNER_PHONE_INTL, PG_NAME } from '../data/initialData';

interface HomeScreenProps {
  rooms?: Room[];
  tenants?: Tenant[];
  bulkGroups?: BulkGroup[];
  expenses?: Expense[];
  incomes?: Income[];
  onNavigate: (tab: TabType, filter?: string) => void;
  onAddTenant: () => void;
  onAddRoom: () => void;
  onCollectRent: () => void;
  onAddExpense: () => void;
  onOpenBulkManager?: () => void;
  onOpenAlertModal: (alertType: 'overdue' | 'stayEnding' | 'refundPending') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  rooms = [],
  tenants = [],
  bulkGroups = [],
  expenses = [],
  incomes = [],
  onNavigate,
  onAddTenant,
  onAddRoom,
  onCollectRent,
  onAddExpense,
  onOpenBulkManager,
  onOpenAlertModal,
}) => {
  // Dynamic occupancy calculations
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0) || 1;
  const occupiedBeds = rooms.reduce(
    (acc, r) => acc + (r.status === 'maintenance' ? 0 : r.occupied),
    0
  );
  const vacantBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = Math.round((occupiedBeds / totalCapacity) * 100);

  // Financial calculations for current month
  const activeTenants = tenants.filter((t) => t.isActive);
  const totalCollectedMonth = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpensesMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netOperatingProfit = totalCollectedMonth - totalExpensesMonth;
  const totalPendingDues = activeTenants.reduce((sum, t) => sum + (t.balance || 0), 0);

  // Bulk groups count & residents
  const bulkTenants = activeTenants.filter((t) => t.isBulkContract);
  const bulkMonthlyRevenue = bulkTenants.reduce((sum, t) => sum + t.rentAmount, 0);

  // Alert counts
  const overdueTenantsCount = tenants.filter((t) => t.isActive && (t.status === 'Overdue' || t.status === 'Unpaid')).length;
  const stayEndingCount = tenants.filter(
    (t) => t.isActive && (t.checkOutDate || t.notes?.toLowerCase().includes('vacating'))
  ).length;
  const refundPendingCount = tenants.filter(
    (t) => !t.isActive && t.notes?.toLowerCase().includes('refund')
  ).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-1.5 pb-20 flex flex-col gap-4">
      {/* Quick Action Matrix */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={onCollectRent}
          className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 h-[48px] rounded-xl shadow-2xs active:scale-98 transition-all font-extrabold text-[12px]"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-700">payments</span>
          <span>Collect Rent</span>
        </button>

        <button
          onClick={onAddTenant}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white h-[48px] rounded-xl shadow-2xs active:scale-98 transition-all font-extrabold text-[12px]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Tenant</span>
        </button>

        <button
          onClick={onAddRoom}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 h-[48px] rounded-xl shadow-2xs active:scale-98 transition-all font-extrabold text-[12px]"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-700">meeting_room</span>
          <span>Add Room</span>
        </button>

        <button
          onClick={onAddExpense}
          className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 h-[48px] rounded-xl shadow-2xs active:scale-98 transition-all font-extrabold text-[12px]"
        >
          <span className="material-symbols-outlined text-[18px] text-rose-700">receipt_long</span>
          <span>Log Expense</span>
        </button>
      </section>

      {/* Bed Occupancy Meter (Visual & Element-Driven) */}
      <section className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">bed</span>
            </span>
            <div>
              <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight">Occupancy</h3>
            </div>
          </div>
          <span
            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
              occupancyPercentage >= 80
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {occupancyPercentage}% Occupied
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
          <div
            className="h-full bg-emerald-800 rounded-full transition-all duration-500"
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>

        {/* 3 Metric Element Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div
            onClick={() => onNavigate('rooms')}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Total</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-slate-700">hotel</span>
              <span className="text-[18px] font-black text-slate-900">{totalCapacity}</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('rooms')}
            className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-center cursor-pointer hover:bg-emerald-100/70 transition-colors"
          >
            <span className="text-[10px] font-bold text-emerald-800 block uppercase">Occupied</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-800">person</span>
              <span className="text-[18px] font-black text-emerald-900">{occupiedBeds}</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('rooms', 'vacant')}
            className="bg-sky-50/70 border border-sky-200 rounded-xl p-2.5 text-center cursor-pointer hover:bg-sky-100/70 transition-colors"
          >
            <span className="text-[10px] font-bold text-sky-800 block uppercase">Vacant</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-sky-800">check_circle</span>
              <span className="text-[18px] font-black text-sky-900">{vacantBeds}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Groups Card */}
      <section
        onClick={onOpenBulkManager}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-amber-400 transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[15px] text-slate-900">Groups</h3>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                {bulkGroups.length} Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold mt-0.5">
              <span>{bulkTenants.length} Residents</span>
              <span>•</span>
              <span>₹{bulkMonthlyRevenue.toLocaleString('en-IN')}/mo</span>
            </div>
          </div>
        </div>

        <button className="h-[34px] px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[11px] flex items-center gap-1 transition-colors shadow-2xs">
          <span>Manage</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </section>

      {/* Financial Health Snapshot */}
      <section className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
            <h3 className="text-[15px] font-extrabold text-slate-900">Accounts</h3>
          </div>
          <button
            onClick={() => onNavigate('money')}
            className="text-[12px] text-emerald-800 font-black hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Revenue</span>
            <span className="text-[16px] font-black text-emerald-800 block mt-0.5">
              ₹{totalCollectedMonth.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Expenses</span>
            <span className="text-[16px] font-black text-rose-600 block mt-0.5">
              ₹{totalExpensesMonth.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Profit</span>
            <span
              className={`text-[16px] font-black block mt-0.5 ${
                netOperatingProfit >= 0 ? 'text-emerald-800' : 'text-rose-600'
              }`}
            >
              ₹{netOperatingProfit.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending</span>
            <span
              className={`text-[16px] font-black block mt-0.5 ${
                totalPendingDues > 0 ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              ₹{totalPendingDues.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-amber-500">warning</span>
            <span>Alerts</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Overdue */}
          <div
            id="alert-rent-overdue"
            onClick={() => onOpenAlertModal('overdue')}
            className="bg-white border border-slate-200 shadow-2xs rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-rose-300 hover:bg-rose-50/20 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <span className="material-symbols-outlined text-[16px]">warning</span>
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-900">Overdue Rent</div>
                <div className="text-[10px] text-slate-500 font-semibold">₹{totalPendingDues.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              {overdueTenantsCount}
            </span>
          </div>

          {/* Stay Ending */}
          <div
            id="alert-stay-ending"
            onClick={() => onOpenAlertModal('stayEnding')}
            className="bg-white border border-slate-200 shadow-2xs rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-amber-300 hover:bg-amber-50/20 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-900">Vacating</div>
                <div className="text-[10px] text-slate-500 font-semibold">30-day notice</div>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              {stayEndingCount}
            </span>
          </div>

          {/* Refund Pending */}
          <div
            id="alert-refund-pending"
            onClick={() => onOpenAlertModal('refundPending')}
            className="bg-white border border-slate-200 shadow-2xs rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-900">Refunds</div>
                <div className="text-[10px] text-slate-500 font-semibold">Checkout check</div>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              {refundPendingCount}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
