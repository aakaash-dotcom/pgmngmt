import { useState, useEffect, useRef, useMemo } from 'react';
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
  WhatsAppTemplate,
} from './types';
import {
  INITIAL_WA_TEMPLATES,
} from './data/initialData';
import {
  getTodayDateString,
  getCurrentMonthYear,
  formatMonthYearFromDateString,
  getDueDateString,
} from './utils/dateUtils';
import {
  saveStateToCloud,
  saveStateToCloudImmediately,
  subscribeToCloudUpdates,
  fetchInitialCloudData,
  getDeviceId,
  setSyncCallbacks,
  AppSyncData,
  mergeUniqueById,
} from './lib/firebaseSync';

import { TopAppBar } from './components/TopAppBar';
import { AgamLogo } from './components/AgamLogo';
import { ConfirmDialog } from './components/ConfirmDialog';
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
import { WhatsAppTemplateModal } from './components/modals/WhatsAppTemplateModal';

// Legacy demo/mock record IDs that must never revive from old cloud backups
const LEGACY_MOCK_IDS = new Set([
  'staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5',
  'r-101', 'r-102', 'r-103', 'r-104',
  't-1', 't-2', 't-3',
  'exp-1', 'exp-2', 'exp-3',
  'inc-1', 'inc-2',
  'mt-1', 'mt-2'
]);

