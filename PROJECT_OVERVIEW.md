# MFE Monorepo - PROJECT OVERVIEW

This document covers everything implemented in this Micro Frontend project.

---

## 1. PROJECT OVERVIEW

### What We Built
A **Micro Frontend (MFE) Monorepo** demonstrating:
- Module Federation across different frameworks (React + Vue)
- Shared authentication across all micro frontends
- Cross-framework routing and state management
- Google OAuth SSO integration

### Tech Stack
| App | Framework | Bundler | Port |
|-----|-----------|---------|------|
| Host | React 19 | Webpack 5 | 3000 |
| React Remote | React 19 | Webpack 5 | 3001 |
| Vue Remote | Vue 3 | Vite 5 | 3002 |
| Auth SDK | TypeScript | - | - |

---

## 2. MODULE FEDERATION

### What is Module Federation?
Module Federation is a Webpack 5 feature that allows multiple separate builds to form a single application. Each build can be developed and deployed independently.

### Key Concepts

**Host (Container)**
- The main application that loads remote modules
- Defines which remotes to consume
- Our host is a React app on port 3000

**Remote**
- An application that exposes modules for other apps to consume
- Can be built with any framework
- Our remotes: React (3001), Vue (3002)

**Shared Dependencies**
- Libraries shared between host and remotes
- Prevents duplicate loading (e.g., React loaded only once)
- Configured as singletons to avoid version conflicts

### Webpack Configuration (Host)
```javascript
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    reactRemote: "reactRemote@http://localhost:3001/remoteEntry.js",
    vueRemote: "vueRemote@http://localhost:3002/remoteEntry.js",
  },
  shared: {
    react: { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom": { singleton: true },
    vue: { singleton: true },
  },
})
```

### Webpack Configuration (React Remote)
```javascript
new ModuleFederationPlugin({
  name: "reactRemote",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App.tsx",  // What we expose to host
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
})
```

### Vite + Module Federation (Vue Remote)
Used `@module-federation/vite` plugin because Vite doesn't have native Module Federation support.

```typescript
federation({
  name: 'vueRemote',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/RemoteApp.ts',
  },
  shared: {
    vue: { singleton: true },
    'vue-router': { singleton: true },
  },
})
```

### Key Interview Points
- Module Federation enables **runtime integration** (not build-time)
- Each MFE can be **deployed independently**
- Shared dependencies prevent **duplicate loading**
- The `remoteEntry.js` file is the **manifest** that tells the host what's available

---

## 3. CROSS-FRAMEWORK INTEGRATION (Vue in React)

### The Challenge
How do you render a Vue 3 application inside a React application?

### Our Solution: VueWrapper Component

```typescript
// Host loads Vue remote and mounts it
function VueWrapper({ vueModule, basePath }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mount Vue app into the div
    const result = vueModule.mount(containerRef.current, {
      initialPath: '/dashboard',
      onNavigate: (vuePath) => {
        // Sync Vue navigation to React Router
        navigate(basePath + vuePath);
      },
    });

    return () => result.unmount();
  }, []);

  return <div ref={containerRef} />;
}
```

### Vue Remote's Mount Function
```typescript
export function mount(el: HTMLElement, options) {
  // Create Vue app with memory history (not browser history)
  const router = createRouter({
    history: createMemoryHistory(),  // Important!
    routes,
  });

  const app = createApp(AppComponent);
  app.use(router);
  app.mount(el);

  return {
    unmount: () => app.unmount(),
    setPath: (path) => router.push(path),
  };
}
```

### Why Memory History?
- Vue runs **nested inside** React's routing
- If Vue used browser history, it would **conflict** with React Router
- Memory history keeps Vue's routing **internal**
- We manually sync Vue's route changes to React Router

### Key Interview Points
- Use **memory history** for nested routers to avoid conflicts
- The parent app controls the **URL bar**
- Child app communicates route changes via **callbacks**
- This pattern works for any framework combination

---

## 4. AUTHENTICATION & STATE SHARING

### The Challenge
How do you share authentication state across micro frontends built with different frameworks?

