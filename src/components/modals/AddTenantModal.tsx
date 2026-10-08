import React, { useState, useEffect } from 'react';
import { Room, Tenant } from '../../types';
import { DocumentCameraCapture } from '../DocumentCameraCapture';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms?: Room[];
  onAddTenant: (tenant: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>) => void;
  defaultRoomNumber?: number;
}

const getTodayString = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getNextMonthSameDayString = (dateStr: string) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setMonth(date.getMonth() + 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    const nextD = String(date.getDate()).padStart(2, '0');
    return `${nextY}-${nextM}-${nextD}`;
  } catch {
    return dateStr;
  }
};

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  rooms = [],
  onAddTenant,
  defaultRoomNumber,
}) => {
  // Show only vacant rooms that have capacity and are not under maintenance
  const vacantRooms = rooms.filter(
    (r) => r.status !== 'full' && r.occupied < r.capacity && r.status !== 'maintenance'
  );

  // When opened from a specific room (e.g. "Admit" on Room 103), lock the
  // selector to that room so only it is shown and pre-selected.
  const lockedRoom =
    defaultRoomNumber !== undefined ? rooms.find((r) => r.number === defaultRoomNumber) : undefined;

  const initialRoom =
    lockedRoom ||
    rooms.find((r) => r.number === defaultRoomNumber && r.occupied < r.capacity) ||
    vacantRooms[0] ||
    rooms[0];

  // Rooms offered in the selector: only the locked room when opened from one
  const roomOptions = lockedRoom ? [lockedRoom] : vacantRooms;

  const todayStr = getTodayString();
  const nextMonthDueStr = getNextMonthSameDayString(todayStr);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState<number>(initialRoom?.number || 101);
  const [bedNumber, setBedNumber] = useState('B1');
  const [rentAmount, setRentAmount] = useState<number>(initialRoom?.perBedRent || 4500);
  const [securityDeposit, setSecurityDeposit] = useState<number>(initialRoom?.perBedRent || 4500);
  const [isDepositManuallyEdited, setIsDepositManuallyEdited] = useState(false);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextMonthDueStr);
  const [emergencyContact, setEmergencyContact] = useState('Parent / Supervisor');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Document collection state & Drive links
  const [documentsCollected, setDocumentsCollected] = useState(true);
  const [agreementCollected, setAgreementCollected] = useState(true);
  const [documentPhotoUrl, setDocumentPhotoUrl] = useState<string>('');
  const [termsDocumentUrl, setTermsDocumentUrl] = useState<string>('');
  
  // Document capture scanner drawers
  const [activeScanner, setActiveScanner] = useState<'id' | 'terms' | null>(null);
  const [editingLinkFor, setEditingLinkFor] = useState<'id' | 'terms' | null>(null);
  const [manualLinkInput, setManualLinkInput] = useState<string>('');

  // Reset/sync when modal opens
  useEffect(() => {
    if (isOpen) {
      const curToday = getTodayString();
      setCheckInDate(curToday);
      setDueDate(getNextMonthSameDayString(curToday));
      if (initialRoom) {
        setRoomNumber(initialRoom.number);
        setRentAmount(initialRoom.perBedRent);
        if (!isDepositManuallyEdited) {
          setSecurityDeposit(initialRoom.perBedRent);
        }
      }
    }
  }, [isOpen, initialRoom]);

  if (!isOpen) return null;

  const handleCheckInDateChange = (newDate: string) => {
    setCheckInDate(newDate);
    setDueDate(getNextMonthSameDayString(newDate));
  };

  const handleRoomChange = (selectedNum: number) => {
    setRoomNumber(selectedNum);
    const room = rooms.find((r) => r.number === selectedNum);
    if (room) {
      setRentAmount(room.perBedRent);
      if (!isDepositManuallyEdited) {
        setSecurityDeposit(room.perBedRent);
      }
    }
  };

  const handleRentChange = (val: number) => {
    setRentAmount(val);
    if (!isDepositManuallyEdited) {
      setSecurityDeposit(val);
    }
  };

  const handleDepositChange = (val: number) => {
    setIsDepositManuallyEdited(true);
    setSecurityDeposit(val);
  };

  const formatIndianPhone = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.startsWith('91') && raw.length > 10) {
      raw = raw.slice(2);
    } else if (raw.startsWith('0') && raw.length > 10) {
      raw = raw.slice(1);
    }
    if (raw.length > 10) {
      raw = raw.slice(0, 10);
    }
    if (raw.length > 5) {
      return `${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    return raw;
  };

  const cleanIndianPhoneForStorage = (val: string) => {
    const rawDigits = val.replace(/\D/g, '');
    if (!rawDigits) return '';
    const last10 = rawDigits.length > 10 && rawDigits.startsWith('91') ? rawDigits.slice(2) : rawDigits;
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const finalPhone = cleanIndianPhoneForStorage(phone);
    const finalEmergencyPhone = emergencyPhone.trim() ? cleanIndianPhoneForStorage(emergencyPhone) : finalPhone;

    onAddTenant({
      name: name.trim(),
      phone: finalPhone,
      email: email.trim() || undefined,
      roomNumber: Number(roomNumber),
      bedNumber: bedNumber.trim() || 'B1',
      rentAmount: Number(rentAmount),
      securityDeposit: Number(securityDeposit),
      dueDate,
      checkInDate,
      emergencyContact: emergencyContact.trim() || 'Parent / Guardian',
      emergencyPhone: finalEmergencyPhone,
      idProofType,
      idProofNumber: idProofNumber.trim() || 'Verified at check-in',
      notes: notes.trim() || undefined,
      documentsCollected,
      idDocumentCollected: documentsCollected,
      agreementCollected,
      documentPhotoUrl: documentPhotoUrl || undefined,
      termsDocumentUrl: termsDocumentUrl || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Fixed Header */}
        <div className="bg-[#0a332c] text-white p-3.5 sm:p-4 px-4 sm:px-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
            <div>
              <h3 className="text-[15px] sm:text-[16px] font-extrabold leading-tight">Admit New Resident</h3>
              <p className="text-[12px] text-emerald-100/80 font-medium">Add details & assign vacant room</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-3.5 text-[13px]">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bikash Thapa"
                className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Mobile Number * (10 Digits)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 px-2.5 bg-slate-100 border-r border-slate-300 rounded-l-xl flex items-center gap-1 text-slate-700 font-extrabold text-[13px] select-none pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatIndianPhone(e.target.value))}
                  placeholder="98451 11201"
                  maxLength={12}
                  className="w-full h-[46px] pl-[70px] pr-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
                />
              </div>
            </div>
          </div>

          {/* Room Assignment & Bed with Live Capacity Ratio (e.g., 3/4 or 1/2) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#0a332c]">meeting_room</span>
                Room & Bed Availability
              </span>
              {(() => {
                const currentRoomObj = rooms.find((r) => r.number === Number(roomNumber));
                if (!currentRoomObj) return null;
                const freeCount = Math.max(0, currentRoomObj.capacity - currentRoomObj.occupied);
                return (
                  <span className={`text-[12px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    freeCount > 0 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    <span>{currentRoomObj.occupied}/{currentRoomObj.capacity} Beds</span>
                    <span className="font-semibold">({freeCount} Available)</span>
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[12px] mb-1">
                  {lockedRoom ? 'Assigned Room (pre-selected)' : 'Select Room (Occupancy / Total) *'}
                </label>
                {rooms.length === 0 ? (
                  <div>
                    <input
                      type="number"
                      required
                      value={roomNumber || ''}
                      onChange={(e) => setRoomNumber(Number(e.target.value))}
                      placeholder="e.g. 101"
                      className="w-full h-[48px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <p className="text-[11px] text-emerald-800 font-medium mt-1">
                      💡 Enter room number directly, or create rooms in the <strong>Rooms</strong> tab.
                    </p>
                  </div>
                ) : roomOptions.length === 0 ? (
                  <div className="p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[12px] font-bold">
                    All registered rooms are currently full or in maintenance.
                  </div>
                ) : (
                  <select
                    value={roomNumber}
                    onChange={(e) => handleRoomChange(Number(e.target.value))}
                    disabled={!!lockedRoom}
                    className="w-full h-[48px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c] disabled:bg-slate-100 disabled:text-slate-600"
                  >
                    {roomOptions.map((r) => {
                      const freeBeds = r.capacity - r.occupied;
                      return (
                        <option 
                          key={r.id} 
                          value={r.number}
                        >
                          Room {r.number} — {r.occupied}/{r.capacity} Beds ({freeBeds} Available{r.type === 'AC' ? ' • AC' : ''} • ₹{r.perBedRent}/mo)
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[12px] mb-1">
                  Bed Tag / Slot *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. B1, B2, B3"
                    className="flex-1 h-[48px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
                  />
                  {(() => {
                    const currentRoomObj = rooms.find((r) => r.number === Number(roomNumber));
                    const nextBedIndex = (currentRoomObj?.occupied || 0) + 1;
                    return (
                      <button
                        type="button"
                        onClick={() => setBedNumber(`B${nextBedIndex}`)}
                        title="Auto-fill next available bed tag"
                        className="px-2.5 h-[48px] bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[12px] font-bold shrink-0 transition-colors"
                      >
                        Auto (B{nextBedIndex})
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Visual Bed Slot Availability Preview */}
            {(() => {
              const currentRoomObj = rooms.find((r) => r.number === Number(roomNumber));
              if (!currentRoomObj) return null;
              const total = currentRoomObj.capacity;
              const occupied = currentRoomObj.occupied;
              const slots = [];
              for (let i = 1; i <= total; i++) {
                const isBedOccupied = i <= occupied;
                const bedTag = `B${i}`;
                const isSelected = bedNumber.trim().toUpperCase() === bedTag;
                slots.push(
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!isBedOccupied) {
                        setBedNumber(bedTag);
                      }
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-bold text-[12px] transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#0a332c] text-white border-[#0a332c] ring-2 ring-emerald-500/30'
                        : isBedOccupied
                        ? 'bg-slate-200/80 text-slate-500 border-slate-300 cursor-not-allowed opacity-80'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        {isBedOccupied ? 'person' : 'single_bed'}
                      </span>
                      <span>{bedTag}</span>
                    </span>
                    <span className="text-[10px] font-semibold">
                      {isBedOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
                    </span>
                  </button>
                );
              }

              return (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold uppercase">
                    <span>Bed Slots in Room {currentRoomObj.number} ({occupied}/{total} Occupied):</span>
                    <span className="text-emerald-700 font-extrabold">{total - occupied} Bed(s) Free</span>
                  </div>
                  <div className="flex gap-2">
                    {slots}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Financials (Auto-Fill Security Deposit equal to Monthly Rent) */}
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0a332c]">
                Rent & Advance Settings
              </span>
              <span className="text-[11px] text-emerald-800 font-medium bg-emerald-100 px-2 py-0.5 rounded-md">
                Deposit equal to monthly rent
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[12px] mb-1">
                  Monthly Rent (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[13px]">₹</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={50}
                    value={rentAmount}
                    onChange={(e) => handleRentChange(Number(e.target.value))}
                    className="w-full h-[46px] pl-7 pr-3 border border-emerald-300 rounded-xl bg-white text-[#0a332c] font-black text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[12px] mb-1">
                  Advance / Deposit (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[13px]">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50}
                    value={securityDeposit}
                    onChange={(e) => handleDepositChange(Number(e.target.value))}
                    className="w-full h-[46px] pl-7 pr-3 border border-emerald-300 rounded-xl bg-white text-[#0a332c] font-bold text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0a332c]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates: Check-in date automatically today, rent due date next month same date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => handleCheckInDateChange(e.target.value)}
                className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Rent Due Date (Next Month)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Identity: Only Aadhaar and Passport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                ID Proof Type
              </label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                ID Proof Number
              </label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="e.g. Aadhaar or Passport #"
                className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Document Capture & Google Drive Integration */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#0a332c]">verified</span>
                Document Collection & Drive Organizer
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Auto-compressed • Organized folder
              </span>
            </div>

            {/* Checklist */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 flex-1 hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={documentsCollected}
                  onChange={(e) => setDocumentsCollected(e.target.checked)}
                  className="w-4 h-4 text-[#0a332c] rounded focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800 text-[12px]">
                  ID Document Collected
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 flex-1 hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={agreementCollected}
                  onChange={(e) => setAgreementCollected(e.target.checked)}
                  className="w-4 h-4 text-[#0a332c] rounded focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800 text-[12px]">
                  T&C Agreement Collected
                </span>
              </label>
            </div>

            {/* Document Capture Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* ID Proof Scanner Trigger */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">badge</span>
                    <span className="text-[12px] font-bold text-slate-800">{idProofType} Document</span>
                  </div>
                  {documentPhotoUrl ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check</span> {documentPhotoUrl.startsWith('data:image') ? 'Photo Attached' : 'Drive Linked'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDocumentPhotoUrl('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold"
                        title="Remove attached document"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLinkFor(editingLinkFor === 'id' ? null : 'id');
                        setManualLinkInput(documentPhotoUrl);
                      }}
                      className="text-[11px] text-blue-700 hover:underline font-bold"
                    >
                      Paste Drive Link
                    </button>
                  )}
                </div>

                {editingLinkFor === 'id' ? (
                  <div className="flex flex-col gap-1 mt-1 bg-blue-50/70 p-2 rounded border border-blue-200">
                    <label className="text-[11px] font-bold text-blue-900">Paste Google Drive / Document URL:</label>
                    <input
                      type="url"
                      value={manualLinkInput}
                      onChange={(e) => setManualLinkInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full text-[12px] px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                    />
                    <div className="flex items-center justify-end gap-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setEditingLinkFor(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold px-1.5 py-0.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentPhotoUrl(manualLinkInput.trim());
                          setEditingLinkFor(null);
                        }}
                        className="text-[11px] bg-blue-700 text-white font-bold px-2 py-0.5 rounded"
                      >
                        Save Link
                      </button>
                    </div>
                  </div>
                ) : documentPhotoUrl ? (
                  <div className="flex items-center justify-between text-[12px] text-slate-600 gap-1">
                    <a
                      href={documentPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 font-bold hover:underline truncate max-w-[130px]"
                    >
                      View on Google Drive
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLinkFor('id');
                          setManualLinkInput(documentPhotoUrl);
                        }}
                        className="text-[11px] text-blue-700 hover:underline font-bold"
                        title="Change Drive link"
                      >
                        Change Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScanner('id')}
                        className="text-slate-500 hover:text-slate-800 font-semibold text-[11px]"
                      >
                        Re-scan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveScanner('id')}
                      className="flex-1 h-[42px] bg-slate-100 hover:bg-emerald-50 hover:text-[#0a332c] text-slate-700 font-bold rounded-md flex items-center justify-center gap-1 text-[12px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                      <span>Scan / Upload {idProofType}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* T&C Agreement Scanner Trigger */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-indigo-700">description</span>
                    <span className="text-[12px] font-bold text-slate-800">T&C Agreement</span>
                  </div>
                  {termsDocumentUrl ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check</span> {termsDocumentUrl.startsWith('data:image') ? 'Photo Attached' : 'Drive Linked'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTermsDocumentUrl('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold"
                        title="Remove attached agreement"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLinkFor(editingLinkFor === 'terms' ? null : 'terms');
                        setManualLinkInput(termsDocumentUrl);
                      }}
                      className="text-[11px] text-indigo-700 hover:underline font-bold"
                    >
                      Paste Drive Link
                    </button>
                  )}
                </div>

                {editingLinkFor === 'terms' ? (
                  <div className="flex flex-col gap-1 mt-1 bg-indigo-50/70 p-2 rounded border border-indigo-200">
                    <label className="text-[11px] font-bold text-indigo-900">Paste Google Drive / Document URL:</label>
                    <input
                      type="url"
                      value={manualLinkInput}
                      onChange={(e) => setManualLinkInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full text-[12px] px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                    />
                    <div className="flex items-center justify-end gap-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setEditingLinkFor(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold px-1.5 py-0.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTermsDocumentUrl(manualLinkInput.trim());
                          setEditingLinkFor(null);
                        }}
                        className="text-[11px] bg-indigo-700 text-white font-bold px-2 py-0.5 rounded"
                      >
                        Save Link
                      </button>
                    </div>
                  </div>
                ) : termsDocumentUrl ? (
                  <div className="flex items-center justify-between text-[12px] text-slate-600 gap-1">
                    <a
                      href={termsDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 font-bold hover:underline truncate max-w-[130px]"
                    >
                      View on Google Drive
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLinkFor('terms');
                          setManualLinkInput(termsDocumentUrl);
                        }}
                        className="text-[11px] text-indigo-700 hover:underline font-bold"
                        title="Change Drive link"
                      >
                        Change Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScanner('terms')}
                        className="text-slate-500 hover:text-slate-800 font-semibold text-[11px]"
                      >
                        Re-scan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveScanner('terms')}
                      className="flex-1 h-[42px] bg-slate-100 hover:bg-emerald-50 hover:text-[#0a332c] text-slate-700 font-bold rounded-md flex items-center justify-center gap-1 text-[12px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                      <span>Scan / Upload T&C Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Scanner Inline Drawer */}
            {activeScanner && (
              <div className="mt-1">
                <DocumentCameraCapture
                  tenantName={name.trim() || 'New_Resident'}
                  roomNumber={Number(roomNumber)}
                  bedNumber={bedNumber}
                  docType={activeScanner === 'id' ? `ID Proof (${idProofType})` : 'Terms & Conditions Agreement'}
                  compact={true}
                  onUploaded={(url) => {
                    if (activeScanner === 'id') {
                      setDocumentPhotoUrl(url);
                      setDocumentsCollected(true);
                    } else {
                      setTermsDocumentUrl(url);
                      setAgreementCollected(true);
                    }
                    setActiveScanner(null);
                  }}
                  onClose={() => setActiveScanner(null)}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 text-[12px] mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Workplace or reference"
              className="w-full h-[46px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-[13px] focus:outline-none"
            />
          </div>
        </form>

        {/* Fixed Footer with Action Buttons */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-[13px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={roomOptions.length === 0}
            className="flex-1 h-[48px] bg-[#0a332c] hover:bg-[#0f4239] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-[14px]"
          >
            <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
            <span>Confirm Admission</span>
          </button>
        </div>
      </div>
    </div>
  );
};

