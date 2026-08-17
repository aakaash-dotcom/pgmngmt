import React, { useState, useMemo } from 'react';
import { Room, Tenant } from '../types';

interface RoomsScreenProps {
  rooms?: Room[];
  tenants?: Tenant[];
  initialStatusFilter?: string;
  onSelectRoom: (room: Room) => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onAddTenantToRoom?: (roomNumber: number) => void;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  rooms = [],
  tenants = [],
  initialStatusFilter = 'all',
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onAddTenantToRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingFilter, setSharingFilter] = useState<string>('all'); // 'all', '1', '2', '3', '4', '5', '6', '8', '10'
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all'); // 'all', 'vacant', 'available', 'full', 'maintenance'
  const [acFilter, setAcFilter] = useState<string>('all'); // 'all', 'AC', 'Non-AC'
  const [floorFilter, setFloorFilter] = useState<string>('all');

  // Keep filter in sync if initialStatusFilter changes
  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Stats calculation
  const totalBeds = rooms.reduce((sum, r) => sum + (r.status !== 'maintenance' ? r.capacity : 0), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + (r.status !== 'maintenance' ? r.occupied : 0), 0);
  const availableBeds = totalBeds - occupiedBeds;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch =
        r.number.toString().includes(searchQuery) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.occupants.some((occ) => occ.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSharing =
        sharingFilter === 'all' || r.capacity.toString() === sharingFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'vacant' && r.status === 'empty') ||
        (statusFilter === 'partial' && r.status === 'partial') ||
        (statusFilter === 'full' && r.status === 'full') ||
        (statusFilter === 'maintenance' && r.status === 'maintenance') ||
        (statusFilter === 'available' && (r.status === 'empty' || r.status === 'partial'));

      const matchesAc = acFilter === 'all' || r.type === acFilter;

      const matchesFloor = floorFilter === 'all' || r.floor.toString() === floorFilter;

      return matchesSearch && matchesSharing && matchesStatus && matchesAc && matchesFloor;
    });
  }, [rooms, searchQuery, sharingFilter, statusFilter, acFilter, floorFilter]);

  const sharingOptions = [
    { value: 'all', label: 'All Sharing' },
    { value: '1', label: '1 (Single)' },
    { value: '2', label: '2 Sharing' },
    { value: '3', label: '3 Sharing' },
    { value: '4', label: '4 Sharing' },
    { value: '5', label: '5 Sharing' },
    { value: '6', label: '6 Sharing' },
    { value: '8', label: '8 Sharing' },
    { value: '10', label: '10 Sharing' },
  ];

  const getStatusBadge = (room: Room) => {
    switch (room.status) {
      case 'empty':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Vacant ({room.capacity} Free)
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {room.capacity - room.occupied} Bed Free
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
            Full (0 Free)
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
            <span className="material-symbols-outlined text-[12px]">build</span>
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-1.5">
      {/* Top Action & Stat Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">bed</span>
            <span className="text-[12px] font-black">{availableBeds} Available Beds</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-[12px] font-bold">{rooms.length} Rooms</span>
          </div>
        </div>

        <button
          onClick={onAddRoom}
          className="h-[36px] px-3.5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[12px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Room</span>
        </button>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col gap-2.5">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room # or resident..."
            className="w-full h-[38px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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

        {/* Sharing Filters Scrollable Pills */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {sharingOptions.map((opt) => {
              const active = sharingFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSharingFilter(opt.value)}
                  className={`h-[28px] px-2.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all select-none ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status, AC & Floor Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('vacant')}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                statusFilter === 'vacant' ? 'bg-sky-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Vacant
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                statusFilter === 'available' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter('full')}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                statusFilter === 'full' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                statusFilter === 'maintenance' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Maintenance
            </button>
          </div>

          {/* AC vs Non-AC */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setAcFilter('all')}
              className={`px-2 py-1 rounded-md font-bold ${
                acFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setAcFilter('AC')}
              className={`px-2 py-1 rounded-md font-bold ${
                acFilter === 'AC' ? 'bg-sky-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              AC
            </button>
            <button
              onClick={() => setAcFilter('Non-AC')}
              className={`px-2 py-1 rounded-md font-bold ${
                acFilter === 'Non-AC' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Non-AC
            </button>
          </div>

          {/* Floor */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="h-[28px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Floors</option>
            <option value="1">1st Floor</option>
            <option value="2">2nd Floor</option>
            <option value="3">3rd Floor</option>
            <option value="0">Ground Floor</option>
          </select>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRooms.map((room) => {
          const isFull = room.status === 'full';
          const isMaintenance = room.status === 'maintenance';
          const freeBeds = room.capacity - room.occupied;

          // Find active tenants in this room
          const roomTenants = tenants.filter((t) => t.isActive && Number(t.roomNumber) === Number(room.number));

          return (
            <div
              key={room.id}
              className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all flex flex-col justify-between gap-3 ${
                isMaintenance
                  ? 'border-rose-200 bg-rose-50/20'
                  : isFull
                  ? 'border-slate-200'
                  : 'border-emerald-200/90 hover:border-emerald-400'
              }`}
            >
              {/* Room Card Header */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">
                        Room {room.number}
                      </h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          room.type === 'AC'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {room.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Floor {room.floor}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[12px] font-extrabold text-[#0a332c]">
                        ₹{room.perBedRent.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-slate-500">/ bed / mo</span>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] font-bold text-slate-700">
                        {room.capacity === 1 ? 'Single Room' : `${room.capacity}-Sharing`}
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(room)}</div>
                </div>

                {/* Bed Allocation Visual Chips (B1, B2, B3, ...) */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>Bed Layout</span>
                    <span>{room.occupied}/{room.capacity} Occupied</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                    {Array.from({ length: room.capacity }).map((_, index) => {
                      const bedTag = `B${index + 1}`;
                      const tenantForBed = roomTenants.find((t) => t.bedNumber === bedTag) || (index < room.occupants.length ? { name: room.occupants[index] } : null);
                      const isOccupied = !!tenantForBed;

                      return (
                        <div
                          key={index}
                          className={`p-1.5 rounded-lg border text-center flex flex-col justify-center min-h-[44px] transition-all ${
                            isOccupied
                              ? 'bg-[#0a332c]/5 border-[#0a332c]/20 text-[#0a332c]'
                              : 'bg-white border-dashed border-emerald-300 text-emerald-700'
                          }`}
                        >
                          <span className="text-[10px] font-black leading-none block">{bedTag}</span>
                          <span className="text-[10px] font-bold truncate mt-0.5 leading-tight block">
                            {isOccupied ? tenantForBed.name.split(' ')[0] : 'Vacant'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Maintenance Warning */}
                {isMaintenance && room.maintenanceReason && (
                  <div className="mt-2.5 bg-rose-100/60 border border-rose-200 text-rose-900 p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-rose-700 shrink-0">warning</span>
                    <span>{room.maintenanceReason}</span>
                  </div>
                )}
              </div>

              {/* Room Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onEditRoom(room)}
                  className="h-[36px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[12px] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Config</span>
                </button>

                {freeBeds > 0 && !isMaintenance ? (
                  <button
                    onClick={() => onAddTenantToRoom(room.number)}
                    className="h-[36px] px-3.5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[12px] flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Admit ({freeBeds} Free)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectRoom(room)}
                    className="h-[36px] px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-[12px] flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0a332c] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">meeting_room</span>
          </div>
          <div>
            <h4 className="font-extrabold text-[16px] text-slate-800">
              {rooms.length === 0 ? 'No rooms added yet' : 'No rooms match your filter criteria'}
            </h4>
            <p className="text-[12px] text-slate-500 mt-0.5 max-w-sm">
              {rooms.length === 0
                ? 'Start setting up your PG by adding rooms one by one with sharing capacity and rent.'
                : 'Try clearing the search or changing the sharing capacity and status filters.'}
            </p>
          </div>
          {rooms.length === 0 ? (
            <button
              onClick={onAddRoom}
              className="mt-1 h-[40px] px-5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[13px] flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Your First Room</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSharingFilter('all');
                setStatusFilter('all');
                setAcFilter('all');
                setFloorFilter('all');
              }}
              className="text-[12px] font-bold text-[#0a332c] underline hover:text-[#0f4239]"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
