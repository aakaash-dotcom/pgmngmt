import React from 'react';
import { Room, Tenant, TabType } from '../types';

interface HomeScreenProps {
  rooms: Room[];
  tenants: Tenant[];
  onNavigate: (tab: TabType, filter?: string) => void;
  onAddTenant: () => void;
  onCollectRent: () => void;
  onOpenAlertModal: (alertType: 'overdue' | 'stayEnding' | 'refundPending') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  rooms,
  tenants,
  onNavigate,
  onAddTenant,
  onCollectRent,
  onOpenAlertModal,
}) => {
  // Dynamically calculate metrics
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0) || 72;
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.status === 'maintenance' ? 0 : r.occupied), 0);
  const vacantBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = Math.round((occupiedBeds / (totalCapacity || 1)) * 100);

  const overdueTenantsCount = tenants.filter((t) => t.isActive && t.status === 'Overdue').length || 4;
  const stayEndingCount = tenants.filter((t) => t.isActive && t.notes?.toLowerCase().includes('vacating')).length || 2;
  const refundPendingCount = tenants.filter((t) => !t.isActive && t.notes?.toLowerCase().includes('refund')).length || 1;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-12 flex flex-col gap-6">
      {/* Summary Section (Bento Grid) */}
      <section className="flex flex-col gap-3">
        {/* Occupancy Hero Card */}
        <div
          id="card-current-occupancy"
          onClick={() => onNavigate('rooms')}
          className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] cursor-pointer hover:border-[#E2FF00] transition-all group"
        >
          {/* Status strip on left */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#E2FF00]" />

          <div className="flex justify-between items-start pl-1">
            <h2 className="text-[12px] font-black text-[#999999] uppercase tracking-widest">
              CURRENT OCCUPANCY
            </h2>
            <span className="bg-[#E2FF00] text-black text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2% Optimal
            </span>
          </div>

          <div className="flex items-end gap-3 w-full pl-1">
            <span className="text-[34px] sm:text-[40px] font-black text-white leading-none tracking-tight">
              {occupancyPercentage}%
            </span>
            <div className="w-full h-3 bg-[#262626] rounded-full mb-1.5 overflow-hidden flex-grow border border-[#333333]">
              <div
                className="h-full bg-[#E2FF00] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(226,255,0,0.5)]"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Beds Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Occupied Beds */}
          <div
            id="card-occupied-beds"
            onClick={() => onNavigate('rooms', 'occupied')}
            className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl p-4 relative overflow-hidden h-[100px] flex flex-col justify-center cursor-pointer hover:border-[#E2FF00] transition-all"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#E2FF00]" />
            <div className="pl-1">
              <h3 className="text-[11px] font-black text-[#999999] uppercase tracking-widest mb-1">
                OCCUPIED BEDS
              </h3>
              <div className="text-[24px] font-black text-white flex items-baseline">
                <span>{occupiedBeds}</span>
                <span className="text-[15px] text-[#888888] font-bold ml-1.5">/{totalCapacity}</span>
              </div>
            </div>
          </div>

          {/* Vacant Beds */}
          <div
            id="card-vacant-beds"
            onClick={() => onNavigate('rooms', 'vacant')}
            className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl p-4 relative overflow-hidden h-[100px] flex flex-col justify-center cursor-pointer hover:border-[#E2FF00] transition-all"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#888888]" />
            <div className="pl-1">
              <h3 className="text-[11px] font-black text-[#999999] uppercase tracking-widest mb-1">
                VACANT BEDS
              </h3>
              <div className="text-[24px] font-black text-[#E2FF00]">
                {vacantBeds}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financials Hero Section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[18px] font-black text-white uppercase tracking-wider pl-0.5">
          Financials (Aug 2026)
        </h2>
        <div
          id="card-financials-hero"
          onClick={() => onNavigate('money')}
          className="bg-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.7)] rounded-2xl p-5 relative overflow-hidden border border-[#333333] cursor-pointer group hover:border-[#E2FF00] transition-all"
        >
          {/* Neon status strip */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#E2FF00]" />

          <div className="relative z-10 flex flex-col gap-4 pl-1">
            <div>
              <h3 className="text-[11px] font-black text-[#999999] uppercase tracking-widest mb-1">
                NET COLLECTION THIS MONTH
              </h3>
              <div className="text-[34px] sm:text-[40px] font-black text-[#E2FF00] tracking-tight">
                ₹1,85,000
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#222222]">
              <div>
                <div className="text-[10px] text-[#888888] font-black uppercase tracking-wider mb-0.5">
                  EXPECTED
                </div>
                <div className="text-[17px] text-white font-black">₹2.5L</div>
              </div>
              <div>
                <div className="text-[10px] text-[#888888] font-black uppercase tracking-wider mb-0.5">
                  COLLECTED
                </div>
                <div className="text-[17px] text-white font-black">₹2.1L</div>
              </div>
              <div>
                <div className="text-[10px] text-[#E2FF00] font-black uppercase tracking-wider mb-0.5">
                  PENDING
                </div>
                <div className="text-[17px] text-[#E2FF00] font-black">₹40K</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="grid grid-cols-2 gap-3">
        <button
          id="btn-home-add-tenant"
          onClick={onAddTenant}
          className="flex flex-col items-center justify-center gap-1 bg-[#E2FF00] text-black h-[76px] rounded-2xl shadow-[0_4px_20px_rgba(226,255,0,0.25)] hover:bg-[#d4f000] active:scale-95 transition-all uppercase tracking-wider font-black text-[13px]"
        >
          <span className="material-symbols-outlined text-[24px]">person_add</span>
          <span>Add Tenant</span>
        </button>

        <button
          id="btn-home-collect-rent"
          onClick={onCollectRent}
          className="flex flex-col items-center justify-center gap-1 bg-[#141414] border-2 border-[#E2FF00] text-[#E2FF00] h-[76px] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:bg-[#1f1f1f] active:scale-95 transition-all uppercase tracking-wider font-black text-[13px]"
        >
          <span className="material-symbols-outlined text-[24px]">payments</span>
          <span>Collect Rent</span>
        </button>
      </section>

      {/* Alert Cards Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[18px] font-black text-white uppercase tracking-wider pl-0.5 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#E2FF00]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            notifications_active
          </span>
          Action Required
        </h2>

        {/* Alert 1: Rent Overdue */}
        <div
          id="alert-rent-overdue"
          onClick={() => onOpenAlertModal('overdue')}
          className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl px-4 py-3.5 flex items-center justify-between relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:border-[#ff3b30]"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff3b30]" />
          <div className="flex items-center gap-3.5 pl-1">
            <div className="w-10 h-10 rounded-xl bg-[#2a0d0d] text-[#ff453a] flex items-center justify-center shrink-0 border border-[#ff3b30]/30">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div className="text-[16px] font-black text-white">Rent Overdue</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ff3b30] text-white font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
              {overdueTenantsCount} Tenants
            </span>
            <span className="material-symbols-outlined text-[#666666]">chevron_right</span>
          </div>
        </div>

        {/* Alert 2: Stay Ending */}
        <div
          id="alert-stay-ending"
          onClick={() => onOpenAlertModal('stayEnding')}
          className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl px-4 py-3.5 flex items-center justify-between relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:border-[#ffaa00]"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ffaa00]" />
          <div className="flex items-center gap-3.5 pl-1">
            <div className="w-10 h-10 rounded-xl bg-[#2a1e00] text-[#ffaa00] flex items-center justify-center shrink-0 border border-[#ffaa00]/30">
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </div>
            <div className="text-[16px] font-black text-white">Stay Ending</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ffaa00] text-black font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
              {stayEndingCount} Tenants
            </span>
            <span className="material-symbols-outlined text-[#666666]">chevron_right</span>
          </div>
        </div>

        {/* Alert 3: Refund Pending */}
        <div
          id="alert-refund-pending"
          onClick={() => onOpenAlertModal('refundPending')}
          className="bg-[#121212] border border-[#262626] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl px-4 py-3.5 flex items-center justify-between relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:border-[#888888]"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#888888]" />
          <div className="flex items-center gap-3.5 pl-1">
            <div className="w-10 h-10 rounded-xl bg-[#1f1f1f] text-[#aaaaaa] flex items-center justify-center shrink-0 border border-[#444444]">
              <span className="material-symbols-outlined text-[22px]">currency_exchange</span>
            </div>
            <div className="text-[16px] font-black text-white">Refund Pending</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#262626] text-[#E2FF00] border border-[#333333] font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
              {refundPendingCount} Tenant
            </span>
            <span className="material-symbols-outlined text-[#666666]">chevron_right</span>
          </div>
        </div>
      </section>
    </div>
  );
};