### Our Solution: Shared Auth SDK + Custom Events

#### Auth SDK (packages/auth-sdk)
```typescript
export class AuthService {
  static setAuth(token: string, user: User): void {
    // 1. Persist to storage
    sessionStorage.setItem('mfe_auth_token', token);
    sessionStorage.setItem('mfe_user', JSON.stringify(user));

    // 2. Broadcast to all apps
    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { token, user }
    }));
  }

  static logout(): void {
    sessionStorage.removeItem('mfe_auth_token');
    sessionStorage.removeItem('mfe_user');
    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { token: null, user: null }
    }));
  }
}
```

#### React Hook (useAuth)
```typescript
export function useAuth() {
  const [user, setUser] = useState(AuthService.getUser());

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setUser(e.detail.user);
    };
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, []);

  return { user, isAuthenticated: !!user, login, logout };
}
```

#### Vue Listener
```typescript
onMounted(() => {
  window.addEventListener('auth-changed', () => {
    user.value = JSON.parse(sessionStorage.getItem('mfe_user'));
  });
});
```

### Why This Works
1. All MFEs run in the **same browser tab**
2. They share the **same window object** (for events)
3. They share the **same sessionStorage** (for persistence)
4. Custom events provide **real-time sync**

### Storage Options Comparison

| Storage | XSS Safe | Persists | Cross-Tab | We Used |
|---------|----------|----------|-----------|---------|
| localStorage | No | Yes | Yes | No |
| sessionStorage | No | Tab only | No | Yes |
| httpOnly Cookie | Yes | Configurable | Yes | No (needs backend) |
| Memory only | Yes | No | No | No |

### Why sessionStorage over localStorage?
- **Auto-cleanup**: Cleared when tab closes (more secure)
- **Tab isolation**: Each tab has separate session
- **Still vulnerable to XSS**: But smaller attack window

### Key Interview Points
- Use **Custom Events** for real-time cross-MFE communication
- Use **shared storage** (sessionStorage/localStorage) for persistence
- All MFEs must use the **same storage keys**
- For production, consider **BFF pattern** (tokens never in browser)

---

## 5. BFF (Backend for Frontend) PATTERN

### What is BFF?
A backend service that sits between your frontend and APIs, handling authentication securely.

### Our Implementation
We created a BFF server at `packages/bff-server` (port 3003):

```
packages/bff-server/
├── src/
│   └── index.ts       # Express server with auth endpoints
├── package.json
└── .env.example
```

### Why BFF is More Secure
```
WITHOUT BFF (sessionStorage mode):
Browser JS ──────────────────────────────> APIs
    │
    └── Token stored in sessionStorage (JS can read it)
        └── XSS attack can steal token!

WITH BFF (httpOnly cookie mode):
Browser ─── httpOnly cookie ───> BFF Server ─── Bearer token ───> APIs
    │                               │
    └── No token in JS!             └── Token stored server-side
        └── XSS cannot steal it         └── In-memory (Redis in production)
```

### BFF Auth Flow (Our Implementation)
```
1. User clicks "Login with Google"
2. Google returns JWT credential to browser
3. Browser POSTs credential to BFF: POST /api/auth/google
4. BFF verifies token with Google Auth Library
5. BFF creates session, stores in memory (Redis in prod)
6. BFF returns:
   - httpOnly cookie with session_id
   - CSRF token (stored in JS memory)
   - User info (non-sensitive, for UI)
7. Subsequent requests:
   - Browser auto-sends httpOnly cookie
   - JS sends CSRF token in header
   - BFF validates both before processing
```

### BFF Endpoints
```
POST /api/auth/google   - Exchange Google token for session
GET  /api/auth/me       - Get current user (validates session)
GET  /api/auth/csrf     - Get fresh CSRF token
POST /api/auth/logout   - Clear session and cookies
POST /api/auth/refresh  - Extend session expiry
```

### Auth SDK Modes
The Auth SDK supports both modes:

