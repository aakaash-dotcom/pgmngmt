import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
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

export const saveStateToCloud = (data: Omit<AppSyncData, 'lastUpdated' | 'updatedByDeviceId'>) => {
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    try {
      const payload: AppSyncData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        updatedByDeviceId: getDeviceId(),
      };
      await setDoc(GLOBAL_SYNC_DOC_REF, payload, { merge: true });
      console.log('⚡ Cloud sync: Successfully synchronized latest PG data to Firestore.');
    } catch (error) {
      console.error('Cloud sync error saving state:', error);
    }
  }, 1000); // 1-second debounce to batch rapid changes
};

export const fetchInitialCloudData = async (): Promise<AppSyncData | null> => {
  try {
    const snap = await getDoc(GLOBAL_SYNC_DOC_REF);
    if (snap.exists()) {
      return snap.data() as AppSyncData;
    }
  } catch (error) {
    console.warn('Could not load initial cloud state:', error);
  }
  return null;
};

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
