import React, { useState, useMemo } from 'react';
import { Tenant } from '../types';

interface PeopleScreenProps {
  tenants?: Tenant[];
  initialFilter?: string;
  onSelectTenant: (tenant: Tenant) => void;
  onAddTenant: () => void;
  onCollectRent: (tenantId: string) => void;
  onSendWhatsAppReminder: (tenant: Tenant) => void;
}

export const PeopleScreen: React.FC<PeopleScreenProps> = ({
  tenants = [],
  initialFilter = 'active',
  onSelectTenant,
  onAddTenant,
  onCollectRent,
  onSendWhatsAppReminder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'active'); // 'active', 'overdue' or 'checked_out'
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Keep in sync if initialFilter changes externally
  React.useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const activeTenants = tenants.filter((t) => t.isActive);
  const checkedOutTenants = tenants.filter((t) => !t.isActive);
  const overdueTenants = activeTenants.filter((t) => t.status === 'Overdue' || t.status === 'Unpaid');

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Search filter
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        t.roomNumber.toString().includes(searchQuery);

      // Room filter
      const matchesRoom = roomFilter === 'all' || t.roomNumber.toString() === roomFilter;

      // Category tab filter
      let matchesCategory = true;
      if (activeFilter === 'active') {
        matchesCategory = t.isActive;
      } else if (activeFilter === 'overdue') {
        matchesCategory = t.isActive && (t.status === 'Overdue' || t.status === 'Unpaid' || t.status === 'Partial');
      } else if (activeFilter === 'checked_out') {
        matchesCategory = !t.isActive;
      }

      return matchesSearch && matchesRoom && matchesCategory;
    });
  }, [tenants, searchQuery, activeFilter, roomFilter]);

  const uniqueRooms = Array.from(new Set(tenants.map((t) => t.roomNumber))).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="flex flex-col gap-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-1.5">
      {/* Top Action & Stat Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">person</span>
            <span className="text-[13px] font-black">{activeTenants.length} Active</span>
          </div>
          {overdueTenants.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-2.5 py-1.5 flex items-center gap-1">
              <span className="text-[12px] font-bold">{overdueTenants.length} Dues</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddTenant}
            className="h-[46px] px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 text-[14px] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone or room #..."
            className="w-full h-[46px] pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 text-[12px]">
          <button
            onClick={() => setActiveFilter('active')}
            className={`h-[42px] px-3.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'active'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span>All Active</span>
            <span className="bg-white/20 text-current text-[11px] px-1 py-0.2 rounded-full font-black">
              {activeTenants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('overdue')}
            className={`h-[42px] px-3.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Overdue ({overdueTenants.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('checked_out')}
            className={`h-[42px] px-3.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeFilter === 'checked_out'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Checked Out ({checkedOutTenants.length})
          </button>
        </div>
      </div>

      {/* Tenants List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map((tenant) => {
          const isOverdue = tenant.status === 'Overdue' || tenant.status === 'Unpaid';
          const isPartial = tenant.status === 'Partial';
          const isPaid = tenant.status === 'Paid';

          return (
            <div
              key={tenant.id}
              onClick={() => onSelectTenant(tenant)}
              className="bg-white border border-slate-200 hover:border-[#0a332c]/50 rounded-2xl p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              {/* Top Row: Name, Room Tag, Bed */}
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0a332c]/10 text-[#0a332c] border border-[#0a332c]/20 flex items-center justify-center font-black text-[16px] group-hover:bg-[#0a332c] group-hover:text-white transition-colors">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[15px] text-slate-900 group-hover:text-[#0a332c] transition-colors leading-tight">
                        {tenant.name}
                      </h4>
                      <p className="text-[13px] text-slate-500 font-semibold mt-0.5">
                        {tenant.phone}
                      </p>
                    </div>
                  </div>

                  {/* Room & Bed Pill */}
                  <div className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-right">
                    <span className="text-[13px] font-black text-slate-900 block leading-tight">
                      Room {tenant.roomNumber}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded inline-block mt-0.5">
                      {tenant.bedNumber || 'B1'}
                    </span>
                  </div>
                </div>

                {/* Document Attached Indicator */}
                {(tenant.documentPhotoUrl || tenant.termsDocumentUrl) && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                    <span>ID & Signed T&C Document on File</span>
                  </div>
                )}
              </div>

              {/* Financial & Actions Row */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Monthly Rent
                  </span>
                  <span className="text-[14px] font-black text-slate-900">
                    ₹{tenant.rentAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Status Indicator */}
                  {isPaid && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[13px] px-3 py-1.5 rounded-lg">
                      Paid
                    </span>
                  )}
                  {isPartial && (
                    <button
                      onClick={() => onCollectRent(tenant.id)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[13px] h-[40px] px-3.5 rounded-lg shadow-2xs transition-colors"
                    >
                      Due ₹{tenant.balance}
                    </button>
                  )}
                  {isOverdue && (
                    <button
                      onClick={() => onCollectRent(tenant.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[13px] h-[40px] px-3.5 rounded-lg shadow-2xs transition-colors"
                    >
                      Collect ₹{tenant.balance || tenant.rentAmount}
                    </button>
                  )}

                  {/* WhatsApp Quick Trigger */}
                  <button
                    onClick={() => onSendWhatsAppReminder(tenant)}
                    className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenants.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[36px] text-slate-400">group_off</span>
          <h4 className="font-extrabold text-[15px] text-slate-800">
            {tenants.length === 0 ? 'No residents added yet' : 'No residents match your search'}
          </h4>
          <p className="text-[13px] text-slate-500 max-w-sm">
            {tenants.length === 0
              ? 'Start checking in residents with room allocations, rent amounts, deposits, and ID proofs.'
              : 'Try adjusting your category tabs or clearing the search query.'}
          </p>
          {tenants.length === 0 ? (
            <button
              onClick={onAddTenant}
              className="mt-2 h-[46px] px-4 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[13px] flex items-center gap-2 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add Your First Tenant</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('active');
                setRoomFilter('all');
              }}
              className="mt-2 text-[13px] font-bold text-[#0a332c] underline"
            >
              Show All Active Residents
            </button>
          )}
        </div>
      )}
    </div>
  );
};
