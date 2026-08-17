// Google Workspace OAuth & Identity Services Integration
import firebaseConfig from '../../firebase-applet-config.json';

export interface WorkspaceUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
}

// Scopes for Google Workspace APIs
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

const SCOPES_STRING = WORKSPACE_SCOPES.join(' ');
const STORAGE_KEY_TOKEN = 'agam_pg_workspace_access_token';
const STORAGE_KEY_USER = 'agam_pg_workspace_user';
const STORAGE_KEY_EXPIRES = 'agam_pg_workspace_token_expires';

// Internal state
let cachedAccessToken: string | null = null;
let cachedUser: WorkspaceUser | null = null;
const authListeners: Array<(user: WorkspaceUser | null, token: string | null) => void> = [];

// Initialize from localStorage
try {
  const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  const savedUser = localStorage.getItem(STORAGE_KEY_USER);
  const savedExpires = localStorage.getItem(STORAGE_KEY_EXPIRES);

  if (savedToken && savedExpires && Date.now() < Number(savedExpires)) {
    cachedAccessToken = savedToken;
    if (savedUser) {
      cachedUser = JSON.parse(savedUser);
    }
  }
} catch (e) {
  console.warn('Could not read cached workspace auth:', e);
}

// Mock auth object to maintain full backward compatibility with Firebase User interface
export const auth: {
  currentUser: WorkspaceUser | null;
} = {
  get currentUser() {
    return cachedUser;
  },
};

export const googleAuthProvider = {
  addScope: (scope: string) => {},
  setCustomParameters: (params: any) => {},
};

export const initAuth = (
  onAuthSuccess?: (user: any, accessToken: string | null, idToken: string | null) => void,
  onAuthFailure?: () => void
) => {
  const listener = (user: WorkspaceUser | null, token: string | null) => {
    if (user && token) {
      if (onAuthSuccess) onAuthSuccess(user, token, token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };

  authListeners.push(listener);

  // Trigger immediately if we already have a valid session
  if (cachedUser && cachedAccessToken) {
    listener(cachedUser, cachedAccessToken);
  }

  // Return unsubscribe function
  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
};

function notifyListeners() {
  authListeners.forEach((fn) => fn(cachedUser, cachedAccessToken));
}

// Helper to wait for Google Identity Services SDK to load in window
function waitForGIS(timeoutMs: number = 4000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      return resolve((window as any).google.accounts.oauth2);
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve((window as any).google.accounts.oauth2);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Google Identity Services library failed to load. Please check your internet connection.'));
      }
    }, 100);
  });
}

export const googleSignIn = async (): Promise<{
  user: WorkspaceUser;
  accessToken: string;
  idToken: string;
}> => {
  try {
    const oauth2 = await waitForGIS();
    const clientId =
      (firebaseConfig as any).oAuthClientId ||
      '325618578567-poc4k4crh2dp18hrnhog1nlc0nle3lu3.apps.googleusercontent.com';

    return new Promise((resolve, reject) => {
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES_STRING,
        prompt: 'consent',
        callback: async (response: any) => {
          if (response.error) {
            console.error('GIS token error:', response);
            return reject(new Error(response.error_description || response.error));
          }

          if (!response.access_token) {
            return reject(new Error('No access token received from Google.'));
          }

          const token = response.access_token;
          cachedAccessToken = token;

          // Compute expiry (usually 3599 seconds)
          const expiresInMs = (Number(response.expires_in) || 3600) * 1000;
          const expiresAt = Date.now() + expiresInMs;

          // Fetch user profile info from Google UserInfo endpoint
          let userObj: WorkspaceUser = {
            uid: 'workspace-user',
            displayName: 'PG Administrator',
            email: 'admin@agampg.com',
            photoURL: null,
            getIdToken: async () => token,
          };

          try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.ok) {
              const info = await profileRes.json();
              userObj = {
                uid: info.sub || info.id || 'workspace-user',
                displayName: info.name || info.email?.split('@')[0] || 'PG Administrator',
                email: info.email || 'admin@agampg.com',
                photoURL: info.picture || null,
                getIdToken: async () => token,
              };
            }
          } catch (profileErr) {
            console.warn('Could not fetch user profile details:', profileErr);
          }

          cachedUser = userObj;

          try {
            localStorage.setItem(STORAGE_KEY_TOKEN, token);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
            localStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt.toString());
          } catch (e) {
            console.warn('Error saving to localStorage:', e);
          }

          notifyListeners();

          resolve({
            user: userObj,
            accessToken: token,
            idToken: token,
          });
        },
      });

      tokenClient.requestAccessToken();
    });
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  // Check if current cached token is still valid
  const savedExpires = localStorage.getItem(STORAGE_KEY_EXPIRES);
  if (savedExpires && Date.now() > Number(savedExpires) - 60000) {
    // Token is expired or expiring in 1 min
    console.log('Access token expired, requesting fresh session...');
  }
  return cachedAccessToken;
};

export const getIdToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (cachedAccessToken && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {
        console.log('Access token revoked');
      });
    } catch (e) {
      console.warn('Token revoke warning:', e);
    }
  }

  cachedAccessToken = null;
  cachedUser = null;

  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
  } catch (e) {
    console.warn('Error clearing localStorage:', e);
  }

  notifyListeners();
};