```typescript
// Environment config
USE_BFF=false  // Uses sessionStorage (demo mode)
USE_BFF=true   // Uses BFF server with httpOnly cookies

// Usage is the same either way
const { loginWithGoogle, logout, user } = useAuth();
await loginWithGoogle(googleCredential);
```

### CSRF Protection
```typescript
// Every state-changing request needs CSRF token
const response = await fetch('/api/user/settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,  // From login response
  },
  credentials: 'include',  // Include httpOnly cookie
  body: JSON.stringify(data),
});
```

### Running with BFF
```bash
# Start all apps + BFF server
npm run start:all:bff

# Or start BFF separately
npm run start:bff
```

### Key Interview Points
- BFF keeps tokens **server-side** (never in browser JS)
- Browser only has **httpOnly session cookie**
- **XSS attacks cannot steal** httpOnly cookies
- **CSRF tokens** protect against CSRF attacks
- Auth SDK auto-detects mode via `USE_BFF` env var
- Trade-off: More infrastructure, slight latency increase
- **Recommended for production** apps with sensitive data

---

## 6. GOOGLE OAUTH INTEGRATION

### Implementation Steps
1. Install: `@react-oauth/google`, `jwt-decode`
2. Wrap app with `GoogleOAuthProvider`
3. Use `GoogleLogin` component
4. Decode JWT to get user info

### Code Flow
```typescript
// 1. Provider in bootstrap.tsx
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>

// 2. Login component
<GoogleLogin
  onSuccess={(response) => {
    const decoded = jwtDecode(response.credential);
    const user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
    AuthService.setAuth(response.credential, user);
  }}
/>
```

### Key Interview Points
- Google returns a **JWT token** containing user info
- We decode it client-side with `jwt-decode`
- The token is the **credential** for our app
- In production, **verify the token server-side** before trusting it

---

## 7. ROUTING IN MFE

### The Challenge
Multiple apps, each with their own router. How do they coexist?

### Solution 1: Prefixed Routes (Recommended)
```
/react/*  → React Remote handles
/vue/*    → Vue Remote handles
```

Each app has its own **namespace**. No conflicts possible.

### Solution 2: Query Parameter
```
/settings?app=react  → React Settings
/settings?app=vue    → Vue Settings
```

Same URL, different apps based on parameter.

### Routing Conflict Problem
If both apps claim `/settings` without prefix:
- First defined route wins (React Router behavior)
- URL doesn't indicate which app
- Bookmarks become ambiguous

### Our VueWrapper Route Sync
```typescript
// Vue navigates internally
onNavigate: (vuePath) => {
  // Update React Router to match
  const fullPath = '/vue' + vuePath;
  navigate(fullPath, { replace: true });
}

// React Router changes
useEffect(() => {
  // Tell Vue to navigate
  vueRouter.setPath(getSubPath(location.pathname));
}, [location.pathname]);
```

### Key Interview Points
- Use **prefixed routes** to avoid conflicts
- Nested routers should use **memory history**
- **Sync route changes** between parent and child routers
- The host app **owns the URL bar**

---

## 8. MONOREPO STRUCTURE

### Our Structure
```
mfe-monorepo/
├── apps/
│   ├── host/           # Main shell (React + Webpack)
│   ├── react-remote/   # React MFE (Webpack)
│   └── vue-remote/     # Vue MFE (Vite)
├── packages/
│   └── auth-sdk/       # Shared auth library
└── package.json        # Workspace root
```

### NPM Workspaces
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Benefits:
- **Single npm install** for all packages
- **Shared dependencies** hoisted to root
- **Cross-package imports** work seamlessly

### Key Interview Points
- Monorepo enables **code sharing** between MFEs
- Each app can have **different bundlers** (Webpack, Vite)
- Shared packages (auth-sdk) are **framework-agnostic**
- Use `npm workspaces`, `yarn workspaces`, or `pnpm`

---

## 9. CSS HANDLING IN MFE

### The Challenge
Vue remote's CSS wasn't loading when consumed by the host.

### Why It Happened
- Vite extracts CSS to separate files
- Module Federation loads JS, not CSS
- CSS file wasn't being linked

### Our Solution
1. Configure Vite to use predictable CSS filename
2. Manually inject CSS link when Vue app mounts

