import { useState, useEffect, useRef } from 'react';
import {
  TabType,
  Room,
  Tenant,
  RentPayment,
  Expense,
  Income,
  MaintenanceTicket,
  Notice,
  StaffContact,
  BulkGroup,
  WhatsAppTemplate,
} from './types';
import {
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_RENT_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_NOTICES,
  INITIAL_STAFF_CONTACTS,
  INITIAL_BULK_GROUPS,
  INITIAL_WA_TEMPLATES,
} from './data/initialData';
import {
  saveStateToCloud,
  saveStateToCloudImmediately,
  subscribeToCloudUpdates,
  fetchInitialCloudData,
  getDeviceId,
  AppSyncData,
} from './lib/firebaseSync';

import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { SideDrawer } from './components/SideDrawer';
import { HomeScreen } from './components/HomeScreen';
import { RoomsScreen } from './components/RoomsScreen';
import { PeopleScreen } from './components/PeopleScreen';
import { MoneyScreen } from './components/MoneyScreen';
import { MoreScreen } from './components/MoreScreen';

import { AddTenantModal } from './components/modals/AddTenantModal';
import { CollectRentModal } from './components/modals/CollectRentModal';
import { RoomDetailModal } from './components/modals/RoomDetailModal';
import { TenantDetailModal } from './components/modals/TenantDetailModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddIncomeModal } from './components/modals/AddIncomeModal';
import { AddRoomModal } from './components/modals/AddRoomModal';
import { EditRoomModal } from './components/modals/EditRoomModal';
import { ActionRequiredModal } from './components/modals/ActionRequiredModal';
import { BulkGroupManagerModal } from './components/modals/BulkGroupManagerModal';
import { WhatsAppTemplateModal } from './components/modals/WhatsAppTemplateModal';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [peopleFilter, setPeopleFilter] = useState<string | undefined>();
  const [roomsFilter, setRoomsFilter] = useState<string | undefined>('all');

  // Check if demo data was already reset/cleared previously
  const [hasResetDemoData, setHasResetDemoData] = useState<boolean>(() => {
    return localStorage.getItem('agam_pg_demo_reset_done') === 'true';
  });

  // Data State with LocalStorage
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('agam_pg_rooms');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') {
      return INITIAL_ROOMS.map((r) => ({
        ...r,
        occupied: 0,
        occupants: [],
        status: r.status === 'maintenance' ? 'maintenance' : 'empty',
      }));
    }
    return INITIAL_ROOMS;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('agam_pg_tenants');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_TENANTS;
  });

  const [bulkGroups, setBulkGroups] = useState<BulkGroup[]>(() => {
    const saved = localStorage.getItem('agam_pg_bulk_groups');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_BULK_GROUPS;
  });

  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppTemplate[]>(() => {
    const saved = localStorage.getItem('agam_pg_wa_templates');
    return saved ? JSON.parse(saved) : INITIAL_WA_TEMPLATES;
  });

  const [rentPayments, setRentPayments] = useState<RentPayment[]>(() => {
    const saved = localStorage.getItem('agam_pg_payments');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_RENT_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('agam_pg_expenses');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_EXPENSES;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('agam_pg_incomes');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_INCOMES;
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('agam_pg_tickets');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('agam_pg_demo_reset_done') === 'true') return [];
    return INITIAL_MAINTENANCE_TICKETS;
  });

  const [staffContacts, setStaffContacts] = useState<StaffContact[]>(() => {
    const saved = localStorage.getItem('agam_pg_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_CONTACTS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('agam_pg_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // LocalStorage Synchronization
  useEffect(() => {
    localStorage.setItem('agam_pg_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('agam_pg_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('agam_pg_bulk_groups', JSON.stringify(bulkGroups));
  }, [bulkGroups]);

  useEffect(() => {
    localStorage.setItem('agam_pg_wa_templates', JSON.stringify(whatsAppTemplates));
  }, [whatsAppTemplates]);

  useEffect(() => {
    localStorage.setItem('agam_pg_payments', JSON.stringify(rentPayments));
  }, [rentPayments]);

  useEffect(() => {
    localStorage.setItem('agam_pg_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('agam_pg_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('agam_pg_tickets', JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  useEffect(() => {
    localStorage.setItem('agam_pg_staff', JSON.stringify(staffContacts));
  }, [staffContacts]);

  useEffect(() => {
    localStorage.setItem('agam_pg_notices', JSON.stringify(notices));
  }, [notices]);

  // Flag to avoid uploading cloud data back when updating from remote
  const isApplyingRemoteSyncRef = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // 1. Initial Load & Real-Time Subscription across multiple devices
  useEffect(() => {
    let isMounted = true;

    // Fetch initial data once on mount
    fetchInitialCloudData().then((cloudData) => {
      if (!isMounted || !cloudData) return;
      if (cloudData.rooms && cloudData.rooms.length > 0) {
        isApplyingRemoteSyncRef.current = true;
        setRooms(cloudData.rooms);
        if (cloudData.tenants) setTenants(cloudData.tenants);
        if (cloudData.payments) setRentPayments(cloudData.payments);
        if (cloudData.incomes) setIncomes(cloudData.incomes);
        if (cloudData.expenses) setExpenses(cloudData.expenses);
        if (cloudData.staffContacts) setStaffContacts(cloudData.staffContacts);
        if (cloudData.bulkGroups) setBulkGroups(cloudData.bulkGroups);
        if (cloudData.maintenanceTickets) setMaintenanceTickets(cloudData.maintenanceTickets);
        if (cloudData.notices) setNotices(cloudData.notices);
        if (cloudData.whatsappTemplates) setWhatsAppTemplates(cloudData.whatsappTemplates);
        setTimeout(() => {
          isApplyingRemoteSyncRef.current = false;
        }, 800);
      }
    });

    // Subscribe to multi-device real-time updates
    const unsubscribe = subscribeToCloudUpdates((remoteData) => {
      if (!isMounted || !remoteData) return;
      const currentDeviceId = getDeviceId();
      // If the update originated from another phone/device, update live state
      if (remoteData.updatedByDeviceId && remoteData.updatedByDeviceId !== currentDeviceId) {
        console.log('⚡ Received live cloud update from another device!');
        isApplyingRemoteSyncRef.current = true;
        if (remoteData.rooms) setRooms(remoteData.rooms);
        if (remoteData.tenants) setTenants(remoteData.tenants);
        if (remoteData.payments) setRentPayments(remoteData.payments);
        if (remoteData.incomes) setIncomes(remoteData.incomes);
        if (remoteData.expenses) setExpenses(remoteData.expenses);
        if (remoteData.staffContacts) setStaffContacts(remoteData.staffContacts);
        if (remoteData.bulkGroups) setBulkGroups(remoteData.bulkGroups);
        if (remoteData.maintenanceTickets) setMaintenanceTickets(remoteData.maintenanceTickets);
        if (remoteData.notices) setNotices(remoteData.notices);
        if (remoteData.whatsappTemplates) setWhatsAppTemplates(remoteData.whatsappTemplates);

        setCloudSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => {
          isApplyingRemoteSyncRef.current = false;
        }, 800);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Automatic Cloud Upload whenever local state updates
  useEffect(() => {
    if (isApplyingRemoteSyncRef.current) return;

    setCloudSyncStatus('syncing');
    saveStateToCloud({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      bulkGroups,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

    const timer = setTimeout(() => {
      setCloudSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    rooms,
    tenants,
    rentPayments,
    incomes,
    expenses,
    maintenanceTickets,
    staffContacts,
    bulkGroups,
    notices,
    whatsAppTemplates,
  ]);

  // Modal States
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isCollectRentOpen, setIsCollectRentOpen] = useState(false);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [isTenantDetailOpen, setIsTenantDetailOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isActionRequiredOpen, setIsActionRequiredOpen] = useState(false);
  const [isBulkManagerOpen, setIsBulkManagerOpen] = useState(false);
  const [isWhatsAppTemplatesOpen, setIsWhatsAppTemplatesOpen] = useState(false);

  // Selected Entities for Modals
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedPaymentForCollect, setSelectedPaymentForCollect] = useState<RentPayment | null>(null);
  const [alertType, setAlertType] = useState<'overdue' | 'stayEnding' | 'refundPending'>('overdue');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingCloudSql, setIsSyncingCloudSql] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // WhatsApp Sender
  const handleSendWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Templates Management
  const handleSaveWhatsAppTemplate = (template: WhatsAppTemplate) => {
    setWhatsAppTemplates((prev) => {
      const exists = prev.some((t) => t.id === template.id);
      if (exists) {
        return prev.map((t) => (t.id === template.id ? template : t));
      }
      return [template, ...prev];
    });
    showToast('WhatsApp template saved successfully!');
  };

  const handleDeleteWhatsAppTemplate = (id: string) => {
    setWhatsAppTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('WhatsApp template removed.');
  };

  // Bulk Groups Management
  const handleAddBulkGroup = (group: BulkGroup) => {
    setBulkGroups((prev) => [group, ...prev]);
    showToast(`Added corporate/bulk contract group: ${group.name}!`);
  };

  // Bulk Check-in of Multiple Residents
  const handleBulkCheckIn = (tenantsData: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>[]) => {
    const timestamp = Date.now();
    const newTenants: Tenant[] = tenantsData.map((td, idx) => ({
      ...td,
      id: `t-bulk-${timestamp}-${idx}`,
      balance: td.isBulkContract ? 0 : td.rentAmount,
      status: td.isBulkContract ? 'Paid' : 'Unpaid',
      isActive: true,
    }));

    setTenants((prev) => [...newTenants, ...prev]);

    // Update Room Occupancy
    setRooms((prevRooms) => {
      const updatedRooms = [...prevRooms];
      newTenants.forEach((nt) => {
        const roomIndex = updatedRooms.findIndex((r) => Number(r.number) === Number(nt.roomNumber));
        if (roomIndex !== -1) {
          const r = updatedRooms[roomIndex];
          const updatedOccupants = [...r.occupants, nt.name.split(' ')[0]];
          const newOccupied = updatedOccupants.length;
          const status = newOccupied >= r.capacity ? 'full' : newOccupied > 0 ? 'partial' : 'empty';
          updatedRooms[roomIndex] = {
            ...r,
            occupied: newOccupied,
            occupants: updatedOccupants,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
      });
      return updatedRooms;
    });

    // Record Security Deposits Incomes
    const depositIncomes: Income[] = newTenants
      .filter((t) => t.securityDeposit && t.securityDeposit > 0)
      .map((t, idx) => ({
        id: `inc-dep-${timestamp}-${idx}`,
        title: `Advance Deposit - Room ${t.roomNumber} (${t.name})`,
        category: 'Security Deposit',
        amount: t.securityDeposit || 0,
        date: t.checkInDate || '2026-08-14',
        receivedFrom: t.name,
        paymentMode: 'Cash',
        monthYear: 'Aug 2026',
        notes: `Bulk contract check-in: ${t.groupName || ''}`,
      }));

    if (depositIncomes.length > 0) {
      setIncomes((prev) => [...depositIncomes, ...prev]);
    }

    // Create Rent Payment Records
    const newRentPayments: RentPayment[] = newTenants.map((t, idx) => ({
      id: `pay-bulk-${timestamp}-${idx}`,
      tenantId: t.id,
      tenantName: t.name,
      roomNumber: t.roomNumber,
      amount: t.rentAmount,
      month: 'Aug',
      year: 2026,
      dueDate: '05 AUG',
      paidDate: '14 AUG',
      status: 'Paid',
      balance: 0,
      paymentMode: 'Bank Transfer',
      note: `Corporate billing: ${t.companyName || t.groupName}`,
    }));
    setRentPayments((prev) => [...newRentPayments, ...prev]);

    showToast(`Successfully checked in ${newTenants.length} residents in bulk!`);
  };

  // Month-end Corporate Group Rent Settlement
  const handleSettleGroupRent = (
    groupName: string,
    companyName: string,
    amount: number,
    paymentMode: 'UPI' | 'Bank Transfer' | 'Cash'
  ) => {
    // Mark all active tenants of this group as Paid
    setTenants((prev) =>
      prev.map((t) => {
        if (t.isBulkContract && (t.groupName === groupName || t.companyName === companyName)) {
          return {
            ...t,
            status: 'Paid',
            balance: 0,
            lastPaidDate: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Record a single corporate consolidated income
    const newIncome: Income = {
      id: `inc-corp-${Date.now()}`,
      title: `Corporate Monthly Rent - ${companyName || groupName}`,
      category: 'Bulk Company Rent',
      amount,
      date: new Date().toISOString().split('T')[0],
      receivedFrom: companyName || groupName,
      paymentMode,
      monthYear: 'Aug 2026',
      notes: `Consolidated month-end accommodation settlement for ${groupName}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);

    showToast(`Settled ₹${amount.toLocaleString('en-IN')} corporate rent for ${companyName || groupName}!`);
  };

  // Sync state with Cloud SQL (PostgreSQL asia-southeast1)
  const handleSyncCloudSql = async () => {
    try {
      setIsSyncingCloudSql(true);
      const { getIdToken } = await import('./lib/firebase');
      const token = await getIdToken();
      if (!token) {
        showToast('Please connect your Google Account first to sync with Cloud SQL.');
        return;
      }

      // First ensure user is synced
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Save complete PG dataset to Cloud SQL
      const saveRes = await fetch('/api/cloudsql/save', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rooms,
          tenants,
          rentPayments,
          expenses,
          incomes,
          staffContacts,
          maintenanceTickets,
          bulkGroups,
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.text();
        throw new Error(`Cloud SQL sync failed: ${err}`);
      }

      showToast('Successfully synchronized with Cloud SQL PostgreSQL!');
    } catch (err: any) {
      console.error('Cloud SQL sync error:', err);
      showToast(`Cloud SQL Sync: ${err.message || 'Error syncing data'}`);
    } finally {
      setIsSyncingCloudSql(false);
    }
  };

  // Reset / Clear Demo Data to start clean
  const handleResetData = async () => {
    // 1. Reset rooms to vacant state with 0 occupants
    const clearedRooms: Room[] = INITIAL_ROOMS.map((r) => ({
      ...r,
      occupied: 0,
      occupants: [],
      status: r.status === 'maintenance' ? 'maintenance' : 'empty',
    }));

    // 2. Clear all state arrays
    setRooms(clearedRooms);
    setTenants([]);
    setBulkGroups([]);
    setRentPayments([]);
    setExpenses([]);
    setIncomes([]);
    setMaintenanceTickets([]);
    setStaffContacts(INITIAL_STAFF_CONTACTS);
    setNotices(INITIAL_NOTICES);
    setWhatsAppTemplates(INITIAL_WA_TEMPLATES);

    // 3. Mark demo data as permanently reset
    setHasResetDemoData(true);
    localStorage.setItem('agam_pg_demo_reset_done', 'true');
    localStorage.setItem('agam_pg_rooms', JSON.stringify(clearedRooms));
    localStorage.setItem('agam_pg_tenants', JSON.stringify([]));
    localStorage.setItem('agam_pg_bulk_groups', JSON.stringify([]));
    localStorage.setItem('agam_pg_payments', JSON.stringify([]));
    localStorage.setItem('agam_pg_expenses', JSON.stringify([]));
    localStorage.setItem('agam_pg_incomes', JSON.stringify([]));
    localStorage.setItem('agam_pg_tickets', JSON.stringify([]));
    localStorage.setItem('agam_pg_staff', JSON.stringify(INITIAL_STAFF_CONTACTS));
    localStorage.setItem('agam_pg_notices', JSON.stringify(INITIAL_NOTICES));
    localStorage.setItem('agam_pg_wa_templates', JSON.stringify(INITIAL_WA_TEMPLATES));

    // 4. Force immediate update to Firestore cloud so all devices sync the clean state
    await saveStateToCloudImmediately({
      rooms: clearedRooms,
      tenants: [],
      payments: [],
      incomes: [],
      expenses: [],
      maintenanceTickets: [],
      staffContacts: INITIAL_STAFF_CONTACTS,
      bulkGroups: [],
      notices: INITIAL_NOTICES,
      whatsappTemplates: INITIAL_WA_TEMPLATES,
    });

    showToast('All demo data cleared! PG is ready for fresh real entries.');
  };

  // Add Tenant Handler
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
      balance: newTenantData.isBulkContract ? 0 : newTenantData.rentAmount,
      status: newTenantData.isBulkContract ? 'Paid' : 'Unpaid',
      isActive: true,
    };

    setTenants((prev) => [newTenant, ...prev]);

    // Update Room Occupancy
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (Number(r.number) === Number(newTenant.roomNumber)) {
          const updatedOccupants = [...r.occupants, newTenant.name.split(' ')[0]];
          const newOccupied = updatedOccupants.length;
          const status = newOccupied >= r.capacity ? 'full' : newOccupied > 0 ? 'partial' : 'empty';
          return {
            ...r,
            occupied: newOccupied,
            occupants: updatedOccupants,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
        return r;
      })
    );

    // Record Security Deposit or Rent Income
    if (newTenant.securityDeposit && newTenant.securityDeposit > 0) {
      const depositIncome: Income = {
        id: `inc-${Date.now()}`,
        title: `Security Deposit - Room ${newTenant.roomNumber} (${newTenant.name})`,
        category: 'Security Deposit',
        amount: newTenant.securityDeposit,
        date: newTenant.checkInDate || '2026-08-14',
        receivedFrom: newTenant.name,
        paymentMode: 'UPI',
        monthYear: 'Aug 2026',
        notes: newTenant.isBulkContract ? `Bulk contract: ${newTenant.groupName}` : undefined,
      };
      setIncomes((prev) => [depositIncome, ...prev]);
    }

    // Create Initial Payment Record
    const newPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: newId,
      tenantName: newTenant.name,
      roomNumber: newTenant.roomNumber,
      amount: newTenant.rentAmount,
      month: 'Aug',
      year: 2026,
      dueDate: '05 AUG',
      paidDate: newTenant.status === 'Paid' ? '14 AUG' : undefined,
      status: newTenant.status,
      balance: newTenant.balance || 0,
      paymentMode: 'UPI',
      note: newTenant.isBulkContract ? `Corporate contract: ${newTenant.companyName}` : undefined,
    };
    setRentPayments((prev) => [newPayment, ...prev]);

    showToast(`Admitted ${newTenant.name} to Room ${newTenant.roomNumber} (${newTenant.bedNumber || 'B1'})!`);
  };

  // Collect Rent Handler
  const handleConfirmPayment = (details: {
    tenantId: string;
    amountPaid: number;
    paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
    month: string;
    receiptNote?: string;
  }) => {
    const tenant = tenants.find((t) => t.id === details.tenantId);
    if (!tenant) return;

    // Update Tenant Status
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === details.tenantId) {
          const newBal = Math.max(0, (t.balance || t.rentAmount) - details.amountPaid);
          const newStatus = newBal === 0 ? 'Paid' : 'Partial';
          return {
            ...t,
            status: newStatus,
            balance: newBal,
            lastPaidDate: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Update or Create RentPayment Record
    const updatedPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      amount: details.amountPaid,
      month: details.month.split(' ')[0] || 'Aug',
      year: 2026,
      dueDate: '05 AUG',
      paidDate: '14 AUG',
      status: 'Paid',
      balance: 0,
      paymentMode: details.paymentMode,
      note: details.receiptNote,
    };

    setRentPayments((prev) => [
      updatedPayment,
      ...prev.filter((p) => p.tenantName !== tenant.name),
    ]);

    // Also add to Incomes ledger for automated balance sheet
    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      title: `Room Rent - Room ${tenant.roomNumber} (${tenant.name})`,
      category: tenant.isBulkContract ? 'Bulk Company Rent' : 'Monthly Rent',
      amount: details.amountPaid,
      date: '2026-08-14',
      receivedFrom: tenant.name,
      paymentMode: details.paymentMode === 'Cheque' ? 'Bank Transfer' : details.paymentMode,
      monthYear: 'Aug 2026',
      notes: details.receiptNote,
    };
    setIncomes((prev) => [newIncome, ...prev]);

    showToast(`Collected ₹${details.amountPaid.toLocaleString('en-IN')} from ${tenant.name}!`);
  };

  // Toggle Tenant Active / Vacated status
  const handleToggleTenantActive = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;

    const willBeActive = !target.isActive;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            isActive: willBeActive,
            checkOutDate: willBeActive ? undefined : new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Free or fill bed in room
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (Number(r.number) === Number(target.roomNumber)) {
          let updatedOccupants = r.occupants;
          if (!willBeActive) {
            const firstName = target.name.split(' ')[0];
            updatedOccupants = r.occupants.filter((occ) => occ.toLowerCase() !== firstName.toLowerCase());
          } else {
            updatedOccupants = [...r.occupants, target.name.split(' ')[0]];
          }
          const newOccupied = updatedOccupants.length;
          const status = newOccupied >= r.capacity ? 'full' : newOccupied > 0 ? 'partial' : 'empty';
          return {
            ...r,
            occupied: newOccupied,
            occupants: updatedOccupants,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
        return r;
      })
    );

    showToast(willBeActive ? `Reactivated resident ${target.name}` : `${target.name} checked out (vacated).`);
  };

  // Update Tenant Notes
  const handleUpdateTenantNotes = (tenantId: string, notes: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, notes } : t))
    );
    showToast('Resident remarks updated.');
  };

  // Toggle Room Maintenance
  const handleToggleRoomMaintenance = (
    roomId: string,
    isMaintenance: boolean,
    reason?: string
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: isMaintenance
              ? 'maintenance'
              : r.occupied >= r.capacity
              ? 'full'
              : r.occupied > 0
              ? 'partial'
              : 'empty',
            maintenanceReason: isMaintenance ? reason || 'Under Maintenance' : undefined,
          };
        }
        return r;
      })
    );
    showToast(isMaintenance ? 'Room marked under maintenance' : 'Room restored to operational');
  };

  // Add Room Handler (Unlimited rooms, up to 10 sharing)
  const handleAddRoom = (newRoomData: Omit<Room, 'id' | 'occupied' | 'occupants'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `room-${Date.now()}`,
      occupied: 0,
      occupants: [],
      status: 'empty',
    };
    setRooms((prev) => [...prev, newRoom]);
    showToast(`Added Room ${newRoom.number} (${newRoom.capacity} beds @ ₹${newRoom.perBedRent?.toLocaleString('en-IN')}/bed)!`);
  };

  // Edit Room Handler (Price & Capacity up to 10 sharing)
  const handleUpdateRoom = (roomId: string, updatedFields: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const newCapacity = updatedFields.capacity !== undefined ? updatedFields.capacity : r.capacity;
          const status = r.occupied >= newCapacity ? 'full' : r.occupied > 0 ? 'partial' : 'empty';
          return {
            ...r,
            ...updatedFields,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
        return r;
      })
    );

    // If selected room is currently open in detail modal, update that too
    if (selectedRoom && selectedRoom.id === roomId) {
      setSelectedRoom((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }

    showToast('Room price & sharing capacity updated successfully!');
  };

  // Delete Room Handler
  const handleDeleteRoom = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
      setIsRoomDetailOpen(false);
    }
    showToast(`Removed Room ${targetRoom?.number || ''} from PG.`);
  };

  // Add Expense Handler
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Logged expense ₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.category}!`);
  };

  // Delete Expense Handler
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense entry removed.');
  };

  // Add Other Income Handler
  const handleAddIncome = (newIncData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...newIncData,
      id: `inc-${Date.now()}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);
    showToast(`Recorded income of ₹${newIncome.amount.toLocaleString('en-IN')}!`);
  };

  // Delete Income Handler
  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    showToast('Income entry removed.');
  };

  // Add Maintenance Ticket
  const handleAddTicket = (ticket: MaintenanceTicket) => {
    setMaintenanceTickets((prev) => [ticket, ...prev]);
    showToast(`Logged repair ticket for Room ${ticket.roomNumber}!`);
  };

  // Staff Handlers
  const handleAddStaff = (staffData: Omit<StaffContact, 'id'>, editId?: string) => {
    if (editId) {
      setStaffContacts((prev) =>
        prev.map((s) => (s.id === editId ? { ...staffData, id: editId } : s))
      );
      showToast(`Updated contact for ${staffData.name}!`);
    } else {
      const newStaff: StaffContact = {
        ...staffData,
        id: `staff-${Date.now()}`,
      };
      setStaffContacts((prev) => [newStaff, ...prev]);
      showToast(`Added ${staffData.name} (${staffData.role}) to phone book!`);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaffContacts((prev) => prev.filter((s) => s.id !== id));
    showToast('Contact removed from phone book.');
  };

  // Restore Full PG Backup Handler
  const handleRestoreBackup = (backupData: any) => {
    if (!backupData) return;
    if (backupData.rooms && Array.isArray(backupData.rooms)) {
      setRooms(backupData.rooms);
    }
    if (backupData.tenants && Array.isArray(backupData.tenants)) {
      setTenants(backupData.tenants);
    }
    if (backupData.bulkGroups && Array.isArray(backupData.bulkGroups)) {
      setBulkGroups(backupData.bulkGroups);
    }
    if (backupData.rentPayments && Array.isArray(backupData.rentPayments)) {
      setRentPayments(backupData.rentPayments);
    }
    if (backupData.expenses && Array.isArray(backupData.expenses)) {
      setExpenses(backupData.expenses);
    }
    if (backupData.incomes && Array.isArray(backupData.incomes)) {
      setIncomes(backupData.incomes);
    }
    if (backupData.staffContacts && Array.isArray(backupData.staffContacts)) {
      setStaffContacts(backupData.staffContacts);
    }
    if (backupData.maintenanceTickets && Array.isArray(backupData.maintenanceTickets)) {
      setMaintenanceTickets(backupData.maintenanceTickets);
    }
    showToast('Successfully restored all PG data!');
  };

  // Navigation with optional filter
  const handleNavigate = (tab: TabType, filter?: string) => {
    setCurrentTab(tab);
    if (tab === 'people') {
      setPeopleFilter(filter);
    } else if (tab === 'rooms') {
      setRoomsFilter(filter || 'all');
    }
  };

  return (
    <div className="bg-slate-100/70 min-h-screen text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      {/* Top App Bar */}
      <TopAppBar
        currentTab={currentTab}
        onOpenSideDrawer={() => setIsDrawerOpen(true)}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Canvas Area */}
      <main className="pt-[60px] min-h-[calc(100vh-130px)]">
        {currentTab === 'home' && (
          <HomeScreen
            rooms={rooms}
            tenants={tenants}
            bulkGroups={bulkGroups}
            expenses={expenses}
            incomes={incomes}
            onNavigate={handleNavigate}
            onAddTenant={() => setIsAddTenantOpen(true)}
            onAddRoom={() => setIsAddRoomOpen(true)}
            onCollectRent={() => {
              setSelectedPaymentForCollect(null);
              setIsCollectRentOpen(true);
            }}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenBulkManager={() => setIsBulkManagerOpen(true)}
            onOpenAlertModal={(type) => {
              setAlertType(type);
              setIsActionRequiredOpen(true);
            }}
          />
        )}

        {currentTab === 'rooms' && (
          <RoomsScreen
            rooms={rooms}
            tenants={tenants}
            initialStatusFilter={roomsFilter}
            onSelectRoom={(room) => {
              setSelectedRoom(room);
              setIsRoomDetailOpen(true);
            }}
            onAddRoom={() => setIsAddRoomOpen(true)}
            onEditRoom={(room) => {
              setSelectedRoomForEdit(room);
              setIsEditRoomOpen(true);
            }}
            onAddTenantToRoom={() => setIsAddTenantOpen(true)}
          />
        )}

        {currentTab === 'people' && (
          <PeopleScreen
            tenants={tenants}
            bulkGroups={bulkGroups}
            onSelectTenant={(tenant) => {
              setSelectedTenant(tenant);
              setIsTenantDetailOpen(true);
            }}
            onAddTenant={() => setIsAddTenantOpen(true)}
            onOpenBulkManager={() => setIsBulkManagerOpen(true)}
            onCollectRent={(tenantId) => {
              const t = tenants.find((item) => item.id === tenantId);
              if (t) {
                setSelectedTenant(t);
                setSelectedPaymentForCollect(null);
                setIsCollectRentOpen(true);
              }
            }}
            onSendWhatsAppReminder={(tenant) => {
              setSelectedTenant(tenant);
              setIsTenantDetailOpen(true);
            }}
          />
        )}

        {currentTab === 'money' && (
          <MoneyScreen
            rentPayments={rentPayments}
            expenses={expenses}
            incomes={incomes}
            onMarkPaid={(payment) => {
              setSelectedPaymentForCollect(payment);
              setIsCollectRentOpen(true);
            }}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onAddIncome={() => setIsAddIncomeOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {currentTab === 'more' && (
          <MoreScreen
            maintenanceTickets={maintenanceTickets}
            staffContacts={staffContacts}
            tenants={tenants}
            rooms={rooms}
            rentPayments={rentPayments}
            expenses={expenses}
            incomes={incomes}
            bulkGroups={bulkGroups}
            onAddTicket={handleAddTicket}
            onUpdateTicketStatus={(id, status) => {
              setMaintenanceTickets((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status } : t))
              );
              showToast('Repair ticket marked as resolved!');
            }}
            onAddStaff={handleAddStaff}
            onDeleteStaff={handleDeleteStaff}
            onRestoreBackup={handleRestoreBackup}
            onSyncCloudSql={handleSyncCloudSql}
            isSyncingCloudSql={isSyncingCloudSql}
          />
        )}
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50 bg-[#0a332c] text-white text-[13px] font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setPeopleFilter(undefined);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Side Navigation Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        onResetData={handleResetData}
        showResetButton={!hasResetDemoData}
        onAddTenant={() => setIsAddTenantOpen(true)}
        onAddRoom={() => setIsAddRoomOpen(true)}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenBulkManager={() => setIsBulkManagerOpen(true)}
        onOpenWhatsAppTemplates={() => setIsWhatsAppTemplatesOpen(true)}
      />

      {/* Modals */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAddTenant={handleAddTenant}
        rooms={rooms}
        bulkGroups={bulkGroups}
      />

      <CollectRentModal
        isOpen={isCollectRentOpen}
        onClose={() => setIsCollectRentOpen(false)}
        tenants={tenants}
        initialPayment={selectedPaymentForCollect}
        onConfirmPayment={handleConfirmPayment}
      />

      <RoomDetailModal
        isOpen={isRoomDetailOpen}
        onClose={() => setIsRoomDetailOpen(false)}
        room={selectedRoom}
        tenants={tenants}
        onAddTenantToRoom={() => {
          setIsAddTenantOpen(true);
        }}
        onEditRoom={(room) => {
          setSelectedRoomForEdit(room);
          setIsEditRoomOpen(true);
        }}
        onToggleMaintenance={handleToggleRoomMaintenance}
        onSelectTenant={(tenant) => {
          setSelectedTenant(tenant);
          setIsTenantDetailOpen(true);
        }}
      />

      {selectedRoomForEdit && (
        <EditRoomModal
          isOpen={isEditRoomOpen}
          onClose={() => {
            setIsEditRoomOpen(false);
            setSelectedRoomForEdit(null);
          }}
          room={selectedRoomForEdit}
          onSaveRoom={(updatedRoom) => handleUpdateRoom(updatedRoom.id, updatedRoom)}
          onDeleteRoom={handleDeleteRoom}
        />
      )}

      <TenantDetailModal
        isOpen={isTenantDetailOpen}
        onClose={() => setIsTenantDetailOpen(false)}
        tenant={selectedTenant}
        templates={whatsAppTemplates}
        onCollectRent={(tenant) => {
          setSelectedTenant(tenant);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
        onToggleActiveStatus={handleToggleTenantActive}
        onUpdateTenantNotes={handleUpdateTenantNotes}
        onSendWhatsApp={handleSendWhatsApp}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onAddIncome={handleAddIncome}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onAddRoom={handleAddRoom}
        nextRoomNumber={rooms.length + 1}
      />

      <ActionRequiredModal
        isOpen={isActionRequiredOpen}
        onClose={() => setIsActionRequiredOpen(false)}
        alertType={alertType}
        tenants={tenants}
        onSelectTenant={(t) => {
          setSelectedTenant(t);
          setIsTenantDetailOpen(true);
        }}
        onCollectRent={(t) => {
          setSelectedTenant(t);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
      />

      {/* Bulk Group Corporate / Hotel Contracts Manager */}
      <BulkGroupManagerModal
        isOpen={isBulkManagerOpen}
        onClose={() => setIsBulkManagerOpen(false)}
        bulkGroups={bulkGroups}
        tenants={tenants}
        rooms={rooms}
        onAddBulkGroup={handleAddBulkGroup}
        onBulkCheckIn={handleBulkCheckIn}
        onSettleGroupRent={handleSettleGroupRent}
        onSendWhatsApp={handleSendWhatsApp}
      />

      {/* WhatsApp Message Template Studio */}
      <WhatsAppTemplateModal
        isOpen={isWhatsAppTemplatesOpen}
        onClose={() => setIsWhatsAppTemplatesOpen(false)}
        templates={whatsAppTemplates}
        onSaveTemplate={handleSaveWhatsAppTemplate}
        onDeleteTemplate={handleDeleteWhatsAppTemplate}
      />
    </div>
  );
}
