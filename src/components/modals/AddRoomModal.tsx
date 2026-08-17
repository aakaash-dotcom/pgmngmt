import React, { useState } from 'react';
import { Room } from '../../types';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (room: Omit<Room, 'id' | 'occupied' | 'occupants'>) => void;
  nextRoomNumber: number;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onAddRoom,
  nextRoomNumber,
}) => {
  const [number, setNumber] = useState<number>(nextRoomNumber || 101);
  const [name, setName] = useState(`Room ${nextRoomNumber || 101}`);
  const [capacity, setCapacity] = useState<number>(4);
  const [floor, setFloor] = useState<number>(1);
  const [type, setType] = useState<'AC' | 'Non-AC'>('AC');
  const [perBedRent, setPerBedRent] = useState<number>(4500);
  const [amenitiesStr, setAmenitiesStr] = useState('Attached Bath, Geyser, Cupboards, Balcony');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amenities = amenitiesStr
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onAddRoom({
      number: Number(number),
      name: name.trim() || `Room ${number}`,
      capacity: Number(capacity),
      floor: Number(floor),
      type,
      perBedRent: Number(perBedRent),
      status: 'empty',
      amenities: amenities.length > 0 ? amenities : type === 'AC' ? ['Attached Bath', 'Geyser'] : ['Fan', 'Cupboards'],
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
              <h3 className="text-[17px] font-extrabold leading-tight">Add New PG Room</h3>
              <p className="text-[11px] text-emerald-100/80 font-medium">Create room with custom capacity (1-10) & rent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Room Number *
              </label>
              <input
                type="number"
                required
                value={number}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setNumber(num);
                  if (!name || name.startsWith('Room')) {
                    setName(`Room ${num}`);
                  }
                }}
                className="w-full h-[40px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-extrabold text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
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
                className="w-full h-[40px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Sharing Capacity (Beds) *
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-[#0a332c] font-black text-[15px] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Bed (Single)' : `${num}-Sharing (${num} Beds)`}
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
                className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
              >
                <option value={0}>Ground Floor</option>
                <option value={1}>1st Floor</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
                <option value={4}>4th Floor</option>
                <option value={5}>5th Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Cooling Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'AC' | 'Non-AC')}
                className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none"
              >
                <option value="AC">AC Room</option>
                <option value="Non-AC">Non-AC Room</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                Rent / Bed (₹) *
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
                  className="w-full h-[40px] pl-8 pr-3 border border-emerald-300 rounded-xl bg-white text-[#0a332c] font-black text-[16px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[11px] mb-1">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              placeholder="Attached Bath, Geyser, Cupboards, Balcony"
              className="w-full h-[40px] px-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-[12px] focus:outline-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-200">
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
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
