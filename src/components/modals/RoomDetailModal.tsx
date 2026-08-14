import React, { useState } from 'react';
import { Room, Tenant } from '../../types';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  tenants: Tenant[];
  onAddTenantToRoom: (roomNumber: number) => void;
  onToggleMaintenance: (roomId: string, isMaintenance: boolean, reason?: string) => void;
  onSelectTenant: (tenant: Tenant) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  isOpen,
  onClose,
  room,
  tenants,
  onAddTenantToRoom,
  onToggleMaintenance,
  onSelectTenant,
}) => {
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState(room?.maintenanceReason || 'Plumbing repair');

  if (!isOpen || !room) return null;

  const roomTenants = tenants.filter(
    (t) => t.isActive && Number(t.roomNumber) === Number(room.number)
  );

  const isMaintenance = room.status === 'maintenance';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#181818] text-white p-5 flex justify-between items-start border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[22px] font-black text-white uppercase tracking-tight">
                {room.name || `Room ${room.number}`}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#262626] text-[#E2FF00] border border-[#333333]">
                Floor {room.floor} • {room.type}
              </span>
            </div>
            <p className="text-[12px] text-[#888888] font-bold mt-0.5">
              {room.capacity}-Sharing • ₹{room.perBedRent} / bed / month
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Occupancy Status Card */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-[#888888] uppercase font-black tracking-wider block">Current Occupancy</span>
              <span className="text-[20px] font-black text-white">
                {isMaintenance ? 'Under Maintenance' : `${room.occupied} / ${room.capacity} Beds Occupied`}
              </span>
            </div>
            <span
              className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${
                room.status === 'full'
                  ? 'bg-[#E2FF00] text-black shadow-[0_0_10px_rgba(226,255,0,0.3)]'
                  : room.status === 'partial'
                  ? 'bg-[#ffffff] text-black'
                  : isMaintenance
                  ? 'bg-[#333333] text-[#aaaaaa]'
                  : 'bg-[#ff3b30] text-white'
              }`}
            >
              {room.status.toUpperCase()}
            </span>
          </div>

          {/* Occupants list */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-black text-[#888888] uppercase tracking-wider">
                Occupants ({room.occupants.length})
              </span>
              {!isMaintenance && room.occupied < room.capacity && (
                <button
                  onClick={() => {
                    onClose();
                    onAddTenantToRoom(room.number);
                  }}
                  className="text-[11px] text-[#E2FF00] font-black uppercase hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Tenant
                </button>
              )}
            </div>

            {room.occupants.length > 0 ? (
              <div className="flex flex-col gap-2">
                {room.occupants.map((occName, idx) => {
                  const tenantMatch = roomTenants.find((t) => t.name.toLowerCase().includes(occName.toLowerCase()));
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (tenantMatch) {
                          onClose();
                          onSelectTenant(tenantMatch);
                        }
                      }}
                      className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between hover:bg-[#202020] hover:border-[#333333] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-[#262626] text-[#E2FF00] text-[12px] font-black flex items-center justify-center border border-[#333333]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white uppercase text-[13px]">{occName}</div>
                          {tenantMatch && (
                            <div className="text-[11px] text-[#888888]">{tenantMatch.phone}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tenantMatch && (
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              tenantMatch.status === 'Paid'
                                ? 'bg-[#E2FF00] text-black'
                                : 'bg-[#ff3b30] text-white'
                            }`}
                          >
                            {tenantMatch.status}
                          </span>
                        )}
                        <span className="material-symbols-outlined text-[#888888] text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#888888] italic py-2">
                {isMaintenance ? `Reason: ${room.maintenanceReason}` : 'No occupants currently in this room.'}
              </p>
            )}
          </div>

          {/* Amenities in room */}
          {room.amenities && (
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[11px] font-black text-[#888888] uppercase tracking-wider block mb-2">Room Amenities</span>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity, i) => (
                  <span key={i} className="text-[11px] bg-[#222222] border border-[#333333] text-white px-2.5 py-1 rounded-md font-bold uppercase">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance toggle */}
          <div className="bg-[#181818] p-4 rounded-xl border border-[#262626] flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E2FF00] text-[20px]">build</span>
                <span className="font-black text-white uppercase text-[12px] tracking-wider">Maintenance Status</span>
              </div>
              <button
                onClick={() => {
                  if (isMaintenance) {
                    onToggleMaintenance(room.id, false);
                  } else {
                    setIsEditingMaintenance(true);
                  }
                }}
                className={`text-[11px] font-black uppercase px-3 py-1 rounded-lg transition-colors ${
                  isMaintenance
                    ? 'bg-[#E2FF00] text-black hover:bg-[#d4f000]'
                    : 'bg-[#ff3b30] text-white hover:bg-[#d32f2f]'
                }`}
              >
                {isMaintenance ? 'Clear Maintenance' : 'Put on Maint'}
              </button>
            </div>

            {isEditingMaintenance && !isMaintenance && (
              <div className="pt-2 flex flex-col gap-2">
                <input
                  type="text"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  placeholder="Reason (e.g. AC Repair / Plumbing)"
                  className="w-full px-3 py-2 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white text-[13px] font-bold focus:outline-none focus:border-[#E2FF00]"
                />
                <button
                  onClick={() => {
                    onToggleMaintenance(room.id, true, maintenanceReason);
                    setIsEditingMaintenance(false);
                  }}
                  className="py-2 bg-[#E2FF00] text-black rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#d4f000]"
                >
                  Save Maintenance State
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181818] border-t border-[#262626]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#E2FF00] text-black font-black uppercase text-[12px] tracking-wider rounded-xl hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
