import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

// The OAuth client ID that GIS tokens must have been issued to. Tokens minted
// for any other application are rejected.
const EXPECTED_AUDIENCE: string | undefined = (firebaseConfig as any).oAuthClientId;

export interface VerifiedGoogleUser {
  uid: string;
  email: string;
  name?: string;
}

/**
 * Verifies a Google OAuth 2.0 ACCESS token (as issued by Google Identity
 * Services, which is what the app's sign-in flow produces) against Google's
 * tokeninfo endpoint. Returns the verified user identity or null.
 */
async function verifyGoogleAccessToken(token: string): Promise<VerifiedGoogleUser | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return null;

    const info: any = await res.json();
    if (!info || !info.sub) return null;

    // Reject tokens issued to a different OAuth client.
    if (EXPECTED_AUDIENCE && info.aud && info.aud !== EXPECTED_AUDIENCE) {
      console.warn('Google access token audience mismatch:', info.aud);
      return null;
    }

    // Reject expired tokens.
    if (info.expires_in !== undefined && Number(info.expires_in) <= 0) return null;

    return {
      uid: String(info.sub),
      email: info.email || '',
      name: info.name || undefined,
    };
  } catch (error) {
    console.error('Google access token verification failed:', error);
    return null;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1) Firebase ID token (used if the app ever adopts Firebase Auth sign-in).
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch {
    // Not a Firebase ID token (or admin credentials unavailable) — fall through.
  }

  // 2) Google OAuth access token (GIS) — what this app actually issues.
  const googleUser = await verifyGoogleAccessToken(token);
  if (googleUser) {
    req.user = {
      uid: googleUser.uid,
      email: googleUser.email,
      name: googleUser.name,
    } as unknown as DecodedIdToken;
    return next();
  }

  console.error('Auth failed: token is neither a valid Firebase ID token nor a Google access token');
  return res.status(401).json({ error: 'Unauthorized: Invalid ID token' });
};
