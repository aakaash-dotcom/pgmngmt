import React, { useState } from 'react';
import { Room } from '../types';

interface RoomsScreenProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onAddRoom: () => void;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  rooms,
  onSelectRoom,
  onAddRoom: _onAddRoom,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'full' | 'partial' | 'vacant' | 'maintenance'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredRooms = rooms.filter((room) => {
    if (filterMode === 'full' && room.status !== 'full') return false;
    if (filterMode === 'partial' && room.status !== 'partial') return false;
    if (filterMode === 'vacant' && (room.status !== 'empty' || room.occupied > 0)) return false;
    if (filterMode === 'maintenance' && room.status !== 'maintenance') return false;
    if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-2 pb-16">
      {/* Page Header */}
      <div className="flex justify-between items-end py-4 mb-2">
        <div>
          <h1 className="text-[32px] font-black text-white uppercase tracking-tight leading-tight">
            Rooms
          </h1>
          <p className="text-[14px] font-bold text-[#888888] uppercase tracking-wider mt-0.5">
            Manage occupancy & status
          </p>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            id="btn-room-filter-toggle"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="h-[44px] px-4 border border-[#333333] bg-[#141414] rounded-xl flex items-center gap-2 text-white hover:border-[#E2FF00] active:scale-95 transition-all shadow-md font-bold text-[13px] uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[20px] text-[#E2FF00]">filter_list</span>
            <span>Filter</span>
            {filterMode !== 'all' && (
              <span className="w-2 h-2 rounded-full bg-[#E2FF00] shadow-[0_0_8px_#E2FF00]" />
            )}
          </button>

          {/* Filter Dropdown Popover */}
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-[#141414] border border-[#333333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] rounded-2xl p-3.5 z-30 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
              <span className="text-[11px] font-black text-[#E2FF00] uppercase tracking-widest px-1">
                Status Filter
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setFilterMode('all');
                    setShowFilterMenu(false);
                  }}
                  className={`px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider rounded-lg text-left transition-colors ${
                    filterMode === 'all'
                      ? 'bg-[#E2FF00] text-black shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                      : 'bg-[#1f1f1f] text-[#888888] hover:text-white'
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => {
                    setFilterMode('full');
                    setShowFilterMenu(false);
                  }}
                  className={`px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider rounded-lg text-left transition-colors ${
                    filterMode === 'full'
                      ? 'bg-[#E2FF00] text-black shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                      : 'bg-[#1f1f1f] text-[#888888] hover:text-white'
                  }`}
                >
                  Full (4/4)
                </button>
                <button
                  onClick={() => {
                    setFilterMode('partial');
                    setShowFilterMenu(false);
                  }}
                  className={`px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider rounded-lg text-left transition-colors ${
                    filterMode === 'partial'
                      ? 'bg-[#ffaa00] text-black'
                      : 'bg-[#1f1f1f] text-[#888888] hover:text-white'
                  }`}
                >
                  Partial
                </button>
                <button
                  onClick={() => {
                    setFilterMode('vacant');
                    setShowFilterMenu(false);
                  }}
                  className={`px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider rounded-lg text-left transition-colors ${
                    filterMode === 'vacant'
                      ? 'bg-[#ff3b30] text-white'
                      : 'bg-[#1f1f1f] text-[#888888] hover:text-white'
                  }`}
                >
                  Vacant (0/4)
                </button>
                <button
                  onClick={() => {
                    setFilterMode('maintenance');
                    setShowFilterMenu(false);
                  }}
                  className={`px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider rounded-lg text-left col-span-2 transition-colors ${
                    filterMode === 'maintenance'
                      ? 'bg-[#333333] text-[#E2FF00] border border-[#E2FF00]/40'
                      : 'bg-[#1f1f1f] text-[#888888] hover:text-white'
                  }`}
                >
                  🔧 Under Repair
                </button>
              </div>

              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <span className="text-[11px] font-black text-[#888888] uppercase tracking-widest">Floor</span>
                <div className="flex gap-1">
                  {['all', 1, 2, 3].map((fl) => (
                    <button
                      key={String(fl)}
                      onClick={() => setFloorFilter(fl as any)}
                      className={`px-2 py-0.5 text-[11px] font-black uppercase rounded ${
                        floorFilter === fl
                          ? 'bg-[#E2FF00] text-black'
                          : 'bg-[#222222] text-[#888888] hover:text-white'
                      }`}
                    >
                      {fl === 'all' ? 'All' : `F${fl}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Chips Bar (Quick toggle) */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
            filterMode === 'all'
              ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_15px_rgba(226,255,0,0.3)]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          All ({rooms.length})
        </button>
        <button
          onClick={() => setFilterMode('full')}
          className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
            filterMode === 'full'
              ? 'bg-[#E2FF00] text-black border-[#E2FF00] shadow-[0_0_15px_rgba(226,255,0,0.3)]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Full ({rooms.filter((r) => r.status === 'full').length})
        </button>
        <button
          onClick={() => setFilterMode('partial')}
          className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
            filterMode === 'partial'
              ? 'bg-[#ffaa00] text-black border-[#ffaa00]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Partial ({rooms.filter((r) => r.status === 'partial').length})
        </button>
        <button
          onClick={() => setFilterMode('vacant')}
          className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
            filterMode === 'vacant'
              ? 'bg-[#ff3b30] text-white border-[#ff3b30]'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Vacant ({rooms.filter((r) => r.status === 'empty').length})
        </button>
        <button
          onClick={() => setFilterMode('maintenance')}
          className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
            filterMode === 'maintenance'
              ? 'bg-[#333333] text-[#E2FF00] border-[#E2FF00]/40'
              : 'bg-[#141414] border-[#262626] text-[#888888] hover:text-white'
          }`}
        >
          Repair ({rooms.filter((r) => r.status === 'maintenance').length})
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredRooms.map((room) => {
          let statusStripClass = 'bg-[#E2FF00]';
          let chipClass = 'bg-[#E2FF00] text-black';
          let isMaintenance = room.status === 'maintenance';
          let isVacant = room.occupied === 0 && !isMaintenance;

          if (room.status === 'full') {
            statusStripClass = 'bg-[#E2FF00]';
            chipClass = 'bg-[#E2FF00] text-black font-black';
          } else if (room.status === 'partial') {
            statusStripClass = 'bg-[#ffaa00]';
            chipClass = 'bg-[#ffaa00] text-black font-black';
          } else if (isVacant) {
            statusStripClass = 'bg-[#ff3b30]';
            chipClass = 'bg-[#ff3b30] text-white font-black';
          } else if (isMaintenance) {
            statusStripClass = 'bg-[#888888]';
            chipClass = 'bg-[#262626] text-[#aaaaaa] font-black border border-[#3a3a3a]';
          }

          const occupantsText =
            isMaintenance
              ? room.maintenanceReason || 'Plumbing repair'
              : room.occupants && room.occupants.length > 0
              ? room.occupants.join(', ')
              : 'Vacant';

          return (
            <article
              key={room.id}
              id={`room-card-${room.number}`}
              onClick={() => onSelectRoom(room)}
              className={`relative bg-[#121212] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#262626] overflow-hidden flex flex-col min-h-[110px] hover:border-[#E2FF00] transition-all cursor-pointer select-none active:scale-[0.99] group ${
                isMaintenance ? 'bg-[#0f0f0f]' : ''
              }`}
            >
              {/* Left Color Strip (4px) */}
              <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${statusStripClass}`} />

              <div className="p-4 pl-5 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-black text-white uppercase tracking-tight group-hover:text-[#E2FF00] transition-colors">
                      {room.name || `Room ${room.number}`}
                    </h2>
                    {room.type && (
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#888888] border border-[#333333]">
                        {room.type}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${chipClass}`}
                  >
                    {isMaintenance && (
                      <span className="material-symbols-outlined text-[13px]">build</span>
                    )}
                    {room.occupied}/{room.capacity}
                  </span>
                </div>

                <div className="text-[14px] text-[#888888] flex items-center justify-between">
                  <span
                    className={`line-clamp-1 flex-1 pr-2 ${
                      isVacant || isMaintenance ? 'italic opacity-70' : 'text-[#cccccc] font-medium'
                    }`}
                  >
                    {occupantsText}
                  </span>
                  <span className="material-symbols-outlined text-[#666666] group-hover:text-[#E2FF00] text-[20px] shrink-0 transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-[#121212] rounded-2xl border border-[#262626] my-4 p-6">
          <span className="material-symbols-outlined text-[48px] text-[#888888] mb-2">
            bed
          </span>
          <h3 className="text-[18px] font-black text-white uppercase tracking-wider">No rooms match this filter</h3>
          <p className="text-[13px] text-[#888888] mt-1 font-medium">Try switching to 'All' or clearing filters.</p>
          <button
            onClick={() => {
              setFilterMode('all');
              setFloorFilter('all');
            }}
            className="mt-4 px-5 py-2.5 bg-[#E2FF00] text-black font-black uppercase text-[13px] tracking-wider rounded-xl hover:bg-[#d4f000]"
          >
            Show All Rooms
          </button>
        </div>
      )}
    </div>
  );
};

