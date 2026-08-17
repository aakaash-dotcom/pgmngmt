import React, { useState, useMemo } from 'react';
import { MaintenanceTicket, StaffContact, StaffRole, Tenant, Room, RentPayment, Expense, Income, BulkGroup } from '../types';
import { OWNER_PHONE, OWNER_PHONE_INTL, PG_NAME } from '../data/initialData';
import { AddStaffModal } from './modals/AddStaffModal';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import {
  exportTenantsData,
  exportFinancialLedger,
  exportExpensesData,
  exportStaffPhonebook,
  downloadFile,
  copyToClipboard,
} from '../utils/exportUtils';

interface MoreScreenProps {
  maintenanceTickets?: MaintenanceTicket[];
  staffContacts?: StaffContact[];
  tenants?: Tenant[];
  rooms?: Room[];
  rentPayments?: RentPayment[];
  expenses?: Expense[];
  incomes?: Income[];
  bulkGroups?: BulkGroup[];
  onAddTicket?: (ticket: MaintenanceTicket) => void;
  onUpdateTicketStatus?: (id: string, status: MaintenanceTicket['status']) => void;
  onAddStaff?: (staff: Omit<StaffContact, 'id'>, editId?: string) => void;
  onDeleteStaff?: (id: string) => void;
  onRestoreBackup?: (backupData: any) => void;
  onSyncCloudSql?: () => Promise<void>;
  isSyncingCloudSql?: boolean;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  maintenanceTickets = [],
  staffContacts = [],
  tenants = [],
  rooms = [],
  rentPayments = [],
  expenses = [],
  incomes = [],
  bulkGroups = [],
  onAddTicket,
  onUpdateTicketStatus,
  onAddStaff,
  onDeleteStaff,
  onRestoreBackup,
  onSyncCloudSql,
  isSyncingCloudSql,
}) => {
  const [activeSection, setActiveSection] = useState<'phonebook' | 'whatsapp' | 'integrations' | 'maintenance'>('phonebook');

  // Phonebook filter & search state
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffContact | null>(null);

  // Maintenance form state
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [newTicketRoom, setNewTicketRoom] = useState('101');
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketCost, setNewTicketCost] = useState(500);

  // WhatsApp Notice state
  const DEFAULT_NOTICE_TEMPLATES: Record<string, string> = {
    'rent-due': `*AGAM GENTS PG - RENT DUE REMINDER*\n\nDear *{name}* (Room {room}),\n\nThis is a gentle reminder that your monthly hostel rent of *₹{balance}* is pending for this month.\n\n📱 *UPI Payment:* ${OWNER_PHONE}\n🏨 *PG:* ${PG_NAME}\n\nPlease settle the dues at the earliest or share the payment confirmation with the manager.\nThank you for your cooperation!`,
    'water-tanker': `*AGAM GENTS PG - WATER TANKER & SUPPLY NOTICE*\n\nDear *{name}* (Room {room}),\n\nPlease be informed that water tanker refilling & overhead tank cleaning is scheduled today between *2:00 PM to 4:00 PM*.\n\nWater supply will be briefly interrupted during this maintenance. Kindly store necessary drinking & utility water in advance.\n\n- Management, ${PG_NAME}`,
    'cleaning': `*AGAM GENTS PG - ROOM & BATHROOM CLEANING NOTICE*\n\nDear *{name}* (Room {room}),\n\nHousekeeping & cleaning staff (*Lakshmi Amma*) will be cleaning your floor and washrooms tomorrow morning starting at *9:30 AM*.\n\nKindly ensure your room floor is clear and belongings are kept safely in your cupboards.\n\n- Management, ${PG_NAME}`,
    'power-wifi': `*AGAM GENTS PG - WI-FI & ELECTRICITY MAINTENANCE*\n\nDear Residents / *{name}* (Room {room}),\n\nRoutine mesh Wi-Fi fiber router maintenance and electrical panel check is scheduled today between *11:00 AM to 1:00 PM*.\n\nInternet speed may be briefly intermittent during technician updates. We appreciate your patience.\n\n- Management, ${PG_NAME}`,
    'gate-timings': `*AGAM GENTS PG - MAIN GATE CLOSING TIMINGS*\n\nDear Residents / *{name}* (Room {room}),\n\nThis is a safety reminder that the hostel main entrance gate locks strictly at *10:30 PM* every night.\n\nResidents returning late due to office night shifts must inform Caretaker *Somu* in advance.\n\n- Management, ${PG_NAME}`,
    'custom': `*AGAM GENTS PG - NOTICE*\n\nDear *{name}* (Room {room}),\n\n[Write your announcement details here]\n\n- Management, ${PG_NAME}`,
  };

  const [selectedTemplate, setSelectedTemplate] = useState<'rent-due' | 'water-tanker' | 'power-wifi' | 'cleaning' | 'gate-timings' | 'custom'>('rent-due');
  const [noticeTemplates, setNoticeTemplates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_notice_templates');
      if (saved) {
        return { ...DEFAULT_NOTICE_TEMPLATES, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_NOTICE_TEMPLATES;
  });
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'unpaid' | 'room'>('all');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number>(rooms[0]?.number || 101);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const showCopyToast = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleUpdateCurrentTemplate = (newText: string) => {
    setNoticeTemplates((prev) => ({
      ...prev,
      [selectedTemplate]: newText,
    }));
  };

  const handleSaveTemplates = () => {
    try {
      localStorage.setItem('agam_pg_notice_templates', JSON.stringify(noticeTemplates));
      showCopyToast('Notice template saved successfully! Ready for future notices.');
    } catch {
      showCopyToast('Saved to current session.');
    }
  };

  const handleResetTemplate = () => {
    const defaultText = DEFAULT_NOTICE_TEMPLATES[selectedTemplate];
    if (defaultText) {
      setNoticeTemplates((prev) => {
        const updated = { ...prev, [selectedTemplate]: defaultText };
        try {
          localStorage.setItem('agam_pg_notice_templates', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showCopyToast('Reset template to default wording.');
    }
  };

  // Staff Roles list for filtering
  const allRoles: StaffRole[] = [
    'Cleaner / Housekeeping',
    'Electrician',
    'Plumber',
    'Water Tanker Supplier',
    'Caretaker / Security',
    'Internet / Wi-Fi Technician',
    'Carpenter / Repairs',
    'Cook / Kitchen',
    'Painter',
  ];

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffContacts.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
        staff.phone.includes(searchStaff) ||
        staff.role.toLowerCase().includes(searchStaff.toLowerCase()) ||
        (staff.notes && staff.notes.toLowerCase().includes(searchStaff.toLowerCase()));

      const matchesRole =
        selectedRoleFilter === 'all' || staff.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staffContacts, searchStaff, selectedRoleFilter]);

  // Cleaners count
  const cleanersCount = staffContacts.filter((s) => s.role === 'Cleaner / Housekeeping').length;

  // Filtered Tenants for WhatsApp Notice
  const targetTenants = useMemo(() => {
    const active = tenants.filter((t) => t.isActive);
    if (recipientFilter === 'unpaid') {
      return active.filter((t) => t.status !== 'Paid');
    }
    if (recipientFilter === 'room') {
      return active.filter((t) => Number(t.roomNumber) === Number(selectedRoomNumber));
    }
    return active;
  }, [tenants, recipientFilter, selectedRoomNumber]);

  // Generate Personalized WhatsApp Message for a Tenant
  const generateTenantMessage = (tenant?: Tenant): string => {
    const name = tenant ? tenant.name : 'Resident';
    const room = tenant ? tenant.roomNumber.toString() : '[Room No]';
    const balance = tenant ? (tenant.balance > 0 ? tenant.balance : tenant.rentAmount) : 4500;

    const rawTemplate = noticeTemplates[selectedTemplate] || DEFAULT_NOTICE_TEMPLATES[selectedTemplate] || '';
    return rawTemplate
      .replace(/{name}/g, name)
      .replace(/{room}/g, room)
      .replace(/{balance}/g, balance.toLocaleString('en-IN'));
  };

  // Direct WhatsApp Web / Mobile launcher for a tenant
  const handleOpenWhatsApp = (tenant: Tenant) => {
    const message = generateTenantMessage(tenant);
    const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Share to WhatsApp Group or general
  const handleShareToWhatsAppGroup = () => {
    const message = generateTenantMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Copy notice text to clipboard
  const handleCopyNoticeText = async (tenant?: Tenant) => {
    const message = generateTenantMessage(tenant);
    const success = await copyToClipboard(message);
    if (success) {
      showCopyToast('Notice copied to clipboard! Ready to paste in WhatsApp.');
    }
  };

  // Handle Maintenance Ticket creation
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !onAddTicket) return;

    onAddTicket({
      id: `mt-${Date.now()}`,
      roomNumber: Number(newTicketRoom) || 101,
      title: newTicketTitle.trim(),
      description: newTicketDesc.trim() || 'General maintenance check',
      reportedBy: 'Manager Desk',
      reportedDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
      cost: Number(newTicketCost) || 0,
    });

    setNewTicketTitle('');
    setNewTicketDesc('');
    setShowAddTicketModal(false);
    showCopyToast('Repair ticket recorded!');
  };

  // Handle JSON Backup Download
  const handleDownloadBackupJSON = () => {
    const backupData = {
      version: '1.0',
      pgName: PG_NAME,
      exportedAt: new Date().toISOString(),
      rooms,
      tenants,
      rentPayments,
      expenses,
      incomes,
      staffContacts,
      maintenanceTickets,
    };
    const content = JSON.stringify(backupData, null, 2);
    downloadFile(content, `Agam_PG_Full_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    showCopyToast('Full PG backup downloaded! You can save this to Google Drive.');
  };

  // Handle JSON Backup File Upload
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(parsed);
          showCopyToast('Successfully restored PG data from backup file!');
        }
      } catch (err) {
        alert('Invalid backup JSON file. Please ensure you uploaded a valid Agam PG backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-1.5 pb-24 flex flex-col gap-3">
      {/* Navigation Sub-Tabs (One Word) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-2xl p-1 shadow-xs border border-slate-200 gap-1 text-[12px]">
        <button
          onClick={() => setActiveSection('phonebook')}
          className={`py-2 px-2.5 text-center font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'phonebook'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">contact_phone</span>
          <span>Staff</span>
        </button>

        <button
          onClick={() => setActiveSection('whatsapp')}
          className={`py-2 px-2.5 text-center font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'whatsapp'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
          <span>Notices</span>
        </button>

        <button
          onClick={() => setActiveSection('integrations')}
          className={`py-2 px-2.5 text-center font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'integrations'
              ? 'bg-sky-800 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">table_view</span>
          <span>Sheets</span>
        </button>

        <button
          onClick={() => setActiveSection('maintenance')}
          className={`py-2 px-2.5 text-center font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'maintenance'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">build</span>
          <span>Repairs</span>
        </button>
      </div>

      {/* Copy Toast Feedback */}
      {copyFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[13px] font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* SECTION 1: STAFF & VENDOR PHONE BOOK */}
      {activeSection === 'phonebook' && (
        <section className="flex flex-col gap-3">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-700">{staffContacts.length} Contacts</span>
            </div>

            <button
              onClick={() => {
                setEditingStaff(null);
                setIsStaffModalOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-[12px] font-black flex items-center gap-1 shadow-2xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add Staff</span>
            </button>
          </div>

          {/* Search and Role Filter Chips */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search staff by name or role..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-[13px] bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
              {searchStaff && (
                <button
                  onClick={() => setSearchStaff('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                onClick={() => setSelectedRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                  selectedRoleFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Contacts ({staffContacts.length})
              </button>
              {allRoles.map((r) => {
                const count = staffContacts.filter((s) => s.role === r).length;
                if (count === 0 && selectedRoleFilter !== r) return null;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 ${
                      selectedRoleFilter === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{r.split(' / ')[0]}</span>
                    <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStaff.map((staff) => {
              const cleanPhone = staff.phone.replace(/[^0-9]/g, '');

              // Role Color & Icon Mapping
              const getRoleMeta = (role: StaffRole) => {
                switch (role) {
                  case 'Cleaner / Housekeeping':
                    return { icon: 'mop', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
                  case 'Electrician':
                    return { icon: 'bolt', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
                  case 'Plumber':
                    return { icon: 'faucet', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
                  case 'Water Tanker Supplier':
                    return { icon: 'water_drop', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
                  case 'Caretaker / Security':
                    return { icon: 'shield_person', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
                  case 'Internet / Wi-Fi Technician':
                    return { icon: 'wifi', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
                  case 'Carpenter / Repairs':
                    return { icon: 'handyman', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
                  case 'Cook / Kitchen':
                    return { icon: 'restaurant', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
                  default:
                    return { icon: 'person', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
                }
              };

              const meta = getRoleMeta(staff.role);

              return (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-blue-300 transition-all group"
                >
                  <div>
                    {/* Top Row: Name, Role Badge, Actions */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.bg}`}>
                          <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                            {staff.name}
                          </h3>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 ${meta.bg}`}>
                            {staff.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingStaff(staff);
                            setIsStaffModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                          title="Edit contact"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {onDeleteStaff && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${staff.name} from phone book?`)) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                            title="Delete contact"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phone Number Display */}
                    <div className="mt-3 flex flex-col gap-1 text-[13px]">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                        <a href={`tel:${cleanPhone}`} className="hover:text-blue-600 hover:underline">
                          +91 {staff.phone}
                        </a>
                      </div>

                      {staff.alternatePhone && (
                        <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">phone_iphone</span>
                          <a href={`tel:${staff.alternatePhone.replace(/[^0-9]/g, '')}`} className="hover:text-blue-600 hover:underline">
                            Alt: +91 {staff.alternatePhone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Notes / Duties */}
                    {staff.notes && (
                      <p className="text-[12px] text-slate-600 font-medium mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {staff.notes}
                      </p>
                    )}
                  </div>

                  {/* 1-Click Action Buttons (Direct Call & Direct WhatsApp) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-100 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>Call Now</span>
                    </a>

                    <a
                      href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                        `Hi ${staff.name}, this is from ${PG_NAME} regarding hostel maintenance/service.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}

            {filteredStaff.length === 0 && (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">contact_phone</span>
                <p className="text-[14px] font-bold text-slate-700">No staff found matching "{searchStaff}"</p>
                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setIsStaffModalOpen(true);
                  }}
                  className="mt-3 text-blue-600 font-bold text-[13px] hover:underline"
                >
                  + Add New Contact
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: WHATSAPP NOTICE & BROADCAST DISPATCHER */}
      {activeSection === 'whatsapp' && (
        <section className="flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3.5">
            {/* Template Selector Pills */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                1. Select Notice Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedTemplate('rent-due')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'rent-due'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">
                    payments
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">Rent Due Alert</div>
                    <div className="text-[11px] text-slate-500">Includes UPI & room dues</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTemplate('water-tanker')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'water-tanker'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-teal-600 text-[20px] shrink-0 mt-0.5">
                    water_drop
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">Water Supply / Tank</div>
                    <div className="text-[11px] text-slate-500">Refill & tank wash timing</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTemplate('cleaning')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'cleaning'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-cyan-600 text-[20px] shrink-0 mt-0.5">
                    mop
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">Cleaning Schedule</div>
                    <div className="text-[11px] text-slate-500">Housekeeping floor visits</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTemplate('power-wifi')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'power-wifi'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-indigo-600 text-[20px] shrink-0 mt-0.5">
                    wifi
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">Wi-Fi & Power</div>
                    <div className="text-[11px] text-slate-500">Router / power repair</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTemplate('gate-timings')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'gate-timings'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                    lock_clock
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">10:30 PM Gate Lock</div>
                    <div className="text-[11px] text-slate-500">Night curfew reminder</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTemplate('custom')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    selectedTemplate === 'custom'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-purple-600 text-[20px] shrink-0 mt-0.5">
                    edit_note
                  </span>
                  <div>
                    <div className="text-[12px] font-bold">Custom Message</div>
                    <div className="text-[11px] text-slate-500">Type any notice</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Template Editor Box with Save & Reset */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0a332c]">edit_note</span>
                  <span>Notice Template Message:</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetTemplate}
                    type="button"
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveTemplates}
                    type="button"
                    className="text-[11px] font-extrabold bg-[#0a332c] text-white px-2.5 py-1 rounded-lg hover:bg-[#0f4239] shadow-2xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    <span>Save Template</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={noticeTemplates[selectedTemplate] || ''}
                onChange={(e) => handleUpdateCurrentTemplate(e.target.value)}
                placeholder="Type your message here... Use {name}, {room}, {balance} as variables."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-[12px] font-mono leading-relaxed outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Variables available: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-bold">{'{name}'}</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-bold">{'{room}'}</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-bold">{'{balance}'}</code></span>
                {copyFeedback && (
                  <span className="text-emerald-700 font-bold animate-pulse">{copyFeedback}</span>
                )}
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  WhatsApp Message Preview
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  Auto-populates resident name & room
                </span>
              </div>
              <pre className="text-[12px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-100">
                {generateTenantMessage(targetTenants[0])}
              </pre>
            </div>

            {/* Target Recipients Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  2. Choose Target Residents:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRecipientFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                      recipientFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Active ({tenants.filter((t) => t.isActive).length})
                  </button>

                  <button
                    onClick={() => setRecipientFilter('unpaid')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                      recipientFilter === 'unpaid'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Unpaid Rent Only ({tenants.filter((t) => t.isActive && t.status !== 'Paid').length})
                  </button>

                  <button
                    onClick={() => setRecipientFilter('room')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                      recipientFilter === 'room'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    By Room
                  </button>

                  {recipientFilter === 'room' && (
                    <select
                      value={selectedRoomNumber}
                      onChange={(e) => setSelectedRoomNumber(Number(e.target.value))}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-[12px] font-bold text-slate-800 outline-none"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.number}>
                          Room {r.number}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Group Share & Copy Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyNoticeText(targetTenants[0])}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy Text</span>
                </button>

                <button
                  onClick={handleShareToWhatsAppGroup}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  <span>Share to PG Group</span>
                </button>
              </div>
            </div>

            {/* Individual Tenant WhatsApp Quick Sender List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <h3 className="text-[13px] font-extrabold text-slate-900">
                Direct WhatsApp Dispatch List ({targetTenants.length} residents selected)
              </h3>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {targetTenants.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-[12px] flex items-center justify-center shrink-0">
                        {t.roomNumber}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900 leading-tight">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          +91 {t.phone} • Rent: ₹{t.rentAmount} ({t.status})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenWhatsApp(t)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Send WhatsApp</span>
                    </button>
                  </div>
                ))}

                {targetTenants.length === 0 && (
                  <div className="text-center py-6 text-slate-500 font-medium text-[13px]">
                    No residents found in this category.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: GOOGLE SHEETS, EXCEL & DATA INTEGRATIONS */}
      {activeSection === 'integrations' && (
        <section className="flex flex-col gap-4">
          {/* Live Google Workspace Hub */}
          <GoogleWorkspaceHub
            tenants={tenants}
            rooms={rooms}
            rentPayments={rentPayments}
            expenses={expenses}
            incomes={incomes}
            staffContacts={staffContacts}
            maintenanceTickets={maintenanceTickets}
            bulkGroups={bulkGroups}
            onRestoreBackup={onRestoreBackup}
            onSyncCloudSql={onSyncCloudSql}
            isSyncingCloudSql={isSyncingCloudSql}
          />

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[24px]">
                  table_view
                </span>
                <h2 className="text-[18px] font-extrabold text-slate-900 leading-tight">
                  Google Sheets, Excel & Cloud Data Sync
                </h2>
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-1">
                Instantly export all PG ledgers, tenant rosters, and balance sheets for Google Sheets, accountants & tax records
              </p>
            </div>

            {/* Quick 1-Click Copy for Google Sheets (Formatted TSV Table) */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-[14px] font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                      content_paste
                    </span>
                    1-Click Copy for Google Sheets (Paste in Columns)
                  </h3>
                  <p className="text-[12px] text-indigo-800 font-medium">
                    Click copy below, then press <strong>Ctrl+V / Cmd+V</strong> directly in any Google Sheet cell!
                  </p>
                </div>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Open sheets.new</span>
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  onClick={async () => {
                    const data = exportTenantsData(tenants);
                    const ok = await copyToClipboard(data.tsv);
                    if (ok) showCopyToast('Tenants roster copied for Google Sheets! Paste with Ctrl+V');
                  }}
                  className="p-2.5 bg-white hover:bg-indigo-100/50 border border-indigo-200 rounded-xl text-left transition-colors"
                >
                  <span className="text-[12px] font-bold text-indigo-900 block">
                    📋 Copy Tenants Table
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {tenants.length} tenant records
                  </span>
                </button>

                <button
                  onClick={async () => {
                    const data = exportFinancialLedger(incomes, expenses, rentPayments);
                    const ok = await copyToClipboard(data.tsv);
                    if (ok) showCopyToast('Financial Ledger copied for Google Sheets! Paste with Ctrl+V');
                  }}
                  className="p-2.5 bg-white hover:bg-indigo-100/50 border border-indigo-200 rounded-xl text-left transition-colors"
                >
                  <span className="text-[12px] font-bold text-indigo-900 block">
                    📋 Copy Balance Sheet
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Incomes & Expenses
                  </span>
                </button>

                <button
                  onClick={async () => {
                    const data = exportExpensesData(expenses);
                    const ok = await copyToClipboard(data.tsv);
                    if (ok) showCopyToast('Expenses log copied for Google Sheets! Paste with Ctrl+V');
                  }}
                  className="p-2.5 bg-white hover:bg-indigo-100/50 border border-indigo-200 rounded-xl text-left transition-colors"
                >
                  <span className="text-[12px] font-bold text-indigo-900 block">
                    📋 Copy Expenses Log
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {expenses.length} bills recorded
                  </span>
                </button>

                <button
                  onClick={async () => {
                    const data = exportStaffPhonebook(staffContacts);
                    const ok = await copyToClipboard(data.tsv);
                    if (ok) showCopyToast('Staff Phonebook copied for Google Sheets! Paste with Ctrl+V');
                  }}
                  className="p-2.5 bg-white hover:bg-indigo-100/50 border border-indigo-200 rounded-xl text-left transition-colors"
                >
                  <span className="text-[12px] font-bold text-indigo-900 block">
                    📋 Copy Staff Phonebook
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {staffContacts.length} numbers
                  </span>
                </button>
              </div>
            </div>

            {/* CSV File Downloads */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[14px] font-extrabold text-slate-900">
                Download CSV Files for Google Sheets & MS Excel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Tenants & Dues Master</h4>
                    <p className="text-[12px] text-slate-500 font-medium">
                      Names, phone numbers, room, rent, deposits & check-in dates
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const data = exportTenantsData(tenants);
                      downloadFile(data.csv, `Agam_PG_Tenants_${new Date().toISOString().split('T')[0]}.csv`);
                      showCopyToast('Downloaded Agam_PG_Tenants.csv');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-bold text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">download</span>
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Financial Ledger & P&L</h4>
                    <p className="text-[12px] text-slate-500 font-medium">
                      All monthly income inflows, expenses & net profit calculations
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const data = exportFinancialLedger(incomes, expenses, rentPayments);
                      downloadFile(data.csv, `Agam_PG_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
                      showCopyToast('Downloaded Agam_PG_Financial_Ledger.csv');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-bold text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">download</span>
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Operating Expenses Log</h4>
                    <p className="text-[12px] text-slate-500 font-medium">
                      Electricity, water tanker, Wi-Fi, salaries & maintenance bills
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const data = exportExpensesData(expenses);
                      downloadFile(data.csv, `Agam_PG_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
                      showCopyToast('Downloaded Agam_PG_Expenses.csv');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-bold text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">download</span>
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Staff & Vendor Directory</h4>
                    <p className="text-[12px] text-slate-500 font-medium">
                      Cleaner, plumber, electrician & tanker contact records
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const data = exportStaffPhonebook(staffContacts);
                      downloadFile(data.csv, `Agam_PG_Staff_Phonebook_${new Date().toISOString().split('T')[0]}.csv`);
                      showCopyToast('Downloaded Agam_PG_Staff_Phonebook.csv');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-bold text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">download</span>
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Google Drive Full Backup & Restore */}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
              <div>
                <h3 className="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">cloud_sync</span>
                  Google Drive / Cloud Backup & Restore
                </h3>
                <p className="text-[12px] text-slate-500 font-medium">
                  Save a full snapshot of your PG data to keep in Google Drive or transfer to a new device
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadBackupJSON}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                  <span>Export Full PG Backup (JSON)</span>
                </button>

                <label className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-300">
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>Restore from Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: MAINTENANCE & REPAIRS DESK */}
      {activeSection === 'maintenance' && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-700">
                {maintenanceTickets.filter((t) => t.status !== 'resolved').length} Pending Repairs
              </span>
            </div>

            <button
              onClick={() => setShowAddTicketModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-black flex items-center gap-1 shadow-2xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Ticket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maintenanceTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        Room {ticket.roomNumber}
                      </span>
                      <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                        {ticket.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'in-progress'
                          ? 'bg-amber-100 text-amber-900'
                          : ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Reported: {ticket.reportedDate} ({ticket.reportedBy})</span>
                    {ticket.cost && (
                      <span className="text-slate-800 font-bold">Est: ₹{ticket.cost}</span>
                    )}
                  </div>

                  {onUpdateTicketStatus && ticket.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'resolved')}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[12px] font-bold rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Mark Issue as Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Ticket Modal */}
          {showAddTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddTicketModal(false)} />
              <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 p-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
                  <h3 className="font-bold text-[16px] text-slate-900">Create Maintenance Ticket</h3>
                  <button onClick={() => setShowAddTicketModal(false)} className="text-slate-400 hover:text-slate-700">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="flex flex-col gap-3 text-[13px]">
                  <div>
                    <label className="block font-bold text-slate-700 text-[12px] mb-1">Room #</label>
                    <select
                      value={newTicketRoom}
                      onChange={(e) => setNewTicketRoom(e.target.value)}
                      className="w-full h-[40px] px-3 border border-slate-300 rounded-xl bg-white font-medium"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.number}>
                          Room {r.number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[12px] mb-1">Issue Title *</label>
                    <input
                      type="text"
                      required
                      value={newTicketTitle}
                      onChange={(e) => setNewTicketTitle(e.target.value)}
                      placeholder="e.g. Bathroom Tap Leaking or Geyser Switch"
                      className="w-full h-[40px] px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[12px] mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      placeholder="Details of the issue..."
                      className="w-full p-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[12px] mb-1">Est. Repair Cost (₹)</label>
                    <input
                      type="number"
                      value={newTicketCost}
                      onChange={(e) => setNewTicketCost(Number(e.target.value))}
                      className="w-full h-[40px] px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-200 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTicketModal(false)}
                      className="flex-1 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                    >
                      Save Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Add / Edit Staff Modal */}
      <AddStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        initialStaff={editingStaff}
        onSave={(staffData, editId) => {
          if (onAddStaff) {
            onAddStaff(staffData, editId);
          }
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
      />
    </div>
  );
};
