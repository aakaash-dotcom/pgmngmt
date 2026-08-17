import React, { useState } from 'react';
import { BulkGroup, Room, Tenant } from '../../types';
import { OWNER_PHONE, OWNER_UPI_ID, PG_NAME } from '../../data/initialData';

interface BulkGroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkGroups?: BulkGroup[];
  tenants?: Tenant[];
  rooms?: Room[];
  onAddBulkGroup: (group: BulkGroup) => void;
  onBulkCheckIn: (tenantsData: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>[]) => void;
  onSettleGroupRent: (groupName: string, companyName: string, amount: number, paymentMode: 'UPI' | 'Bank Transfer' | 'Cash') => void;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const BulkGroupManagerModal: React.FC<BulkGroupManagerModalProps> = ({
  isOpen,
  onClose,
  bulkGroups = [],
  tenants = [],
  rooms = [],
  onAddBulkGroup,
  onBulkCheckIn,
  onSettleGroupRent,
  onSendWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'bulk_checkin' | 'company_invoice'>('groups');

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newRentPerPerson, setNewRentPerPerson] = useState(4500);
  const [newAdvancePerPerson, setNewAdvancePerPerson] = useState(4500);
  const [newNotes, setNewNotes] = useState('');

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

  // Bulk Check-in Form State (5-15 people)
  const [checkinGroup, setCheckinGroup] = useState(bulkGroups[0]?.name || 'Nepal Hotel Hospitality Group');
  const [namesText, setNamesText] = useState('');
  const [bulkStartingPhone, setBulkStartingPhone] = useState('+91 98451 11200');
  const [bulkUniformRent, setBulkUniformRent] = useState(4500);
  const [bulkUniformAdvance, setBulkUniformAdvance] = useState(4500);
  const [bulkCheckInDate, setBulkCheckInDate] = useState('2026-08-15');
  const [bulkDocumentDriveLink, setBulkDocumentDriveLink] = useState('');

  // Company Invoice State
  const [invoiceGroup, setInvoiceGroup] = useState(bulkGroups[0]?.name || 'Nepal Hotel Hospitality Group');
  const [invoicePaymentMode, setInvoicePaymentMode] = useState<'Bank Transfer' | 'UPI' | 'Cash'>('Bank Transfer');
  const [invoiceMonth, setInvoiceMonth] = useState('August 2026');

  if (!isOpen) return null;

  // Calculate group members
  const getGroupMembers = (grpName: string) => {
    return tenants.filter((t) => t.isActive && (t.groupName === grpName || t.companyName === grpName));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newCompanyName.trim()) return;

    const created: BulkGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      companyName: newCompanyName.trim(),
      contactPerson: newContactPerson.trim() || 'HR / Manager',
      contactPhone: newContactPhone.trim() ? cleanIndianPhoneForStorage(newContactPhone) : OWNER_PHONE,
      rentPerPerson: Number(newRentPerPerson),
      advancePerPerson: Number(newAdvancePerPerson),
      billingModel: 'company_end_of_month',
      notes: newNotes.trim() || undefined,
      createdDate: new Date().toISOString().split('T')[0],
    };

    onAddBulkGroup(created);
    setNewGroupName('');
    setNewCompanyName('');
    setNewContactPerson('');
    setNewContactPhone('');
    setActiveTab('groups');
  };

  const handleExecuteBulkCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNames = namesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (rawNames.length === 0) return;

    const matchedGroup = bulkGroups.find((g) => g.name === checkinGroup);
    const compName = matchedGroup ? matchedGroup.companyName : checkinGroup;
    const compPhone = matchedGroup ? matchedGroup.contactPhone : '';

    // Find vacant beds across available rooms
    const availableRooms = rooms.filter((r) => r.status !== 'maintenance');
    const vacantSlots: { roomNumber: number; bedTag: string }[] = [];

    availableRooms.forEach((rm) => {
      const freeCount = rm.capacity - rm.occupied;
      for (let i = 1; i <= freeCount; i++) {
        vacantSlots.push({
          roomNumber: rm.number,
          bedTag: `B${rm.occupied + i}`,
        });
      }
    });

    const newTenants: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>[] = rawNames.map((name, idx) => {
      const slot = vacantSlots[idx] || { roomNumber: availableRooms[0]?.number || 101, bedTag: `B${idx + 1}` };
      const phoneNum = `${bulkStartingPhone.slice(0, -2)}${String(10 + idx).padStart(2, '0')}`;

      return {
        name,
        phone: phoneNum,
        roomNumber: slot.roomNumber,
        bedNumber: slot.bedTag,
        rentAmount: Number(bulkUniformRent),
        securityDeposit: Number(bulkUniformAdvance),
        dueDate: '2026-08-30',
        checkInDate: bulkCheckInDate,
        emergencyContact: `${matchedGroup?.contactPerson || 'Company Supervisor'} (${compName})`,
        emergencyPhone: compPhone || phoneNum,
        idProofType: 'Nepal Citizenship / Passport / ID',
        idProofNumber: `BULK-ID-${1000 + idx}`,
        isBulkContract: true,
        groupName: checkinGroup,
        companyName: compName,
        companyContactPhone: compPhone,
        billingModel: 'company_end_of_month',
        documentPhotoUrl: bulkDocumentDriveLink || undefined,
        notes: `Bulk Check-in batch (${checkinGroup}). Advance paid at check-in. Monthly rent billed to ${compName}.`,
      };
    });

    onBulkCheckIn(newTenants);
    setNamesText('');
    onClose();
  };

  // Generate WhatsApp Invoice for Company
  const selectedGrpObj = bulkGroups.find((g) => g.name === invoiceGroup) || bulkGroups[0];
  const groupMembers = selectedGrpObj ? getGroupMembers(selectedGrpObj.name) : [];
  const totalGroupRent = groupMembers.reduce((sum, m) => sum + m.rentAmount, 0);

  const generateCompanyInvoiceText = () => {
    if (!selectedGrpObj) return '';
    return `*AGAM MEN'S PG & STAY - CORPORATE ACCOMMODATION INVOICE*\n\nTo: *${selectedGrpObj.companyName} Management*\nAttention: *${selectedGrpObj.contactPerson}*\nGroup: *${selectedGrpObj.name}*\nBilling Period: *${invoiceMonth}*\n\n🏨 *Accommodation Summary:*\n• Total Staying Residents: *${groupMembers.length}*\n• Agreed Rate Per Bed: *₹${selectedGrpObj.rentPerPerson.toLocaleString('en-IN')}/mo*\n• *Total Amount Payable:* *₹${totalGroupRent.toLocaleString('en-IN')}*\n\n📋 *Resident List:*\n${groupMembers.map((m, i) => `${i + 1}. ${m.name} (Room ${m.roomNumber} - ${m.bedNumber})`).join('\n')}\n\n🏦 *Payment Mode:* Direct Bank NEFT / UPI\n💳 *UPI ID:* ${OWNER_UPI_ID}\n📱 *Mobile:* ${OWNER_PHONE}\n\nKindly process the month-end billing transfer and share the transaction reference.\n\nWarm regards,\n*Agam Men's PG & Stay Management*`;
  };

  const handleSendInvoiceWhatsApp = () => {
    if (!selectedGrpObj) return;
    const cleanPhone = selectedGrpObj.contactPhone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = generateCompanyInvoiceText();
    onSendWhatsApp(formatted, text);
  };

  const handleRecordGroupPayment = () => {
    if (!selectedGrpObj || totalGroupRent === 0) return;
    onSettleGroupRent(selectedGrpObj.name, selectedGrpObj.companyName, totalGroupRent, invoicePaymentMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a332c] text-white p-4 px-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold leading-tight">Bulk Groups & Corporate Contracts</h3>
              <p className="text-[11px] text-emerald-100/80 font-medium">
                Manage Nepal & Hotel batches • Advance at start, Company rent at month end
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

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 px-3.5 text-[12px] font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'groups'
                ? 'border-[#0a332c] text-[#0a332c]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Active Groups ({bulkGroups.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk_checkin')}
            className={`py-3 px-3.5 text-[12px] font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'bulk_checkin'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Bulk Check-In (10-15 People)</span>
          </button>
          <button
            onClick={() => setActiveTab('company_invoice')}
            className={`py-3 px-3.5 text-[12px] font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'company_invoice'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Month-End Company Invoice</span>
          </button>
        </div>

        {/* Tab 1: Active Groups List & Add New Group */}
        {activeTab === 'groups' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 text-[13px]">
            {/* List of current bulk groups */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Configured Groups & Hotel Contracts
              </span>

              {bulkGroups.map((grp) => {
                const members = getGroupMembers(grp.name);
                const totalMonthly = members.reduce((sum, m) => sum + m.rentAmount, 0);

                return (
                  <div
                    key={grp.id}
                    className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs hover:border-amber-400 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-[15px] text-slate-900">{grp.name}</h4>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                            {members.length} Active Residents
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-amber-700">apartment</span>
                          <span>Company: <strong>{grp.companyName}</strong></span>
                          <span>•</span>
                          <span>Supervisor: {grp.contactPerson} ({grp.contactPhone})</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:text-right">
                        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                            Total Monthly
                          </span>
                          <span className="text-[15px] font-black text-emerald-900">
                            ₹{totalMonthly.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Avatars */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Staying:</span>
                      {members.map((m) => (
                        <span
                          key={m.id}
                          className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-800"
                        >
                          {m.name} (R{m.roomNumber}-{m.bedNumber})
                        </span>
                      ))}
                      {members.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">No residents assigned yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Group Card */}
            <form onSubmit={handleCreateGroup} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#0a332c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Register New Bulk / Hotel Group
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Group Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Nepal Hotel Hospitality Group"
                    className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Company / Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. The Royal Grand Hotel & Banquets"
                    className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Supervisor / HR Name
                  </label>
                  <input
                    type="text"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Sunil Thapa (Supervisor)"
                    className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Supervisor Mobile (10 Digits)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 px-2.5 bg-slate-100 border-r border-slate-300 rounded-l-lg flex items-center gap-1 text-slate-700 font-extrabold text-[11px] select-none pointer-events-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(formatIndianPhone(e.target.value))}
                      placeholder="98451 12345"
                      maxLength={12}
                      className="w-full h-[38px] pl-[68px] pr-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Fixed Uniform Monthly Rent / Person (₹)
                  </label>
                  <input
                    type="number"
                    value={newRentPerPerson}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewRentPerPerson(val);
                      setNewAdvancePerPerson(val); // Auto 1:1 sync
                    }}
                    className="w-full h-[38px] px-3 border border-emerald-300 rounded-lg bg-white text-[#0a332c] font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Advance Collected at Start / Person (₹)
                  </label>
                  <input
                    type="number"
                    value={newAdvancePerPerson}
                    onChange={(e) => setNewAdvancePerPerson(Number(e.target.value))}
                    className="w-full h-[38px] px-3 border border-emerald-300 rounded-lg bg-white text-[#0a332c] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 h-[40px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Save Bulk Group Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Bulk Check-in Wizard (10-15 People in 1 click) */}
        {activeTab === 'bulk_checkin' && (
          <form onSubmit={handleExecuteBulkCheckIn} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-amber-700 shrink-0">speed</span>
              <div>
                <h4 className="font-extrabold text-[13px] text-amber-900">Instant Multi-Bed Bulk Allocation</h4>
                <p className="text-[11px] text-amber-800">
                  Paste 5 to 15 resident names. The system will automatically allocate available beds across rooms and assign uniform rent and advance!
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Assign to Corporate / Bulk Group *
              </label>
              <select
                value={checkinGroup}
                onChange={(e) => setCheckinGroup(e.target.value)}
                className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none"
              >
                {bulkGroups.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name} — {g.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[12px] mb-1">
                Paste Resident Names (1 name per line) *
              </label>
              <textarea
                rows={5}
                required
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                placeholder="Bikash Thapa&#10;Samir Gurung&#10;Rajesh Shrestha&#10;Deepak Tamang&#10;Prakash Magar"
                className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Total parsed names: <strong className="text-slate-900 font-extrabold">{namesText.split('\n').filter((n) => n.trim().length > 0).length} residents</strong></span>
                <span className="text-emerald-700 font-bold">
                  {rooms.filter(r => r.status !== 'maintenance').reduce((acc, r) => acc + Math.max(0, r.capacity - r.occupied), 0)} Total Beds Available
                </span>
              </div>

              {/* Room availability breakdown for batch allocation */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Available Room Bed Ratios (Occupied/Total):</span>
                <div className="flex flex-wrap gap-1.5">
                  {rooms.filter(r => r.status !== 'maintenance' && r.occupied < r.capacity).map(r => {
                    const freeCount = r.capacity - r.occupied;
                    return (
                      <span
                        key={r.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white text-emerald-900 border-emerald-300 shadow-2xs"
                      >
                        Room {r.number}: <strong>{r.occupied}/{r.capacity}</strong> ({freeCount} Free)
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Uniform Monthly Rent / Bed (₹)
                </label>
                <input
                  type="number"
                  value={bulkUniformRent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBulkUniformRent(val);
                    setBulkUniformAdvance(val); // 1:1 auto-sync
                  }}
                  className="w-full h-[38px] px-3 border border-emerald-300 rounded-lg bg-white text-[#0a332c] font-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Advance Collected at Check-in (₹)
                </label>
                <input
                  type="number"
                  value={bulkUniformAdvance}
                  onChange={(e) => setBulkUniformAdvance(Number(e.target.value))}
                  className="w-full h-[38px] px-3 border border-emerald-300 rounded-lg bg-white text-[#0a332c] font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={bulkCheckInDate}
                  onChange={(e) => setBulkCheckInDate(e.target.value)}
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Shared ID / T&C Drive Folder Link
                </label>
                <input
                  type="url"
                  value={bulkDocumentDriveLink}
                  onChange={(e) => setBulkDocumentDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-normal text-[12px] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('groups')}
                className="flex-1 h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[13px]"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 h-[42px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                <span>Admit Bulk Batch Now</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Company Month-End Invoicing & WhatsApp Billing */}
        {activeTab === 'company_invoice' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
            <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-indigo-700 shrink-0">account_balance</span>
              <div>
                <h4 className="font-extrabold text-[13px] text-indigo-900">End-of-Month Company Billing</h4>
                <p className="text-[11px] text-indigo-800">
                  Generate a consolidated accommodation statement, send the invoice to Hotel HR via WhatsApp, and record payment in 1 click!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Select Corporate Group
                </label>
                <select
                  value={invoiceGroup}
                  onChange={(e) => setInvoiceGroup(e.target.value)}
                  className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none"
                >
                  {bulkGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Billing Month
                </label>
                <select
                  value={invoiceMonth}
                  onChange={(e) => setInvoiceMonth(e.target.value)}
                  className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                </select>
              </div>
            </div>

            {/* Bill Preview Card */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col gap-3 font-mono text-[12px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400">INVOICE: {selectedGrpObj?.companyName}</span>
                <span className="text-[11px] text-slate-400">{invoiceMonth}</span>
              </div>

              <div className="flex justify-between">
                <span>Active Staying Residents:</span>
                <span className="font-bold text-white">{groupMembers.length} Members</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Per Bed:</span>
                <span className="font-bold text-white">₹{selectedGrpObj?.rentPerPerson?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-emerald-400 border-t border-slate-800 pt-2">
                <span>TOTAL COMPANY PAYABLE:</span>
                <span>₹{totalGroupRent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendInvoiceWhatsApp}
                className="flex-1 h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
                <span>Send WhatsApp Bill to HR</span>
              </button>

              <button
                type="button"
                onClick={handleRecordGroupPayment}
                className="flex-1 h-[44px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Record Full Group Payment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