// Helper to strip any legacy mock/demo records so they never revive
const filterLegacy = <T extends { id?: string }>(arr: T[] = []): T[] =>
  arr.filter((item) => item && item.id && !LEGACY_MOCK_IDS.has(item.id));

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [peopleFilter, setPeopleFilter] = useState<string | undefined>();
  const [roomsFilter, setRoomsFilter] = useState<string | undefined>('all');

  // Check if demo data was already reset/cleared previously
  const isResetDone = () => true;
  const [hasResetDemoData, setHasResetDemoData] = useState<boolean>(true);

  // Data State with LocalStorage - clean defaults: 0 rooms, 0 tenants
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_tenants');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_wa_templates');
      return saved ? JSON.parse(saved) : INITIAL_WA_TEMPLATES;
    } catch {
      return INITIAL_WA_TEMPLATES;
    }
  });

  const [rentPayments, setRentPayments] = useState<RentPayment[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_incomes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [staffContacts, setStaffContacts] = useState<StaffContact[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_staff');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem('agam_pg_notices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // LocalStorage Synchronization
  useEffect(() => {
    localStorage.setItem('agam_pg_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('agam_pg_tenants', JSON.stringify(tenants));
  }, [tenants]);

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
  const isHydratedRef = useRef(false);
  const isApplyingRemoteSyncRef = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Boot loading: show a splash until the first cloud/local hydration completes
  const [isBootLoading, setIsBootLoading] = useState(true);
  // Timestamp of the last remote snapshot applied (last-writer-wins sync)
  const lastAppliedRemoteUpdateRef = useRef<string | null>(null);
  // Always-current snapshot of the full app state (for reconnect re-sync)
  const latestStateRef = useRef<AppSyncData | null>(null);
  // Throttle for sync-error toasts so repeated failures don't spam
  const lastSyncErrorToastRef = useRef<number>(0);
  // True when local changes exist that have not reached the cloud yet
  // (e.g. edits made while offline) — triggers a reconcile on reconnect
  const hasUnsyncedChangesRef = useRef(false);

  // 1. Initial Load & Real-Time Reconciled Subscription
  useEffect(() => {
    let isMounted = true;
    let hydratedCloudData: AppSyncData | null = null;

    // Fetch initial data once on mount
    fetchInitialCloudData().then((cloudData) => {
      hydratedCloudData = cloudData;
      if (!isMounted) return;

      const isCleanSlateDone = localStorage.getItem('agam_pg_v3_clean_slate') === 'true';
      if (!isCleanSlateDone) {
        // User explicitly asked for a completely new, clean app with 0 demo staff numbers, 0 rooms, 0 tenants
        localStorage.setItem('agam_pg_v3_clean_slate', 'true');
        localStorage.setItem('agam_pg_rooms', '[]');
        localStorage.setItem('agam_pg_tenants', '[]');
        localStorage.setItem('agam_pg_staff', '[]');
        localStorage.setItem('agam_pg_payments', '[]');
        localStorage.setItem('agam_pg_expenses', '[]');
        localStorage.setItem('agam_pg_incomes', '[]');
        localStorage.setItem('agam_pg_tickets', '[]');
        localStorage.setItem('agam_pg_notices', '[]');
        localStorage.setItem('agam_pg_last_updated', new Date().toISOString());

        setRooms([]);
        setTenants([]);
        setStaffContacts([]);
        setRentPayments([]);
        setExpenses([]);
        setIncomes([]);
        setMaintenanceTickets([]);
        setNotices([]);

        // Purge Firestore cloud database document so old demo staff/rooms are wiped for good
        saveStateToCloudImmediately({
          rooms: [],
          tenants: [],
          payments: [],
          incomes: [],
          expenses: [],
          maintenanceTickets: [],
          staffContacts: [],
          notices: [],
          whatsappTemplates: INITIAL_WA_TEMPLATES,
        });

        isHydratedRef.current = true;
        return;
      }

      const localRoomsStr = localStorage.getItem('agam_pg_rooms');
      const localRooms: Room[] = filterLegacy(localRoomsStr ? JSON.parse(localRoomsStr) : []);
      const localTenantsStr = localStorage.getItem('agam_pg_tenants');
      const localTenants: Tenant[] = filterLegacy(localTenantsStr ? JSON.parse(localTenantsStr) : []);
      const localPaymentsStr = localStorage.getItem('agam_pg_payments');
      const localPayments: RentPayment[] = filterLegacy(localPaymentsStr ? JSON.parse(localPaymentsStr) : []);
      const localIncomesStr = localStorage.getItem('agam_pg_incomes');
      const localIncomes: Income[] = filterLegacy(localIncomesStr ? JSON.parse(localIncomesStr) : []);
      const localExpensesStr = localStorage.getItem('agam_pg_expenses');
      const localExpenses: Expense[] = filterLegacy(localExpensesStr ? JSON.parse(localExpensesStr) : []);
      const localTicketsStr = localStorage.getItem('agam_pg_tickets');
      const localTickets: MaintenanceTicket[] = filterLegacy(localTicketsStr ? JSON.parse(localTicketsStr) : []);
      const localStaffStr = localStorage.getItem('agam_pg_staff');
      const localStaff: StaffContact[] = filterLegacy(localStaffStr ? JSON.parse(localStaffStr) : []);
      const localNoticesStr = localStorage.getItem('agam_pg_notices');
      const localNotices: Notice[] = filterLegacy(localNoticesStr ? JSON.parse(localNoticesStr) : []);
      const localWaStr = localStorage.getItem('agam_pg_wa_templates');
      const localWa: WhatsAppTemplate[] = localWaStr ? JSON.parse(localWaStr) : INITIAL_WA_TEMPLATES;

      if (!cloudData) {
        // First-ever run without existing cloud data: populate cloud with current local state
        isHydratedRef.current = true;
        saveStateToCloudImmediately({
          rooms: localRooms,
          tenants: localTenants,
          payments: localPayments,
          incomes: localIncomes,
          expenses: localExpenses,
          maintenanceTickets: localTickets,
          staffContacts: localStaff,
          notices: localNotices,
          whatsappTemplates: localWa,
        });
        return;
      }

      // Reconcile and union all data so NOTHING is lost on refresh or across devices!
      const reconciledRooms = mergeUniqueById(localRooms, filterLegacy(cloudData.rooms || []), 'id');
      const reconciledTenants = mergeUniqueById(localTenants, filterLegacy(cloudData.tenants || []), 'id');
      const reconciledPayments = mergeUniqueById(localPayments, filterLegacy(cloudData.payments || []), 'id');
      const reconciledIncomes = mergeUniqueById(localIncomes, filterLegacy(cloudData.incomes || []), 'id');
      const reconciledExpenses = mergeUniqueById(localExpenses, filterLegacy(cloudData.expenses || []), 'id');
      const reconciledTickets = mergeUniqueById(localTickets, filterLegacy(cloudData.maintenanceTickets || []), 'id');
      const reconciledStaff = mergeUniqueById(localStaff, filterLegacy(cloudData.staffContacts || []), 'id');
      const reconciledNotices = mergeUniqueById(localNotices, filterLegacy(cloudData.notices || []), 'id');
      const reconciledWa = cloudData.whatsappTemplates?.length ? cloudData.whatsappTemplates : localWa;

      isApplyingRemoteSyncRef.current = true;
      setRooms(reconciledRooms);
      setTenants(reconciledTenants);
      setRentPayments(reconciledPayments);
      setIncomes(reconciledIncomes);
      setExpenses(reconciledExpenses);
      setMaintenanceTickets(reconciledTickets);
      setStaffContacts(reconciledStaff);
      setNotices(reconciledNotices);
      setWhatsAppTemplates(reconciledWa);

      // Immediately write back reconciled state to localStorage
      try {
        localStorage.setItem('agam_pg_rooms', JSON.stringify(reconciledRooms));
        localStorage.setItem('agam_pg_tenants', JSON.stringify(reconciledTenants));
        localStorage.setItem('agam_pg_payments', JSON.stringify(reconciledPayments));
        localStorage.setItem('agam_pg_incomes', JSON.stringify(reconciledIncomes));
        localStorage.setItem('agam_pg_expenses', JSON.stringify(reconciledExpenses));
        localStorage.setItem('agam_pg_tickets', JSON.stringify(reconciledTickets));
        localStorage.setItem('agam_pg_staff', JSON.stringify(reconciledStaff));
        localStorage.setItem('agam_pg_notices', JSON.stringify(reconciledNotices));
        localStorage.setItem('agam_pg_wa_templates', JSON.stringify(reconciledWa));
        localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
      } catch (e) {}

      // Push reconciled master copy back to cloud immediately
      saveStateToCloudImmediately({
        rooms: reconciledRooms,
        tenants: reconciledTenants,
        payments: reconciledPayments,
        incomes: reconciledIncomes,
        expenses: reconciledExpenses,
        maintenanceTickets: reconciledTickets,
        staffContacts: reconciledStaff,
        notices: reconciledNotices,
        whatsappTemplates: reconciledWa,
      });

      isHydratedRef.current = true;
      setTimeout(() => {
        isApplyingRemoteSyncRef.current = false;
      }, 500);
    }).finally(() => {
      // Hydration settled (success or early return) — stop the boot splash
      if (isMounted) {
        setIsBootLoading(false);
        if (hydratedCloudData?.lastUpdated) {
          lastAppliedRemoteUpdateRef.current = hydratedCloudData.lastUpdated;
        }
      }
    }).catch((err) => {
      console.error('Initial cloud hydration failed:', err);
      if (isMounted) setIsBootLoading(false);
    });

    // Subscribe to multi-device real-time updates
    const unsubscribe = subscribeToCloudUpdates((remoteData) => {
      if (!isMounted || !remoteData) return;
      const currentDeviceId = getDeviceId();

      // Skip our own writes once hydration is done (prevents echo loops)
      const isOwnWrite = remoteData.updatedByDeviceId === currentDeviceId;
      if (isOwnWrite && isHydratedRef.current) return;

      // Last-writer-wins at the document level: only apply a remote snapshot
      // when it is newer than the last one we applied. Unlike union-merging,
      // this makes edits AND deletes made on other devices propagate here.
      const remoteTs = remoteData.lastUpdated || '';
      const lastTs = lastAppliedRemoteUpdateRef.current;
      if (lastTs && remoteTs && remoteTs <= lastTs) return;

      console.log('⚡ Received live cloud update from Firestore!');
      if (remoteTs) lastAppliedRemoteUpdateRef.current = remoteTs;
      isApplyingRemoteSyncRef.current = true;

      const nextRooms = filterLegacy(remoteData.rooms || []);
      const nextTenants = filterLegacy(remoteData.tenants || []);
      const nextPayments = filterLegacy(remoteData.payments || []);
      const nextIncomes = filterLegacy(remoteData.incomes || []);
      const nextExpenses = filterLegacy(remoteData.expenses || []);
      const nextTickets = filterLegacy(remoteData.maintenanceTickets || []);
      const nextStaff = filterLegacy(remoteData.staffContacts || []);
      const nextNotices = filterLegacy(remoteData.notices || []);

      setRooms(nextRooms);
      setTenants(nextTenants);
      setRentPayments(nextPayments);
      setIncomes(nextIncomes);
      setExpenses(nextExpenses);
      setMaintenanceTickets(nextTickets);
      setStaffContacts(nextStaff);
      setNotices(nextNotices);
      setWhatsAppTemplates((prev) =>
        remoteData.whatsappTemplates?.length ? remoteData.whatsappTemplates : prev
      );

      try {
        localStorage.setItem('agam_pg_rooms', JSON.stringify(nextRooms));
        localStorage.setItem('agam_pg_tenants', JSON.stringify(nextTenants));
        localStorage.setItem('agam_pg_payments', JSON.stringify(nextPayments));
        localStorage.setItem('agam_pg_incomes', JSON.stringify(nextIncomes));
        localStorage.setItem('agam_pg_expenses', JSON.stringify(nextExpenses));
        localStorage.setItem('agam_pg_tickets', JSON.stringify(nextTickets));
        localStorage.setItem('agam_pg_staff', JSON.stringify(nextStaff));
        localStorage.setItem('agam_pg_notices', JSON.stringify(nextNotices));
        localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
      } catch (e) {}

      setCloudSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => {
        isApplyingRemoteSyncRef.current = false;
      }, 500);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Automatic Cloud Upload whenever local state updates
  useEffect(() => {
    // Crucial: do NOT auto-save before hydration is complete or while remote updates are applying
    if (!isHydratedRef.current || isApplyingRemoteSyncRef.current) return;

    const snapshot: AppSyncData = {
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    };

    // The "Synced" status is set by the save callbacks in firebaseSync once the
    // write actually succeeds, so the pill never claims success on failure.
    setCloudSyncStatus((prev) => (prev === 'offline' ? prev : 'syncing'));
    saveStateToCloud(snapshot);
  }, [
    rooms,
    tenants,
    rentPayments,
    incomes,
    expenses,
    maintenanceTickets,
    staffContacts,
    notices,
    whatsAppTemplates,
  ]);

  // Keep an always-current snapshot of the full state (used for reconnect re-sync)
  useEffect(() => {
    latestStateRef.current = {
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    };
  });

  // Modal States
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [addTenantDefaultRoom, setAddTenantDefaultRoom] = useState<number | undefined>(undefined);

  const openAddTenantModal = (roomNumber?: number) => {
    setAddTenantDefaultRoom(roomNumber);
    setIsAddTenantOpen(true);
  };

  const closeAddTenantModal = () => {
    setIsAddTenantOpen(false);
    setAddTenantDefaultRoom(undefined);
  };
  const [isCollectRentOpen, setIsCollectRentOpen] = useState(false);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [isTenantDetailOpen, setIsTenantDetailOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isActionRequiredOpen, setIsActionRequiredOpen] = useState(false);
  const [isWhatsAppTemplatesOpen, setIsWhatsAppTemplatesOpen] = useState(false);

  // Selected Entities for Modals
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedTenantForCollect, setSelectedTenantForCollect] = useState<Tenant | null>(null);
  const [selectedPaymentForCollect, setSelectedPaymentForCollect] = useState<RentPayment | null>(null);
  const [alertType, setAlertType] = useState<'overdue' | 'stayEnding' | 'refundPending'>('overdue');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingCloudSql, setIsSyncingCloudSql] = useState(false);

  // Confirmation dialog for destructive actions (delete / reset / restore)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Surface cloud sync results in the UI (status pill + throttled error toast)
  useEffect(() => {
    setSyncCallbacks({
      onSuccess: () => {
        hasUnsyncedChangesRef.current = false;
        setCloudSyncStatus((prev) => (prev === 'offline' ? prev : 'synced'));
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      },
      onError: () => {
        hasUnsyncedChangesRef.current = true;
        setCloudSyncStatus('error');
        const now = Date.now();
        if (now - lastSyncErrorToastRef.current > 10000) {
          lastSyncErrorToastRef.current = now;
          showToast('Cloud sync failed — your data is saved on this device.');
        }
      },
    });
    return () => setSyncCallbacks(null);
  }, []);

  // Online/offline detection: keep the sync pill honest and push any pending
  // local changes as soon as the connection comes back.
  useEffect(() => {
    const handleOffline = () => {
      setCloudSyncStatus('offline');
      showToast('You are offline — changes will sync when you reconnect.');
    };
    const handleOnline = async () => {
      showToast('Back online — syncing your data…');
      // Capture the local snapshot synchronously: it may contain edits made
      // while offline that a racing remote snapshot would otherwise wipe.
      const snapshot = latestStateRef.current;

      if (hasUnsyncedChangesRef.current && snapshot && isHydratedRef.current) {
        try {
          const cloudData = await fetchInitialCloudData();
          if (cloudData) {
            // Reconcile: union local (offline) changes with the cloud snapshot
            // so nothing is lost, then push the merged master copy.
            const merged: AppSyncData = {
              rooms: mergeUniqueById(snapshot.rooms, filterLegacy(cloudData.rooms || []), 'id'),
              tenants: mergeUniqueById(snapshot.tenants, filterLegacy(cloudData.tenants || []), 'id'),
              payments: mergeUniqueById(snapshot.payments, filterLegacy(cloudData.payments || []), 'id'),
              incomes: mergeUniqueById(snapshot.incomes, filterLegacy(cloudData.incomes || []), 'id'),
              expenses: mergeUniqueById(snapshot.expenses, filterLegacy(cloudData.expenses || []), 'id'),
              maintenanceTickets: mergeUniqueById(snapshot.maintenanceTickets, filterLegacy(cloudData.maintenanceTickets || []), 'id'),
              staffContacts: mergeUniqueById(snapshot.staffContacts, filterLegacy(cloudData.staffContacts || []), 'id'),
              notices: mergeUniqueById(snapshot.notices, filterLegacy(cloudData.notices || []), 'id'),
              whatsappTemplates: cloudData.whatsappTemplates?.length
                ? cloudData.whatsappTemplates
                : snapshot.whatsappTemplates,
            };
            latestStateRef.current = merged;
            // Block racing listener snapshots older than our reconciled push
            lastAppliedRemoteUpdateRef.current = new Date().toISOString();
            saveStateToCloudImmediately(merged);
            setRooms(merged.rooms);
            setTenants(merged.tenants);
            setRentPayments(merged.payments);
            setIncomes(merged.incomes);
            setExpenses(merged.expenses);
            setMaintenanceTickets(merged.maintenanceTickets);
            setStaffContacts(merged.staffContacts);
            setNotices(merged.notices);
            setWhatsAppTemplates(merged.whatsappTemplates);
            return;
          }
        } catch (err) {
          console.warn('Reconnect reconcile failed, pushing local state:', err);
        }
        // Fallback: push the local snapshot as-is
        lastAppliedRemoteUpdateRef.current = new Date().toISOString();
        saveStateToCloudImmediately(snapshot);
        return;
      }

      // No unsynced local changes: let the live listener apply remote updates
      setCloudSyncStatus('syncing');
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setCloudSyncStatus('offline');
    }
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // WhatsApp Sender
  const handleSendWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Templates Management
  const handleSaveWhatsAppTemplate = (template: WhatsAppTemplate) => {
    const exists = whatsAppTemplates.some((t) => t.id === template.id);
    const updated = exists
      ? whatsAppTemplates.map((t) => (t.id === template.id ? template : t))
      : [template, ...whatsAppTemplates];
    setWhatsAppTemplates(updated);
    try {
      localStorage.setItem('agam_pg_wa_templates', JSON.stringify(updated));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: updated,
    });
    showToast('WhatsApp template saved successfully!');
  };

  const handleDeleteWhatsAppTemplate = (id: string) => {
    const updated = whatsAppTemplates.filter((t) => t.id !== id);
    setWhatsAppTemplates(updated);
    try {
      localStorage.setItem('agam_pg_wa_templates', JSON.stringify(updated));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: updated,
    });
    showToast('WhatsApp template removed.');
  };

  // Sync state with Cloud SQL (PostgreSQL asia-southeast1)
  const handleSyncCloudSql = async () => {
    try {
      setIsSyncingCloudSql(true);
      const { getIdToken, auth } = await import('./lib/firebase');
      const token = await getIdToken();
      if (!token) {
        showToast('Please connect your Google Account first to sync with Cloud SQL.');
        return;
      }

      // First ensure user is synced (send the display name so Cloud SQL rows
      // are attributed to the real Google account)
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: auth.currentUser?.displayName || '' }),
      });
      if (!syncRes.ok) {
        throw new Error('Could not verify your Google account with the server.');
      }

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
        }),
      });

      if (!saveRes.ok) {
        const errText = await saveRes.text();
        let errMsg = errText;
        try {
          errMsg = JSON.parse(errText).error || errText;
        } catch {}
        throw new Error(errMsg);
      }

      showToast('Successfully synchronized with Cloud SQL PostgreSQL!');
    } catch (err: any) {
      console.error('Cloud SQL sync error:', err);
      showToast(`Cloud SQL Sync: ${err.message || 'Error syncing data'}`);
    } finally {
      setIsSyncingCloudSql(false);
    }
  };

  // Reset / Clear Demo Data to start clean (performs the actual wipe)
  const performResetData = async () => {
    isApplyingRemoteSyncRef.current = true;

    // Clear all state arrays to completely empty
    setRooms([]);
    setTenants([]);
    setRentPayments([]);
    setExpenses([]);
    setIncomes([]);
    setMaintenanceTickets([]);
    setStaffContacts([]);
    setNotices([]);
    setWhatsAppTemplates(INITIAL_WA_TEMPLATES);

    // Mark demo data as permanently reset in local storage
    setHasResetDemoData(true);
    localStorage.setItem('agam_pg_demo_reset_done', 'true');
    localStorage.setItem('agam_pg_rooms', JSON.stringify([]));
    localStorage.setItem('agam_pg_tenants', JSON.stringify([]));
    localStorage.setItem('agam_pg_payments', JSON.stringify([]));
    localStorage.setItem('agam_pg_expenses', JSON.stringify([]));
    localStorage.setItem('agam_pg_incomes', JSON.stringify([]));
    localStorage.setItem('agam_pg_tickets', JSON.stringify([]));
    localStorage.setItem('agam_pg_staff', JSON.stringify([]));
    localStorage.setItem('agam_pg_notices', JSON.stringify([]));
    localStorage.setItem('agam_pg_wa_templates', JSON.stringify(INITIAL_WA_TEMPLATES));

    // Force immediate update to Firestore cloud with isDemoReset=true so all devices sync the clean state
    await saveStateToCloudImmediately({
      rooms: [],
      tenants: [],
      payments: [],
      incomes: [],
      expenses: [],
      maintenanceTickets: [],
      staffContacts: [],
      notices: [],
      whatsappTemplates: INITIAL_WA_TEMPLATES,
    });

    setTimeout(() => {
      isApplyingRemoteSyncRef.current = false;
    }, 1200);

    showToast('All demo rooms, staff directory, residents, and ledgers cleared! Ready for real PG data.');
  };

  // Ask for confirmation before wiping everything
  const handleResetData = () => {
    setConfirmDialog({
      title: 'Reset ALL PG data?',
      message:
        'This permanently clears every room, resident, payment, expense, income, staff contact, ticket and notice — on this device and across all synced devices. This cannot be undone.',
      confirmLabel: 'Yes, Reset Everything',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        void performResetData();
      },
    });
  };

  // Add Tenant Handler
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id' | 'balance' | 'status' | 'isActive'>) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
      balance: newTenantData.rentAmount,
      status: 'Unpaid',
      isActive: true,
    };

    const updatedTenants = [newTenant, ...tenants];

    // Update Room Occupancy
    const updatedRooms = rooms.map((r) => {
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
    });

    // Record Security Deposit or Rent Income
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthShort = now.toLocaleDateString('en-IN', { month: 'short' });
    const currentMonthYearStr = getCurrentMonthYear(now);
    const todayStr = getTodayDateString();

    let updatedIncomes = incomes;
    if (newTenant.securityDeposit && newTenant.securityDeposit > 0) {
      const depositIncome: Income = {
        id: `inc-${Date.now()}`,
        title: `Security Deposit - Room ${newTenant.roomNumber} (${newTenant.name})`,
        category: 'Security Deposit',
        amount: newTenant.securityDeposit,
        date: newTenant.checkInDate || todayStr,
        receivedFrom: newTenant.name,
        paymentMode: 'UPI',
        monthYear: formatMonthYearFromDateString(newTenant.checkInDate || todayStr),
      };
      updatedIncomes = [depositIncome, ...incomes];
    }

    // Create Initial Payment Record
    const newPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: newId,
      tenantName: newTenant.name,
      roomNumber: newTenant.roomNumber,
      amount: newTenant.rentAmount,
      month: currentMonthShort,
      year: currentYear,
      dueDate: getDueDateString(5),
      paidDate: newTenant.status === 'Paid' ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase() : undefined,
      status: newTenant.status,
      balance: newTenant.balance || 0,
      paymentMode: 'UPI',
    };
    const updatedPayments = [newPayment, ...rentPayments];

    // Synchronously write all to localStorage
    try {
      localStorage.setItem('agam_pg_tenants', JSON.stringify(updatedTenants));
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_incomes', JSON.stringify(updatedIncomes));
      localStorage.setItem('agam_pg_payments', JSON.stringify(updatedPayments));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}

    // Update React State
    setTenants(updatedTenants);
    setRooms(updatedRooms);
    setIncomes(updatedIncomes);
    setRentPayments(updatedPayments);

    // Save directly to Firestore cloud immediately
    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants: updatedTenants,
      payments: updatedPayments,
      incomes: updatedIncomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

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
    const updatedTenants = tenants.map((t) => {
      if (t.id === details.tenantId) {
        const newBal = Math.max(0, (t.balance || t.rentAmount) - details.amountPaid);
        const newStatus = newBal === 0 ? 'Paid' : 'Partial';
        return {
          ...t,
          status: newStatus as any,
          balance: newBal,
          lastPaidDate: new Date().toISOString().split('T')[0],
        };
      }
      return t;
    });

    const paymentDate = new Date();
    const paidDateFormatted = paymentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();
    const payMonthParts = (details.month || '').split(' ');
    const payMonthShort = payMonthParts[0] || paymentDate.toLocaleDateString('en-IN', { month: 'short' });
    const payYear = payMonthParts[1] ? Number(payMonthParts[1]) : paymentDate.getFullYear();

    // Update or Create RentPayment Record
    const updatedPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      amount: details.amountPaid,
      month: payMonthShort,
      year: payYear,
      dueDate: getDueDateString(5),
      paidDate: paidDateFormatted,
      status: 'Paid',
      balance: 0,
      paymentMode: details.paymentMode,
      note: details.receiptNote,
    };

    const updatedPayments = [
      updatedPayment,
      ...rentPayments.filter((p) => p.tenantName !== tenant.name),
    ];

    // Also add to Incomes ledger for automated balance sheet
    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      title: `Room Rent - Room ${tenant.roomNumber} (${tenant.name})`,
      category: 'Monthly Rent',
      amount: details.amountPaid,
      date: getTodayDateString(),
      receivedFrom: tenant.name,
      paymentMode: details.paymentMode === 'Cheque' ? 'Bank Transfer' : details.paymentMode,
      monthYear: details.month || getCurrentMonthYear(),
      notes: details.receiptNote,
    };
    const updatedIncomes = [newIncome, ...incomes];

    try {
      localStorage.setItem('agam_pg_tenants', JSON.stringify(updatedTenants));
      localStorage.setItem('agam_pg_payments', JSON.stringify(updatedPayments));
      localStorage.setItem('agam_pg_incomes', JSON.stringify(updatedIncomes));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}

    setTenants(updatedTenants);
    setRentPayments(updatedPayments);
    setIncomes(updatedIncomes);

    saveStateToCloudImmediately({
      rooms,
      tenants: updatedTenants,
      payments: updatedPayments,
      incomes: updatedIncomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

    showToast(`Collected ₹${details.amountPaid.toLocaleString('en-IN')} from ${tenant.name}!`);
  };

  // Toggle Tenant Active / Vacated status
  const handleToggleTenantActive = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;

    const willBeActive = !target.isActive;

    const updatedTenants = tenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          isActive: willBeActive,
          checkOutDate: willBeActive ? undefined : new Date().toISOString().split('T')[0],
        };
      }
      return t;
    });

    // Free or fill bed in room
    const updatedRooms = rooms.map((r) => {
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
    });

    try {
      localStorage.setItem('agam_pg_tenants', JSON.stringify(updatedTenants));
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}

    setTenants(updatedTenants);
    setRooms(updatedRooms);

    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants: updatedTenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

    showToast(willBeActive ? `Reactivated resident ${target.name}` : `${target.name} checked out (vacated).`);
  };

  // Update Tenant Notes
  const handleUpdateTenantNotes = (tenantId: string, notes: string) => {
    const updatedTenants = tenants.map((t) => (t.id === tenantId ? { ...t, notes } : t));
    try {
      localStorage.setItem('agam_pg_tenants', JSON.stringify(updatedTenants));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setTenants(updatedTenants);
    saveStateToCloudImmediately({
      rooms,
      tenants: updatedTenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast('Resident remarks updated.');
  };

  // Update Full Tenant (e.g. Google Drive documents & links)
  const handleUpdateTenant = (updatedTenant: Tenant) => {
    const updatedTenants = tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t));
    try {
      localStorage.setItem('agam_pg_tenants', JSON.stringify(updatedTenants));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setTenants(updatedTenants);
    setSelectedTenant(updatedTenant);
    saveStateToCloudImmediately({
      rooms,
      tenants: updatedTenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Saved Google Drive document links for ${updatedTenant.name}.`);
  };

  // Toggle Room Maintenance
  const handleToggleRoomMaintenance = (
    roomId: string,
    isMaintenance: boolean,
    reason?: string
  ) => {
    const updatedRooms = rooms.map((r) => {
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
    });

    try {
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setRooms(updatedRooms);
    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
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
    const updatedRooms = [...rooms, newRoom];
    try {
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setRooms(updatedRooms);
    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Added Room ${newRoom.number} (${newRoom.capacity} beds @ ₹${newRoom.perBedRent?.toLocaleString('en-IN')}/bed)!`);
  };

  // Edit Room Handler (Price & Capacity up to 10 sharing)
  const handleUpdateRoom = (roomId: string, updatedFields: Partial<Room>) => {
    const updatedRooms = rooms.map((r) => {
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
    });

    try {
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setRooms(updatedRooms);

    // If selected room is currently open in detail modal, update that too
    if (selectedRoom && selectedRoom.id === roomId) {
      setSelectedRoom((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }

    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

    showToast('Room price & sharing capacity updated successfully!');
  };

  // Delete Room Handler (performs the actual deletion)
  const performDeleteRoom = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    const updatedRooms = rooms.filter((r) => r.id !== roomId);
    try {
      localStorage.setItem('agam_pg_rooms', JSON.stringify(updatedRooms));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setRooms(updatedRooms);
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
      setIsRoomDetailOpen(false);
    }
    saveStateToCloudImmediately({
      rooms: updatedRooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Removed Room ${targetRoom?.number || ''} from PG.`);
  };

  // Ask for confirmation before deleting a room
  const handleDeleteRoom = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    setConfirmDialog({
      title: `Delete Room ${targetRoom?.number || ''}?`,
      message:
        'The room will be removed from your PG. Residents assigned to it are kept but will need a new room allocation. This cannot be undone.',
      confirmLabel: 'Delete Room',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        performDeleteRoom(roomId);
      },
    });
  };

  // Add Expense Handler
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    const updatedExpenses = [newExpense, ...expenses];
    try {
      localStorage.setItem('agam_pg_expenses', JSON.stringify(updatedExpenses));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setExpenses(updatedExpenses);
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses: updatedExpenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Logged expense ₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.category}!`);
  };

  // Delete Expense Handler (performs the actual deletion)
  const performDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    try {
      localStorage.setItem('agam_pg_expenses', JSON.stringify(updatedExpenses));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setExpenses(updatedExpenses);
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses: updatedExpenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast('Expense entry removed.');
  };

  // Ask for confirmation before deleting an expense
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setConfirmDialog({
      title: 'Delete this expense?',
      message: target
        ? `“${target.title}” — ₹${target.amount.toLocaleString('en-IN')} will be removed from your ledger. This cannot be undone.`
        : 'This expense entry will be removed from your ledger. This cannot be undone.',
      confirmLabel: 'Delete Expense',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        performDeleteExpense(id);
      },
    });
  };

  // Add Other Income Handler
  const handleAddIncome = (newIncData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...newIncData,
      id: `inc-${Date.now()}`,
    };
    const updatedIncomes = [newIncome, ...incomes];
    try {
      localStorage.setItem('agam_pg_incomes', JSON.stringify(updatedIncomes));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setIncomes(updatedIncomes);
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes: updatedIncomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Recorded income of ₹${newIncome.amount.toLocaleString('en-IN')}!`);
  };

  // Delete Income Handler (performs the actual deletion)
  const performDeleteIncome = (id: string) => {
    const updatedIncomes = incomes.filter((i) => i.id !== id);
    try {
      localStorage.setItem('agam_pg_incomes', JSON.stringify(updatedIncomes));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    setIncomes(updatedIncomes);
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes: updatedIncomes,
      expenses,
      maintenanceTickets,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast('Income entry removed.');
  };

  // Ask for confirmation before deleting an income
  const handleDeleteIncome = (id: string) => {
    const target = incomes.find((i) => i.id === id);
    setConfirmDialog({
      title: 'Delete this income?',
      message: target
        ? `“${target.title}” — ₹${target.amount.toLocaleString('en-IN')} will be removed from your ledger. This cannot be undone.`
        : 'This income entry will be removed from your ledger. This cannot be undone.',
      confirmLabel: 'Delete Income',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        performDeleteIncome(id);
      },
    });
  };

  // Add Maintenance Ticket
  const handleAddTicket = (ticket: MaintenanceTicket) => {
    const updated = [ticket, ...maintenanceTickets];
    setMaintenanceTickets(updated);
    try {
      localStorage.setItem('agam_pg_tickets', JSON.stringify(updated));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets: updated,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Logged repair ticket for Room ${ticket.roomNumber}!`);
  };

  const handleUpdateTicketStatus = (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
    const updated = maintenanceTickets.map((t) => (t.id === id ? { ...t, status } : t));
    setMaintenanceTickets(updated);
    try {
      localStorage.setItem('agam_pg_tickets', JSON.stringify(updated));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets: updated,
      staffContacts,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast(`Repair ticket marked as ${status}!`);
  };

  // Staff Handlers
  const handleAddStaff = (staffData: Omit<StaffContact, 'id'>, editId?: string) => {
    let updatedStaff: StaffContact[];
    if (editId) {
      updatedStaff = staffContacts.map((s) => (s.id === editId ? { ...staffData, id: editId } : s));
      showToast(`Updated contact for ${staffData.name}!`);
    } else {
      const newStaff: StaffContact = {
        ...staffData,
        id: `staff-${Date.now()}`,
      };
      updatedStaff = [newStaff, ...staffContacts];
      showToast(`Added ${staffData.name} (${staffData.role}) to phone book!`);
    }
    setStaffContacts(updatedStaff);
    try {
      localStorage.setItem('agam_pg_staff', JSON.stringify(updatedStaff));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts: updatedStaff,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
  };

  const performDeleteStaff = (id: string) => {
    const updatedStaff = staffContacts.filter((s) => s.id !== id);
    setStaffContacts(updatedStaff);
    try {
      localStorage.setItem('agam_pg_staff', JSON.stringify(updatedStaff));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}
    saveStateToCloudImmediately({
      rooms,
      tenants,
      payments: rentPayments,
      incomes,
      expenses,
      maintenanceTickets,
      staffContacts: updatedStaff,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });
    showToast('Contact removed from phone book.');
  };

  // Ask for confirmation before removing a staff contact
  const handleDeleteStaff = (id: string) => {
    const target = staffContacts.find((s) => s.id === id);
    setConfirmDialog({
      title: 'Remove this contact?',
      message: target
        ? `${target.name} (${target.role}) will be removed from your staff phone book. This cannot be undone.`
        : 'This contact will be removed from your staff phone book. This cannot be undone.',
      confirmLabel: 'Remove Contact',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        performDeleteStaff(id);
      },
    });
  };

  // Restore Full PG Backup Handler (performs the actual restore)
  const performRestoreBackup = (backupData: any) => {
    if (!backupData) return;
    const r = backupData.rooms && Array.isArray(backupData.rooms) ? backupData.rooms : rooms;
    const t = backupData.tenants && Array.isArray(backupData.tenants) ? backupData.tenants : tenants;
    const p = backupData.rentPayments && Array.isArray(backupData.rentPayments) ? backupData.rentPayments : rentPayments;
    const exp = backupData.expenses && Array.isArray(backupData.expenses) ? backupData.expenses : expenses;
    const inc = backupData.incomes && Array.isArray(backupData.incomes) ? backupData.incomes : incomes;
    const sc = backupData.staffContacts && Array.isArray(backupData.staffContacts) ? backupData.staffContacts : staffContacts;
    const mt = backupData.maintenanceTickets && Array.isArray(backupData.maintenanceTickets) ? backupData.maintenanceTickets : maintenanceTickets;

    setRooms(r);
    setTenants(t);
    setRentPayments(p);
    setExpenses(exp);
    setIncomes(inc);
    setStaffContacts(sc);
    setMaintenanceTickets(mt);

    try {
      localStorage.setItem('agam_pg_rooms', JSON.stringify(r));
      localStorage.setItem('agam_pg_tenants', JSON.stringify(t));
        localStorage.setItem('agam_pg_payments', JSON.stringify(p));
      localStorage.setItem('agam_pg_expenses', JSON.stringify(exp));
      localStorage.setItem('agam_pg_incomes', JSON.stringify(inc));
      localStorage.setItem('agam_pg_staff', JSON.stringify(sc));
      localStorage.setItem('agam_pg_tickets', JSON.stringify(mt));
      localStorage.setItem('agam_pg_last_updated', new Date().toISOString());
    } catch (e) {}

    saveStateToCloudImmediately({
      rooms: r,
      tenants: t,
      payments: p,
      incomes: inc,
      expenses: exp,
      maintenanceTickets: mt,
      staffContacts: sc,
      notices,
      whatsappTemplates: whatsAppTemplates,
    });

    showToast('Successfully restored all PG data!');
  };

  // Ask for confirmation before replacing current data with a backup
  const handleRestoreBackup = (backupData: any) => {
    if (!backupData) return;
    setConfirmDialog({
      title: 'Restore this backup?',
      message:
        'Your current rooms, residents, payments and ledgers will be replaced by the backup contents. This cannot be undone.',
      confirmLabel: 'Restore Backup',
      danger: true,
      onConfirm: () => {
        setConfirmDialog(null);
        performRestoreBackup(backupData);
      },
    });
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

  // Live Reconciled Room Occupancy derived from Active Tenants
  // Guarantees room 101, amar, or any other tenant is dynamically counted and never out of sync!
  const computedRooms = useMemo(() => {
    return rooms.map((room) => {
      const activeOccupants = tenants.filter(
        (t) => t.isActive && Number(t.roomNumber) === Number(room.number)
      );
      const occupantNames = activeOccupants.map((t) => t.name.split(' ')[0]);
      const occupiedCount = activeOccupants.length;
      const status =
        room.status === 'maintenance'
          ? 'maintenance'
          : occupiedCount >= room.capacity
          ? 'full'
          : occupiedCount > 0
          ? 'partial'
          : 'empty';

      return {
        ...room,
        occupied: occupiedCount,
        occupants: occupantNames,
        status,
      };
    });
  }, [rooms, tenants]);

  // Keep selectedRoom updated in real-time if open in modal
  const activeSelectedRoom = useMemo(() => {
    if (!selectedRoom) return null;
    return computedRooms.find((r) => r.id === selectedRoom.id) || selectedRoom;
  }, [selectedRoom, computedRooms]);

  // Boot splash while the first cloud/local hydration is in progress
  if (isBootLoading) {
    return (
      <div className="bg-slate-100/70 min-h-screen flex flex-col items-center justify-center gap-5">
        <AgamLogo size="lg" variant="full" />
        <div className="w-11 h-11 rounded-full border-4 border-emerald-200 border-t-[#0a332c] animate-spin" />
        <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          Loading your PG data…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/70 min-h-screen text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-[96px]">
      {/* Top App Bar */}
      <TopAppBar
        currentTab={currentTab}
        onOpenSideDrawer={() => setIsDrawerOpen(true)}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Canvas Area */}
      <main className="pt-[68px] pb-6 min-h-[calc(100vh-148px)]">
        {currentTab === 'home' && (
          <HomeScreen
            rooms={computedRooms}
            tenants={tenants}
            expenses={expenses}
            incomes={incomes}
            onNavigate={handleNavigate}
            onAddTenant={() => openAddTenantModal()}
            onAddRoom={() => setIsAddRoomOpen(true)}
            onCollectRent={() => {
              setSelectedTenantForCollect(null);
              setSelectedPaymentForCollect(null);
              setIsCollectRentOpen(true);
            }}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenAlertModal={(type) => {
              setAlertType(type);
              setIsActionRequiredOpen(true);
            }}
          />
        )}

        {currentTab === 'rooms' && (
          <RoomsScreen
            rooms={computedRooms}
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
            onAddTenantToRoom={(roomNumber) => openAddTenantModal(roomNumber)}
          />
        )}

        {currentTab === 'people' && (
          <PeopleScreen
            tenants={tenants}
            initialFilter={peopleFilter}
            onSelectTenant={(tenant) => {
              setSelectedTenant(tenant);
              setIsTenantDetailOpen(true);
            }}
            onAddTenant={() => openAddTenantModal()}
            onCollectRent={(tenantId) => {
              const t = tenants.find((item) => item.id === tenantId);
              if (t) {
                setSelectedTenantForCollect(t);
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
              const matchedTenant = tenants.find(
                (item) => item.id === payment.tenantId || item.name.toLowerCase() === payment.tenantName.toLowerCase()
              );
              setSelectedTenantForCollect(matchedTenant || null);
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
            onAddTicket={handleAddTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onAddStaff={handleAddStaff}
            onDeleteStaff={handleDeleteStaff}
            onRestoreBackup={handleRestoreBackup}
            onResetData={handleResetData}
            onSyncCloudSql={handleSyncCloudSql}
            isSyncingCloudSql={isSyncingCloudSql}
          />
        )}
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-[96px] left-1/2 -translate-x-1/2 z-50 bg-[#0a332c] text-white text-[13px] font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
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
        onAddTenant={() => openAddTenantModal()}
        onAddRoom={() => setIsAddRoomOpen(true)}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenWhatsAppTemplates={() => setIsWhatsAppTemplatesOpen(true)}
      />

      {/* Modals */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={closeAddTenantModal}
        onAddTenant={handleAddTenant}
        rooms={rooms}
        defaultRoomNumber={addTenantDefaultRoom}
      />

      <CollectRentModal
        isOpen={isCollectRentOpen}
        onClose={() => {
          setIsCollectRentOpen(false);
          setSelectedTenantForCollect(null);
          setSelectedPaymentForCollect(null);
        }}
        tenants={tenants}
        initialTenantId={selectedTenantForCollect?.id}
        initialPayment={selectedPaymentForCollect}
        onConfirmPayment={handleConfirmPayment}
      />

      <RoomDetailModal
        isOpen={isRoomDetailOpen}
        onClose={() => setIsRoomDetailOpen(false)}
        room={activeSelectedRoom}
        tenants={tenants}
        onAddTenantToRoom={(roomNumber) => openAddTenantModal(roomNumber)}
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
          setSelectedTenantForCollect(tenant);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
        onToggleActiveStatus={handleToggleTenantActive}
        onUpdateTenantNotes={handleUpdateTenantNotes}
        onSendWhatsApp={handleSendWhatsApp}
        onUpdateTenant={handleUpdateTenant}
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
          setSelectedTenantForCollect(t);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
      />

      {/* WhatsApp Message Template Studio */}
      <WhatsAppTemplateModal
        isOpen={isWhatsAppTemplatesOpen}
        onClose={() => setIsWhatsAppTemplatesOpen(false)}
        templates={whatsAppTemplates}
        onSaveTemplate={handleSaveWhatsAppTemplate}
        onDeleteTemplate={handleDeleteWhatsAppTemplate}
      />

      {/* Destructive Action Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDialog}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmLabel={confirmDialog?.confirmLabel}
        danger={confirmDialog?.danger}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}
