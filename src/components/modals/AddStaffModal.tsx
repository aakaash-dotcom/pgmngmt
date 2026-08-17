import React, { useState, useEffect } from 'react';
import { StaffContact, StaffRole } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Omit<StaffContact, 'id'>, editId?: string) => void;
  initialStaff?: StaffContact | null;
}

const STAFF_ROLES: StaffRole[] = [
  'Cleaner / Housekeeping',
  'Electrician',
  'Plumber',
  'Water Tanker Supplier',
  'Caretaker / Security',
  'Internet / Wi-Fi Technician',
  'Cook / Kitchen',
  'Carpenter / Repairs',
  'Painter',
  'Waste Collector',
  'Other Service',
];

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStaff,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Cleaner / Housekeeping');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (initialStaff) {
      setName(initialStaff.name);
      setRole(initialStaff.role);
      setPhone(initialStaff.phone);
      setAlternatePhone(initialStaff.alternatePhone || '');
      setNotes(initialStaff.notes || '');
      setIsAvailable(initialStaff.isAvailable ?? true);
    } else {
      setName('');
      setRole('Cleaner / Housekeeping');
      setPhone('');
      setAlternatePhone('');
      setNotes('');
      setIsAvailable(true);
    }
  }, [initialStaff, isOpen]);

  if (!isOpen) return null;

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

    onSave(
      {
        name: name.trim(),
        role,
        phone: cleanIndianPhoneForStorage(phone),
        alternatePhone: alternatePhone.trim() ? cleanIndianPhoneForStorage(alternatePhone) : undefined,
        notes: notes.trim() || undefined,
        isAvailable,
      },
      initialStaff?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="font-extrabold text-[17px] text-slate-900 leading-tight">
              {initialStaff ? 'Edit Staff / Vendor Contact' : 'Add Staff or Service Vendor'}
            </h3>
            <p className="text-[12px] text-slate-500 font-medium">
              Save phone numbers for cleaners, electricians, water tanker & repairs
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1 text-[13px]">
          <div>
            <label className="block font-bold text-slate-700 text-[12px] mb-1">
              Contact / Worker Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lakshmi (Daily Cleaning) or Ramesh Electrician"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[42px] px-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[12px] mb-1">
              Role / Service Category *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full h-[42px] px-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white font-medium text-slate-800"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Primary Phone Number * (10 Digits)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 px-2.5 bg-slate-100 border-r border-slate-300 rounded-l-xl flex items-center gap-1 text-slate-700 font-extrabold text-[12px] select-none pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="98450 11223"
                  maxLength={12}
                  value={phone.replace(/^\+91\s*/, '')}
                  onChange={(e) => setPhone(formatIndianPhone(e.target.value))}
                  className="w-full h-[42px] pl-[70px] pr-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Alternate Phone (Optional)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 px-2.5 bg-slate-100 border-r border-slate-300 rounded-l-xl flex items-center gap-1 text-slate-700 font-extrabold text-[12px] select-none pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="98450 99887"
                  maxLength={12}
                  value={alternatePhone.replace(/^\+91\s*/, '')}
                  onChange={(e) => setAlternatePhone(formatIndianPhone(e.target.value))}
                  className="w-full h-[42px] pl-[70px] pr-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-[12px] mb-1">
              Duty Timings, Pricing or Special Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Cleans floors 1 & 2 daily at 9:30 AM. ₹950 per tanker load..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isAvailable" className="text-[13px] font-semibold text-slate-700 cursor-pointer">
              Mark as Active / Currently On-Duty
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-4 border-t border-slate-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold transition-all shadow-xs"
            >
              {initialStaff ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
