import React, { useState } from 'react';
import { Room, Tenant } from '../../types';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  rooms: Room[];
  selectedRoomNumber?: number;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onAddTenant,
  rooms,
  selectedRoomNumber,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState<number>(
    selectedRoomNumber || rooms[0]?.number || 101
  );
  const [bedNumber, setBedNumber] = useState('B1');
  const [rentAmount, setRentAmount] = useState<number>(3500);
  const [securityDeposit, setSecurityDeposit] = useState<number>(7000);
  const [checkInDate, setCheckInDate] = useState('2026-08-14');
  const [dueDate, setDueDate] = useState('2026-09-05');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter tenant name and phone number.');
      return;
    }

    onAddTenant({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      roomNumber: Number(roomNumber),
      bedNumber,
      rentAmount: Number(rentAmount),
      securityDeposit: Number(securityDeposit),
      status: 'Paid', // initial state
      balance: 0,
      dueDate,
      lastPaidDate: checkInDate,
      checkInDate,
      emergencyContact: emergencyContact.trim() || 'Parent/Guardian',
      emergencyPhone: emergencyPhone.trim() || phone.trim(),
      idProofType,
      idProofNumber: idProofNumber.trim() || 'VERIFIED-DOC',
      isActive: true,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#121212] border border-[#262626] w-full max-w-lg rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#181818] text-white p-4 px-5 flex justify-between items-center border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E2FF00] text-[24px]">person_add</span>
            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Add New Tenant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-xl hover:bg-[#262626] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Personal Info */}
          <div>
            <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohit Deshmukh"
              className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@example.com"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          {/* Room and Bed Selection */}
          <div className="grid grid-cols-2 gap-3 bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Assign Room</label>
              <select
                value={roomNumber}
                onChange={(e) => {
                  const rNum = Number(e.target.value);
                  setRoomNumber(rNum);
                  const room = rooms.find((r) => r.number === rNum);
                  if (room) {
                    setRentAmount(room.perBedRent);
                    setSecurityDeposit(room.perBedRent * 2);
                  }
                }}
                className="w-full h-[44px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-black uppercase text-[12px] focus:outline-none focus:border-[#E2FF00]"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.number} className="bg-[#1a1a1a] text-white">
                    Room {r.number} ({r.occupied}/{r.capacity}) - ₹{r.perBedRent}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Bed Slot</label>
              <select
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                className="w-full h-[44px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-black uppercase text-[12px] focus:outline-none focus:border-[#E2FF00]"
              >
                <option value="B1" className="bg-[#1a1a1a] text-white">Bed 1 (B1)</option>
                <option value="B2" className="bg-[#1a1a1a] text-white">Bed 2 (B2)</option>
                <option value="B3" className="bg-[#1a1a1a] text-white">Bed 3 (B3)</option>
                <option value="B4" className="bg-[#1a1a1a] text-white">Bed 4 (B4)</option>
              </select>
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Monthly Rent (₹)</label>
              <input
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-[#E2FF00] font-black text-[16px] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Security Deposit (₹)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-black text-[16px] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Check-In Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Next Rent Due</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name (Relationship)"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Emergency Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          {/* ID Proof */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">ID Proof Type</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full h-[44px] px-3 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold text-[12px] focus:outline-none focus:border-[#E2FF00]"
              >
                <option value="Aadhaar Card" className="bg-[#1a1a1a] text-white">Aadhaar Card</option>
                <option value="PAN Card" className="bg-[#1a1a1a] text-white">PAN Card</option>
                <option value="Driving License" className="bg-[#1a1a1a] text-white">Driving License</option>
                <option value="Passport" className="bg-[#1a1a1a] text-white">Passport</option>
                <option value="College ID" className="bg-[#1a1a1a] text-white">College ID</option>
              </select>
            </div>
            <div>
              <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">ID Number</label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="XXXX-XXXX-1234"
                className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-[#888888] uppercase tracking-wider mb-1.5">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian, works night shifts"
              className="w-full h-[44px] px-3.5 border border-[#333333] rounded-xl bg-[#1a1a1a] text-white font-bold placeholder-[#555555] focus:outline-none focus:border-[#E2FF00]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 mt-2 border-t border-[#262626]">
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
              Add Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

