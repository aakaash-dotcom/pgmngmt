import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  onSnapshot, 
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Room, 
  Tenant, 
  RentPayment, 
  Income, 
  Expense, 
  MaintenanceTicket, 
  StaffContact, 
  BulkGroup, 
  Notice, 
  WhatsAppTemplate 
} from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Use specified database ID if available
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Enable offline cache persistence where available
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore multi-tab persistence not enabled in multiple tabs.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported by browser.');
      }
    });
  } catch (e) {
    // Ignore in unsupported environments
  }
}

export interface AppSyncData {
  rooms: Room[];
  tenants: Tenant[];
  payments: RentPayment[];
  incomes: Income[];
  expenses: Expense[];
  maintenanceTickets: MaintenanceTicket[];
  staffContacts: StaffContact[];
  bulkGroups: BulkGroup[];
  notices: Notice[];
  whatsappTemplates: WhatsAppTemplate[];
  isDemoReset?: boolean;
  lastUpdated?: string;
  updatedByDeviceId?: string;
}

const GLOBAL_SYNC_DOC_REF = doc(db, 'meta', 'pg_live_state');

// Generate unique device ID for this session to avoid self-echo conflicts
export const getDeviceId = (): string => {
  let devId = localStorage.getItem('agam_pg_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('agam_pg_device_id', devId);
  }
  return devId;
};

// Debounce timer for saving to cloud
let saveTimeout: any = null;
let pendingSaveData: AppSyncData | null = null;

// UI callbacks so the app can show an honest sync status (synced / error)
export interface SyncCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

let syncCallbacks: SyncCallbacks = {};

export const setSyncCallbacks = (callbacks: SyncCallbacks | null) => {
  syncCallbacks = callbacks || {};
};

const isDemoResetDone = () =>
  typeof window !== 'undefined' ? localStorage.getItem('agam_pg_demo_reset_done') === 'true' : true;

export const saveStateToCloudImmediately = async (data: Omit<AppSyncData, 'lastUpdated' | 'updatedByDeviceId'>) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  pendingSaveData = null;
  try {
    const timestamp = new Date().toISOString();
    const payload: AppSyncData = {
      ...data,
      isDemoReset: isDemoResetDone(),
      lastUpdated: timestamp,
      updatedByDeviceId: getDeviceId(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('agam_pg_last_updated', timestamp);
    }
    await setDoc(GLOBAL_SYNC_DOC_REF, payload);
    console.log('⚡ Cloud sync: Force-synced PG data to Firestore immediately at', timestamp);
    syncCallbacks.onSuccess?.();
  } catch (error) {
    console.error('Cloud sync error saving state immediately:', error);
    syncCallbacks.onError?.(error);
  }
};

export const saveStateToCloud = (data: Omit<AppSyncData, 'lastUpdated' | 'updatedByDeviceId'>) => {
  const timestamp = new Date().toISOString();

  const payload: AppSyncData = {
    ...data,
    isDemoReset: isDemoResetDone(),
    lastUpdated: timestamp,
    updatedByDeviceId: getDeviceId(),
  };

  pendingSaveData = payload;
  if (typeof window !== 'undefined') {
    localStorage.setItem('agam_pg_last_updated', timestamp);
  }

  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    if (!pendingSaveData) return;
    const toSave = pendingSaveData;
    pendingSaveData = null;
    try {
      await setDoc(GLOBAL_SYNC_DOC_REF, toSave);
      console.log('⚡ Cloud sync: Successfully synchronized latest PG data to Firestore.');
      syncCallbacks.onSuccess?.();
    } catch (error) {
      console.error('Cloud sync error saving state:', error);
      syncCallbacks.onError?.(error);
    }
  }, 250); // 250ms fast debounce
};

// Flush pending save immediately on page unload, visibility change or route change (essential on mobile)
if (typeof window !== 'undefined') {
  const flushSave = () => {
    if (pendingSaveData) {
      setDoc(GLOBAL_SYNC_DOC_REF, pendingSaveData).catch(() => {});
    }
  };
  window.addEventListener('beforeunload', flushSave);
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushSave();
    }
  });
}

export const fetchInitialCloudData = async (): Promise<AppSyncData | null> => {
  try {
    // Attempt fetching directly from server first to prevent stale local cache
    const snap = await getDocFromServer(GLOBAL_SYNC_DOC_REF);
    if (snap.exists()) {
      return snap.data() as AppSyncData;
    }
  } catch (serverErr) {
    console.warn('Could not fetch from server directly, falling back to cache:', serverErr);
    try {
      const snap = await getDoc(GLOBAL_SYNC_DOC_REF);
      if (snap.exists()) {
        return snap.data() as AppSyncData;
      }
    } catch (e) {
      console.warn('Could not load initial cloud state:', e);
    }
  }
  return null;
};

// Robust helper to merge local and remote arrays without losing items
export function mergeUniqueById<T extends Record<string, any>>(
  localList: T[] = [],
  remoteList: T[] = [],
  idKey: keyof T = 'id'
): T[] {
  const map = new Map<string, T>();

  // Add all remote items first
  for (const item of remoteList) {
    if (item && item[idKey]) {
      map.set(String(item[idKey]), item);
    }
  }

  // Overlay local items
  for (const item of localList) {
    if (item && item[idKey]) {
      const key = String(item[idKey]);
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        // Keep the one with more data or newer info
        map.set(key, { ...map.get(key)!, ...item });
      }
    }
  }

  return Array.from(map.values());
}

export const subscribeToCloudUpdates = (
  onRemoteChange: (data: AppSyncData) => void
): (() => void) => {
  try {
    const unsubscribe = onSnapshot(
      GLOBAL_SYNC_DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as AppSyncData;
          // Notify listener if update was produced
          onRemoteChange(cloudData);
        }
      },
      (error) => {
        console.warn('Firestore live listener error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to cloud updates:', err);
    return () => {};
  }
};
