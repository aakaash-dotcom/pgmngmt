import React, { useState } from 'react';
import { Room, Tenant } from '../../types';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  tenants?: Tenant[];
  onAddTenantToRoom: (roomNumber: number) => void;
  onToggleMaintenance: (roomId: string, isMaintenance: boolean, reason?: string) => void;
  onSelectTenant: (tenant: Tenant) => void;
  onEditRoom: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  isOpen,
  onClose,
  room,
  tenants = [],
  onAddTenantToRoom,
  onToggleMaintenance,
  onSelectTenant,
  onEditRoom,
}) => {
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState(room?.maintenanceReason || 'Bathroom plumbing repair');

  if (!isOpen || !room) return null;

  const roomTenants = tenants.filter(
    (t) => t.isActive && Number(t.roomNumber) === Number(room.number)
  );

  const isMaintenance = room.status === 'maintenance';
  const vacantBeds = Math.max(0, room.capacity - (isMaintenance ? 0 : room.occupied));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 px-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-extrabold text-[20px]">
              {room.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-extrabold text-slate-900 leading-tight">
                  {room.name || `Room ${room.number}`}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Floor {room.floor} • {room.type}
                </span>
              </div>
              <p className="text-[13px] text-slate-500 font-semibold mt-0.5">
                {room.capacity}-Sharing • <span className="text-blue-700 font-bold">₹{room.perBedRent.toLocaleString('en-IN')}</span> / bed / month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEditRoom(room);
              }}
              title="Edit Room Price & Capacity"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 rounded-xl text-[12px] font-bold shadow-2xs flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
              <span>Edit Room</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Occupancy Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">
                Occupancy & Bed Status
              </span>
              <div className="text-[18px] font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-2">
                <span>{isMaintenance ? 'Under Maintenance' : `${room.occupied} / ${room.capacity} Beds Filled`}</span>
                {!isMaintenance && (
                  <span className="text-[12px] font-semibold text-slate-500">
                    ({vacantBeds} {vacantBeds === 1 ? 'bed vacant' : 'beds vacant'})
                  </span>
                )}
              </div>
            </div>

            <span
              className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                room.status === 'full'
                  ? 'bg-blue-100 text-blue-800'
                  : room.status === 'partial'
                  ? 'bg-amber-100 text-amber-900'
                  : isMaintenance
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {room.status === 'full'
                ? 'Full (All Beds Occupied)'
                : room.status === 'partial'
                ? 'Partially Filled'
                : isMaintenance
                ? 'Maintenance'
                : 'Vacant (All Empty)'}
            </span>
          </div>

          {/* Occupants List */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
                Current Tenants ({room.occupants.length})
              </span>
              {!isMaintenance && room.occupied < room.capacity && (
                <button
                  onClick={() => {
                    onClose();
                    onAddTenantToRoom(room.number);
                  }}
                  className="text-[12px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Admit Tenant</span>
                </button>
              )}
            </div>

            {room.occupants.length > 0 ? (
              <div className="flex flex-col gap-2 pt-1">
                {room.occupants.map((occName, idx) => {
                  const tenantMatch = roomTenants.find((t) =>
                    t.name.toLowerCase().includes(occName.toLowerCase())
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (tenantMatch) {
                          onClose();
                          onSelectTenant(tenantMatch);
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 text-[13px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[14px] group-hover:text-blue-700 transition-colors">
                            {occName} {tenantMatch ? `(${tenantMatch.name})` : ''}
                          </div>
                          {tenantMatch && (
                            <div className="text-[12px] text-slate-500 font-medium flex items-center gap-2">
                              <span>Bed {tenantMatch.bedNumber || `B${idx + 1}`}</span>
                              <span>•</span>
                              <span>{tenantMatch.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tenantMatch && (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              tenantMatch.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tenantMatch.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tenantMatch.status}
                          </span>
                        )}
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[20px]">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 italic py-2">
                {isMaintenance
                  ? `Maintenance reason: ${room.maintenanceReason || 'Work underway'}`
                  : 'All beds are currently vacant in this room.'}
              </p>
            )}
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Room Amenities & Facilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-[12px] bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-semibold shadow-2xs"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance toggle */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600 text-[20px]">build</span>
                <span className="font-bold text-slate-800 text-[13px]">
                  Room Maintenance Status
                </span>
              </div>
              <button
                onClick={() => {
                  if (isMaintenance) {
                    onToggleMaintenance(room.id, false);
                  } else {
                    setIsEditingMaintenance(true);
                  }
                }}
                className={`text-[12px] font-bold px-3 py-1 rounded-lg transition-colors ${
                  isMaintenance
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {isMaintenance ? 'Mark as Repaired / Ready' : 'Put Under Repair'}
              </button>
            </div>

            {isEditingMaintenance && !isMaintenance && (
              <div className="pt-2 flex flex-col gap-2">
                <input
                  type="text"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  placeholder="Reason (e.g. Geyser replacement, whitewash)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <button
                  onClick={() => {
                    onToggleMaintenance(room.id, true, maintenanceReason);
                    setIsEditingMaintenance(false);
                  }}
                  className="py-2 bg-amber-600 text-white rounded-xl text-[12px] font-bold hover:bg-amber-700 transition-colors"
                >
                  Confirm Maintenance Mode
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onEditRoom(room);
            }}
            className="text-blue-700 font-bold text-[13px] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Configure Price / Capacity</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
