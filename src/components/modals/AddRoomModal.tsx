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
  const [number, setNumber] = useState<number>(nextRoomNumber);
  const [name, setName] = useState(`Room ${nextRoomNumber}`);
  const [capacity, setCapacity] = useState<number>(4);
  const [floor, setFloor] = useState<number>(1);
  const [type, setType] = useState<'AC' | 'Non-AC'>('AC');
  const [perBedRent, setPerBedRent] = useState<number>(3500);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRoom({
      number: Number(number),
      name: name.trim() || `Room ${number}`,
      capacity: Number(capacity),
      floor: Number(floor),
      type,
      perBedRent: Number(perBedRent),
      status: 'empty',
      amenities: type === 'AC' ? ['Attached Bath', 'Geyser', 'Balcony'] : ['Fan', 'Shared Bath', 'Cupboards'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#fcf9f8] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        <div className="bg-[#181818] text-white p-4 px-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E2FF00] text-[24px]">meeting_room</span>
            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Add New Room</h3>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Room Number *</label>
              <input
                type="number"
                required
                value={number}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setNumber(num);
                  setName(`Room ${num}`);
                }}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-black text-[16px] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Room Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Sharing Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold text-[12px] uppercase focus:outline-none focus:border-[#E2FF00]"
              >
                <option value={1} className="bg-[#1a1a1a] text-white">1-Bed (Private)</option>
                <option value={2} className="bg-[#1a1a1a] text-white">2-Sharing</option>
                <option value={3} className="bg-[#1a1a1a] text-white">3-Sharing</option>
                <option value={4} className="bg-[#1a1a1a] text-white">4-Sharing</option>
              </select>
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Floor</label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold text-[12px] uppercase focus:outline-none focus:border-[#E2FF00]"
              >
                <option value={1} className="bg-[#1a1a1a] text-white">1st Floor</option>
                <option value={2} className="bg-[#1a1a1a] text-white">2nd Floor</option>
                <option value={3} className="bg-[#1a1a1a] text-white">3rd Floor</option>
                <option value={4} className="bg-[#1a1a1a] text-white">4th Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Room Type</label>
              <div className="grid grid-cols-2 gap-1 bg-[#181818] p-1 rounded-xl border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setType('AC')}
                  className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
                    type === 'AC' ? 'bg-[#E2FF00] text-black shadow-[0_0_10px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  AC
                </button>
                <button
                  type="button"
                  onClick={() => setType('Non-AC')}
                  className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
                    type === 'Non-AC' ? 'bg-[#E2FF00] text-black shadow-[0_0_10px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Non-AC
                </button>
              </div>
            </div>

            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Rent / Bed (₹)</label>
              <input
                type="number"
                value={perBedRent}
                onChange={(e) => setPerBedRent(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-[#E2FF00] font-black text-[16px] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#333333] rounded-xl font-black uppercase text-[12px] tracking-wider text-[#888888] hover:text-white hover:bg-[#222222] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#E2FF00] text-black rounded-xl font-black uppercase text-[12px] tracking-wider hover:bg-[#d4f000] shadow-[0_0_15px_rgba(226,255,0,0.3)] transition-all"
            >
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
