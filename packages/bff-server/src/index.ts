import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3003;

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// In-memory session store (use Redis in production)
const sessions = new Map<string, SessionData>();

// CSRF tokens store
const csrfTokens = new Map<string, string>();

interface SessionData {
  userId: string;
  user: UserData;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  provider: 'google' | 'azure' | 'local';
}

interface UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
}

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// CSRF Protection Middleware
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET requests and login
  if (req.method === 'GET' || req.path === '/api/auth/google') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.cookies['session_id'];

  if (!csrfToken || !sessionId) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (storedToken !== csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Session validation middleware
const validateSession = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    res.clearCookie('session_id');
    return res.status(401).json({ error: 'Session expired' });
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    csrfTokens.delete(sessionId);
    res.clearCookie('session_id');
    return res.status(401).json({ error: 'Session expired' });
  }

  // Attach session to request
  (req as any).session = session;
  next();
};

// Create session and set cookies
const createSession = (res: Response, user: UserData, accessToken: string, provider: 'google' | 'azure' | 'local') => {
  const sessionId = uuidv4();
  const csrfToken = uuidv4();

  const sessionData: SessionData = {
    userId: user.id,
    user,
    accessToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    provider,
  };

  sessions.set(sessionId, sessionData);
  csrfTokens.set(sessionId, csrfToken);

  // Set httpOnly cookie for session
  res.cookie('session_id', sessionId, COOKIE_OPTIONS);

  return { csrfToken, user };
};

// ============================================
// AUTH ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google OAuth - Exchange credential for session
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user: UserData = {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      roles: ['user'],
    };

    // Create session with httpOnly cookie
    const { csrfToken, user: sessionUser } = createSession(res, user, credential, 'google');

    // Return CSRF token and user info (not the access token!)
    res.json({
      success: true,
      csrfToken,
      user: sessionUser,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Get current user (validates session)
app.get('/api/auth/me', validateSession, (req: Request, res: Response) => {
  const session = (req as any).session as SessionData;

  res.json({
    authenticated: true,
    user: session.user,
  });
});

// Get CSRF token (for new sessions or refresh)
app.get('/api/auth/csrf', validateSession, (req: Request, res: Response) => {
  const sessionId = req.cookies['session_id'];
  const csrfToken = csrfTokens.get(sessionId);

  res.json({ csrfToken });
});

// Logout - Clear session and cookies
app.post('/api/auth/logout', csrfProtection, (req: Request, res: Response) => {
  const sessionId = req.cookies['session_id'];

  if (sessionId) {
    sessions.delete(sessionId);
    csrfTokens.delete(sessionId);
  }

  res.clearCookie('session_id', { path: '/' });
  res.json({ success: true });
});

// Refresh session (extend expiry)
app.post('/api/auth/refresh', csrfProtection, validateSession, (req: Request, res: Response) => {
  const sessionId = req.cookies['session_id'];
  const session = sessions.get(sessionId);

  if (session) {
    session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    sessions.set(sessionId, session);
  }

  res.json({ success: true });
});

// ============================================
// PROTECTED API ENDPOINTS (example)
// ============================================

// Example: Get user's data (requires auth)
app.get('/api/user/profile', validateSession, (req: Request, res: Response) => {
  const session = (req as any).session as SessionData;

  res.json({
    user: session.user,
    provider: session.provider,
  });
});

// Example: Protected action (requires CSRF)
app.post('/api/user/settings', csrfProtection, validateSession, (req: Request, res: Response) => {
  const session = (req as any).session as SessionData;

  // In real app, update user settings in database
  res.json({
    success: true,
    message: 'Settings updated',
    userId: session.userId,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    BFF Server Running                         ║
╠══════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                   ║
║  Endpoints:                                                   ║
║    POST /api/auth/google    - Exchange Google token           ║
║    GET  /api/auth/me        - Get current user                ║
║    GET  /api/auth/csrf      - Get CSRF token                  ║
║    POST /api/auth/logout    - Logout                          ║
║    POST /api/auth/refresh   - Refresh session                 ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
