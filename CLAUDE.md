# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Micro Frontend (MFE) monorepo** demonstrating Module Federation across React and Vue frameworks. It uses NPM workspaces to manage three applications and one shared package.

## Development Commands

```bash
# Install all dependencies
npm install

# Start all applications concurrently (recommended for development)
npm run start:all

# Start individual applications
npm run start:host         # Host app on http://localhost:3000
npm run start:react-remote # React remote on http://localhost:3001
npm run start:vue-remote   # Vue remote on http://localhost:3002

# Build all applications
npm run build:all

# Clean all node_modules and dist directories
npm run clean
```

**Important:** When developing, all three apps must be running for Module Federation to work properly.

## Architecture

### Monorepo Structure

```
apps/
├── host/           # React 19 + Webpack - Main shell application (port 3000)
├── react-remote/   # React 19 + Webpack - Remote module (port 3001)
└── vue-remote/     # Vue 3 + Vite - Remote module (port 3002)
packages/
└── auth-sdk/       # Shared authentication library (React hooks + service)
```

### Module Federation Setup

- **Host** (`@mfe/host`): Consumes remote modules, handles routing and authentication
- **React Remote** (`@mfe/react-remote`): Exposes `./App` component via Webpack Module Federation
- **Vue Remote** (`@mfe/vue-remote`): Exposes `./App` component via Vite plugin-federation

Remote entries are loaded from:
- `reactRemote@http://localhost:3001/remoteEntry.js`
- `vueRemote@http://localhost:3002/remoteEntry.js`

### Authentication Flow

The `@mfe/auth-sdk` package provides:
- `AuthService` class for login/logout operations
- `useAuth()` React hook returning `{ token, user, isAuthenticated, login, logout }`
- Uses localStorage for persistence
- Custom events (`auth:login`, `auth:logout`) for cross-app state sync

### Vue-in-React Integration

The host app uses a `VueWrapper` component (`apps/host/src/components/VueWrapper.tsx`) to mount Vue applications inside React. It handles Vue's `createApp` lifecycle within React's component lifecycle.

## Technology Stack

| App | Framework | Bundler | TypeScript |
|-----|-----------|---------|------------|
| Host | React 19 | Webpack 5 | Yes |
| React Remote | React 19 | Webpack 5 | Yes |
| Vue Remote | Vue 3.4 | Vite 5 | Yes |

Additional tooling in Host: Tailwind CSS, PostCSS

## Key Configuration Files

- `apps/host/webpack.config.js` - Host Webpack + Module Federation config
- `apps/host/module-federation.config.ts` - Remote app definitions
- `apps/react-remote/webpack.config.js` - React remote federation config
- `apps/vue-remote/vite.config.ts` - Vue remote federation config (uses `@originjs/vite-plugin-federation`)

## TypeScript Path Aliases

All apps use the alias `@mfe/auth-sdk` pointing to `../../packages/auth-sdk/src` for consistent imports of the shared auth package.

## Notes

- No testing framework is currently configured
- No ESLint/Prettier configuration exists
- The host has an experimental Rspack configuration (`rspack.config.ts`) but primary development uses Webpack
