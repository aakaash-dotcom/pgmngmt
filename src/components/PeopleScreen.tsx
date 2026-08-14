import React, { useState, useMemo } from 'react';
import { Tenant } from '../types';

interface PeopleScreenProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onAddTenant: () => void;
  initialFilter?: string;
}

export const PeopleScreen: React.FC<PeopleScreenProps> = ({
  tenants,
  onSelectTenant,
  onAddTenant,
  initialFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'active' | 'left' | 'overdue'>(
    initialFilter === 'overdue' ? 'overdue' : 'active'
  );

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Tab filter
      if (activeTabFilter === 'active' && !tenant.isActive) return false;
      if (activeTabFilter === 'left' && tenant.isActive) return false;
      if (activeTabFilter === 'overdue' && (tenant.status !== 'Overdue' || !tenant.isActive)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(query);
        const matchesPhone = tenant.phone.toLowerCase().includes(query);
        const matchesRoom = String(tenant.roomNumber).includes(query) || `room ${tenant.roomNumber}`.includes(query);
        if (!matchesName && !matchesPhone && !matchesRoom) {
          return false;
        }
      }

      return true;
    });
  }, [tenants, activeTabFilter, searchQuery]);

  const getStatusBadge = (status: Tenant['status'], isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="bg-[#262626] text-[#888888] rounded-full px-2.5 py-[2px] text-[11px] font-black uppercase tracking-wider mt-1 border border-[#333333]">
          Left
        </span>
      );
    }

    switch (status) {
      case 'Paid':
        return (
          <span className="bg-[#E2FF00] text-black rounded-full px-2.5 py-[2px] text-[11px] font-black uppercase tracking-wider mt-1 shadow-[0_0_8px_rgba(226,255,0,0.3)]">
            Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="bg-[#ff3b30] text-white rounded-full px-2.5 py-[2px] text-[11px] font-black uppercase tracking-wider mt-1">
            Overdue
          </span>
        );
      case 'Partial':
        return (
          <span className="bg-[#ffaa00] text-black rounded-full px-2.5 py-[2px] text-[11px] font-black uppercase tracking-wider mt-1">
            Partial
          </span>
        );
      case 'Unpaid':
        return (
          <span className="bg-[#ffaa00] text-black rounded-full px-2.5 py-[2px] text-[11px] font-black uppercase tracking-wider mt-1">
            Unpaid
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBorderColor = (status: Tenant['status'], isActive: boolean) => {
    if (!isActive) return 'bg-[#666666]';
    switch (status) {
      case 'Paid':
        return 'bg-[#E2FF00]';
      case 'Overdue':
        return 'bg-[#ff3b30]';
      case 'Partial':
      case 'Unpaid':
        return 'bg-[#ffaa00]';
      default:
        return 'bg-[#E2FF00]';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-24 relative">
      {/* Page Header & Search */}
      <section className="px-4 pt-4 pb-3">
        <h1 className="text-[28px] font-black text-white uppercase tracking-tight mb-3 leading-tight">
          Tenants
        </h1>

        <div className="relative flex items-center w-full">
          <input
            id="input-tenant-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-4 pr-[48px] border border-[#333333] rounded-xl bg-[#141414] text-white text-[15px] focus:border-[#E2FF00] focus:ring-1 focus:ring-[#E2FF00] focus:outline-none shadow-md transition-all placeholder:text-[#666666] font-medium"
            placeholder="Search by Name / Phone / Room..."
            type="text"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#888888] hover:text-white p-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          ) : (
            <span
              className="material-symbols-outlined text-[#888888] absolute right-4 pointer-events-none"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search
            </span>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
        <button
          id="filter-active-only"
          onClick={() => setActiveTabFilter('active')}
          className={`rounded-xl px-4 py-1.5 text-[12px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs active:scale-95 transition-all border ${
            activeTabFilter === 'active'
              ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_15px_rgba(226,255,0,0.3)]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Active Only ({tenants.filter((t) => t.isActive).length})
        </button>

        <button
          id="filter-show-left"
          onClick={() => setActiveTabFilter('left')}
          className={`rounded-xl px-4 py-1.5 text-[12px] font-black uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all border ${
            activeTabFilter === 'left'
              ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_15px_rgba(226,255,0,0.3)]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Show Left ({tenants.filter((t) => !t.isActive).length})
        </button>

        <button
          id="filter-overdue-only"
          onClick={() => setActiveTabFilter('overdue')}
          className={`rounded-xl px-4 py-1.5 text-[12px] font-black uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all border ${
            activeTabFilter === 'overdue'
              ? 'bg-[#ff3b30] text-white border-[#ff3b30]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Overdue ({tenants.filter((t) => t.isActive && t.status === 'Overdue').length})
        </button>
      </section>

      {/* Tenant List */}
      <section className="px-4 flex flex-col gap-3">
        {filteredTenants.map((tenant) => {
          const borderStripColor = getStatusBorderColor(tenant.status, tenant.isActive);

          return (
            <article
              key={tenant.id}
              id={`tenant-row-${tenant.id}`}
              onClick={() => onSelectTenant(tenant)}
              className="relative bg-[#121212] border border-[#262626] rounded-2xl pl-[20px] pr-3 py-3.5 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] min-h-[68px] hover:border-[#E2FF00] transition-all cursor-pointer select-none group"
            >
              {/* Left Color Strip (4px) */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl ${borderStripColor}`}
              />

              <div className="flex flex-col justify-center flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] sm:text-[19px] font-black text-white leading-snug group-hover:text-[#E2FF00] transition-colors">
                    {tenant.name}
                  </h2>
                  {tenant.bedNumber && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#aaaaaa] border border-[#333333]">
                      Bed {tenant.bedNumber}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#888888] font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-[#E2FF00]">bed</span>
                  <span className="text-[#cccccc]">Room {tenant.roomNumber}</span>
                  <span className="text-[#444444]">•</span>
                  <span className="text-[#888888]">{tenant.phone}</span>
                </p>
              </div>

              <div className="flex flex-col items-end justify-center mr-2 shrink-0">
                <span className="text-[18px] font-black text-white">
                  ₹{tenant.rentAmount.toLocaleString('en-IN')}
                </span>
                {getStatusBadge(tenant.status, tenant.isActive)}
              </div>

              <span className="material-symbols-outlined text-[#666666] group-hover:text-[#E2FF00] text-[22px] shrink-0 transition-colors">
                chevron_right
              </span>
            </article>
          );
        })}

        {filteredTenants.length === 0 && (
          <div className="text-center py-12 bg-[#121212] rounded-2xl border border-[#262626] my-4 p-6">
            <span className="material-symbols-outlined text-[48px] text-[#888888] mb-2">
              person_search
            </span>
            <h3 className="text-[18px] font-black text-white uppercase tracking-wider">No tenants found</h3>
            <p className="text-[13px] text-[#888888] mt-1 font-medium">
              {searchQuery ? `No results matching "${searchQuery}"` : 'No records in this tab.'}
            </p>
            <button
              onClick={onAddTenant}
              className="mt-4 px-5 py-2.5 bg-[#E2FF00] text-black font-black uppercase text-[13px] tracking-wider rounded-xl flex items-center gap-1.5 mx-auto hover:bg-[#d4f000]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add New Tenant
            </button>
          </div>
        )}
      </section>

      {/* Floating Action Button (FAB) */}
      <button
        id="fab-add-tenant"
        aria-label="Add Tenant"
        onClick={onAddTenant}
        className="fixed bottom-[88px] right-4 w-[56px] h-[56px] bg-[#E2FF00] text-black rounded-2xl shadow-[0_0_25px_rgba(226,255,0,0.5)] hover:bg-[#d4f000] flex items-center justify-center active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[28px] font-black">add</span>
      </button>
    </div>
  );
};