```typescript
// In Vue's RemoteApp.ts
function injectStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'http://localhost:3002/assets/style.css';
  document.head.appendChild(link);
}

export function mount(el, options) {
  injectStyles();  // Load CSS
  // ... mount Vue app
}
```

### Key Interview Points
- CSS handling differs between bundlers
- Module Federation primarily handles **JS modules**
- May need **manual CSS injection** for cross-bundler setups
- Consider **CSS-in-JS** for easier MFE styling

---

## 10. KEY INTERVIEW QUESTIONS & ANSWERS

### Q: What is Module Federation?
**A:** Module Federation is a Webpack 5 feature that allows multiple independent builds to share code at runtime. Each build can expose modules and consume modules from other builds, enabling true micro frontend architecture where teams can deploy independently.

### Q: How do you share state between MFEs?
**A:** Several approaches:
1. **Custom Events + Storage** (our approach) - Use window events for real-time sync, storage for persistence
2. **Shared State Library** - Redux, Zustand with shared store
3. **URL/Query Params** - State in URL
4. **BFF Pattern** - Server manages state, MFEs just render

### Q: How do you handle authentication in MFE?
**A:**
- **Demo/Simple**: Shared storage (sessionStorage) + Custom Events
- **Production**: BFF pattern with httpOnly cookies
- Key: All MFEs must use the same auth mechanism

### Q: What's the difference between build-time and runtime integration?
**A:**
- **Build-time**: NPM packages, compiled together (tight coupling)
- **Runtime**: Module Federation, loaded at runtime (loose coupling, independent deploys)

### Q: How do you handle routing conflicts?
**A:**
- Use **prefixed routes** (/react/*, /vue/*)
- Or **query params** (/settings?app=react)
- Host app owns the URL, child apps use memory history

### Q: What are the trade-offs of MFE?
**A:**
| Pros | Cons |
|------|------|
| Independent deployments | Increased complexity |
| Team autonomy | Performance overhead |
| Technology flexibility | Shared dependency management |
| Smaller codebases | Cross-app communication challenges |

### Q: Why use sessionStorage over localStorage?
**A:**
- Cleared on tab close (shorter attack window)
- Tab isolation (no cross-tab leakage)
- Still vulnerable to XSS, but more secure than localStorage
- For true security, use httpOnly cookies with BFF

### Q: How does Vue run inside React?
**A:**
1. React renders a container `<div>`
2. Vue's `createApp().mount()` attaches to that div
3. Vue uses memory history (not browser history)
4. Route changes sync via callbacks
5. On unmount, Vue's app is destroyed

---

## 11. COMMANDS REFERENCE

```bash
# Start all apps (without BFF)
npm run start:all

# Start all apps + BFF server (secure mode)
npm run start:all:bff

# Start individual apps
npm run start:host         # Port 3000
npm run start:react-remote # Port 3001
npm run start:vue-remote   # Port 3002
npm run start:bff          # Port 3003 (BFF server)

# Build all
npm run build:all

# Clean
npm run clean
```

---

## 12. QUICK ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    HOST (React)                          │    │
│  │                    localhost:3000                        │    │
│  │  ┌─────────────────┐    ┌─────────────────┐            │    │
│  │  │  React Remote   │    │   Vue Remote    │            │    │
│  │  │  (loaded via MF)│    │  (loaded via MF)│            │    │
│  │  │  localhost:3001 │    │  localhost:3002 │            │    │
│  │  └─────────────────┘    └─────────────────┘            │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────┐           │    │
│  │  │            Auth SDK (shared)            │           │    │
│  │  │  • sessionStorage for persistence       │           │    │
│  │  │  • Custom Events for real-time sync     │           │    │
│  │  └─────────────────────────────────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

Good luck with your interview! Remember:
1. **Module Federation** = Runtime code sharing
2. **Auth sharing** = Storage + Events
3. **Cross-framework** = Memory history + Callbacks
4. **Security** = BFF pattern for production
5. **Routing** = Prefix namespaces to avoid conflicts
