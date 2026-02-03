# MFE Monorepo

A **Micro Frontend (MFE) Monorepo** demonstrating Module Federation across React and Vue frameworks with shared authentication.

**Live Demo:** [https://SafaSelim.github.io/MFE-App](https://SafaSelim.github.io/MFE-App)

---

## Features

- **Module Federation** - Runtime code sharing between independent applications
- **Cross-Framework** - React 19 host consuming both React and Vue 3 remotes
- **Shared Authentication** - Google OAuth SSO with cross-MFE state sync
- **Secure Token Management** - Optional BFF pattern with httpOnly cookies
- **Memory Router Integration** - Vue router inside React router without conflicts
- **GitHub Pages Deployment** - Automated CI/CD with GitHub Actions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    HOST (React 19)                       │    │
│  │                    localhost:3000                        │    │
│  │  ┌─────────────────┐    ┌─────────────────┐            │    │
│  │  │  React Remote   │    │   Vue Remote    │            │    │
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

## Tech Stack

| App | Framework | Bundler | Port |
|-----|-----------|---------|------|
| Host | React 19 + Tailwind | Webpack 5 | 3000 |
| React Remote | React 19 | Webpack 5 | 3001 |
| Vue Remote | Vue 3.4 | Vite 5 | 3002 |
| BFF Server | Express | - | 3003 |
| Auth SDK | TypeScript | - | - |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/SafaSelim/MFE-App.git
cd MFE-App

# Install dependencies
npm install
```

### Environment Setup

Create `.env` in `apps/host/`:

```env
# Google OAuth (required for login)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# BFF Mode (optional - for httpOnly cookie auth)
REACT_APP_USE_BFF=false
REACT_APP_BFF_URL=http://localhost:3003
```

### Development

```bash
# Start all apps concurrently
npm run start:all

# Or start with BFF server (secure mode)
npm run start:all:bff

# Start individual apps
npm run start:host         # http://localhost:3000
npm run start:react-remote # http://localhost:3001
npm run start:vue-remote   # http://localhost:3002
npm run start:bff          # http://localhost:3003
```

### Build

```bash
# Build all apps
npm run build:all

# Clean all build artifacts
npm run clean
```

---

## Project Structure

```
├── apps/
│   ├── host/                 # Main shell application
│   │   ├── src/
│   │   │   ├── components/   # VueWrapper, ProtectedRoute
│   │   │   ├── pages/        # LoginPage, ConflictTestPage
│   │   │   └── App.tsx       # Main app with routing
│   │   └── webpack.config.js
│   │
│   ├── react-remote/         # React micro frontend
│   │   ├── src/
│   │   │   ├── pages/        # Home, Dashboard, Settings
│   │   │   └── App.tsx
│   │   └── webpack.config.js
│   │
│   └── vue-remote/           # Vue micro frontend
│       ├── src/
│       │   ├── views/        # HomePage, DashboardPage, SettingsPage
│       │   └── RemoteApp.ts  # Bridge component for React integration
│       └── vite.config.ts
│
├── packages/
│   ├── auth-sdk/             # Shared authentication library
│   │   └── src/index.ts      # AuthService, BFFAuthService, useAuth
│   │
│   └── bff-server/           # Backend for Frontend (optional)
│       └── src/index.ts      # Express server with httpOnly cookies
│
└── .github/
    └── workflows/
        ├── ci.yml            # PR checks
        └── deploy.yml        # GitHub Pages deployment
```

---

## Key Concepts

### Module Federation

The host app dynamically loads remote applications at runtime:

```javascript
// Webpack Module Federation (React Remote)
new ModuleFederationPlugin({
  name: "reactRemote",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App.tsx",
  },
  shared: { react: { singleton: true } },
})

// Dynamic ESM Import (Vue Remote - Vite)
const remoteEntry = await import('http://localhost:3002/remoteEntry.js');
await remoteEntry.init({});
const factory = await remoteEntry.get('./App');
```

### Cross-MFE Authentication

Authentication state is shared via Custom Events + sessionStorage:

```typescript
// Login triggers event
window.dispatchEvent(new CustomEvent('auth-changed', {
  detail: { user, authenticated: true }
}));

// All MFEs listen
window.addEventListener('auth-changed', (e) => {
  setUser(e.detail.user);
});
```

### Vue in React Integration

Vue apps use memory history to avoid URL conflicts:

```typescript
// Vue uses memory history (not browser history)
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// React syncs URL changes to Vue
vueRouter.push(subPath);
```

---

## Security

### Session Storage Mode (Default)
- Tokens stored in `sessionStorage`
- Cleared when tab closes
- Vulnerable to XSS (demo mode only)

### BFF Mode (Production Recommended)
- Tokens stored server-side
- Browser only receives httpOnly cookie
- CSRF protection enabled
- XSS cannot steal tokens

Enable BFF mode:
```env
REACT_APP_USE_BFF=true
REACT_APP_BFF_URL=http://localhost:3003
```

---

## Deployment

### GitHub Pages (Automatic)

Push to `main` branch triggers automatic deployment via GitHub Actions.

**Required Setup:**
1. Go to repo Settings → Pages → Source: **GitHub Actions**
2. Add secret `GOOGLE_CLIENT_ID` in repo Settings → Secrets

### Manual Deployment

```bash
# Build for production
NODE_ENV=production npm run build:all

# Output in:
# - apps/host/dist/
# - apps/react-remote/dist/
# - apps/vue-remote/dist/
```

---

## Documentation

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Detailed technical documentation
- [ROUTING-CONFLICTS.md](./ROUTING-CONFLICTS.md) - MFE routing best practices
- [IMPLEMENTATION-PROGRESS.md](./IMPLEMENTATION-PROGRESS.md) - Development progress tracker

---

## License

MIT
