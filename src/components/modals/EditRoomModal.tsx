import React, { useState } from 'react';
import { Room } from '../../types';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSaveRoom: (updatedRoom: Room) => void;
  onDeleteRoom?: (id: string) => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onSaveRoom,
  onDeleteRoom,
}) => {
  if (!isOpen || !room) return null;

  const [roomNumber, setRoomNumber] = useState<number>(room.number);
  const [name, setName] = useState<string>(room.name || `Room ${room.number}`);
  const [capacity, setCapacity] = useState<number>(room.capacity || 4);
  const [type, setType] = useState<'AC' | 'Non-AC'>(room.type);
  const [perBedRent, setPerBedRent] = useState<number>(room.perBedRent);
  const [floor, setFloor] = useState<number>(room.floor);
  const [status, setStatus] = useState(room.status);
  const [maintenanceReason, setMaintenanceReason] = useState(room.maintenanceReason || '');
  const [amenitiesText, setAmenitiesText] = useState((room.amenities || []).join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmenities = amenitiesText
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onSaveRoom({
      ...room,
      number: Number(roomNumber),
      name: name.trim() || `Room ${roomNumber}`,
      capacity: Number(capacity),
      type,
      perBedRent: Number(perBedRent),
      floor: Number(floor),
      status,
      maintenanceReason: status === 'maintenance' ? maintenanceReason : undefined,
      amenities: parsedAmenities,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a332c] text-white p-4 px-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold leading-tight">Edit Room {room.number}</h3>
              <p className="text-[11px] text-emerald-100/80 font-medium">
                Configure sharing capacity (1 to 10), rent & amenities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Room Number & Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Room Number *
              </label>
              <input
                type="number"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(Number(e.target.value))}
                className="w-full h-[40px] px-3.5 border border-slate-300 rounded-xl bg-white font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Display Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Room 101"
                className="w-full h-[40px] px-3.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Sharing Capacity (1 to 10), Floor & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Capacity (Beds) *
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full h-[40px] px-2.5 border border-slate-300 rounded-xl bg-white text-[#0a332c] font-black text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Bed' : `Beds (${num})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Floor
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full h-[40px] px-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none"
              >
                <option value={0}>Ground Floor</option>
                <option value={1}>1st Floor</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
                <option value={4}>4th Floor</option>
                <option value={5}>5th Floor</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Cooling Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'AC' | 'Non-AC')}
                className="w-full h-[40px] px-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none"
              >
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
          </div>

          {/* Rent per bed */}
          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Monthly Rent Per Bed (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min={500}
                step={50}
                value={perBedRent}
                onChange={(e) => setPerBedRent(Number(e.target.value))}
                className="w-full h-[40px] pl-8 pr-3 border border-emerald-300 rounded-xl bg-white font-black text-[16px] text-[#0a332c] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Status & Maintenance */}
          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none"
            >
              <option value="empty">Empty (Vacant)</option>
              <option value="partial">Partial (Some Beds Available)</option>
              <option value="full">Full (All Beds Occupied)</option>
              <option value="maintenance">Under Maintenance / Repairs</option>
            </select>
          </div>

          {status === 'maintenance' && (
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Maintenance Reason
              </label>
              <input
                type="text"
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="e.g. Washroom tap repair & whitewash"
                className="w-full h-[38px] px-3 border border-amber-300 rounded-xl bg-amber-50/50 text-slate-900 font-medium focus:outline-none"
              />
            </div>
          )}

          {/* Amenities */}
          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="e.g. Attached Bath, Balcony, Geyser, Study Desk"
              className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-[12px] focus:outline-none"
            />
          </div>

          {/* Current Occupants */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Current Occupancy ({room.occupied}/{capacity} Beds Occupied)
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {room.occupants.map((occ, i) => (
                <span
                  key={i}
                  className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800"
                >
                  B{i + 1}: {occ}
                </span>
              ))}
              {room.occupants.length === 0 && (
                <span className="text-[11px] text-slate-400 italic">No occupants currently</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-200">
            {onDeleteRoom && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete Room ${room.number}?`)) {
                    onDeleteRoom(room.id);
                    onClose();
                  }
                }}
                className="h-[44px] px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[12px] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 text-[13px]"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
