# Routing Conflicts in Micro Frontends

This document explains routing conflict scenarios in MFE architectures and best practices to avoid them.

---

## Table of Contents
1. [The Problem](#the-problem)
2. [How Routing Works in MFEs](#how-routing-works-in-mfes)
3. [Conflict Scenarios](#conflict-scenarios)
4. [Resolution Strategies](#resolution-strategies)
5. [Best Practices](#best-practices)
6. [Testing Conflicts](#testing-conflicts)

---

## The Problem

When multiple micro frontends are integrated into a single host application, each MFE may define its own routes. If two or more MFEs define the same route path, a **routing conflict** occurs.

### Example Conflict
```
Host App Routes:
├── /react/*     → React Remote
├── /vue/*       → Vue Remote
└── /settings    → Host Settings Page

React Remote Routes:
├── /            → React Home
├── /dashboard   → React Dashboard
└── /settings    → React Settings  ⚠️ CONFLICT if exposed at root

Vue Remote Routes:
├── /            → Vue Home
├── /dashboard   → Vue Dashboard
└── /settings    → Vue Settings    ⚠️ CONFLICT if exposed at root
```

---

## How Routing Works in MFEs

### Host Router (React Router)
The host application uses React Router to handle top-level navigation:

```tsx
<Routes>
  {/* Host-owned routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/conflict" element={<ConflictTestPage />} />

  {/* MFE routes with wildcards */}
  <Route path="/react/*" element={<ReactApp />} />
  <Route path="/vue/*" element={<VueWrapper />} />

  {/* Catch-all */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Remote Router (Memory History)
Remote applications use **memory history** instead of browser history:

```typescript
// Vue Remote - uses memory history
const router = createRouter({
  history: createMemoryHistory(),  // Not createWebHistory()
  routes: [...]
});

// React Remote - internal routing
<MemoryRouter initialEntries={[currentPath]}>
  <Routes>...</Routes>
</MemoryRouter>
```

### Why Memory History?
1. **Avoids URL conflicts** - Remote doesn't directly manipulate browser URL
2. **Host controls navigation** - Single source of truth for URL
3. **Isolation** - Each MFE manages its own routing state internally
4. **Synchronization** - Host syncs browser URL with remote's memory router

---

## Conflict Scenarios

### Scenario 1: Same Route, Different MFEs
**Problem**: Both React and Vue remotes have `/settings`

```
User navigates to: /settings
Question: Which app handles it?
```

**Behavior**: First matching route wins (based on route order in host)

### Scenario 2: MFE Route Shadows Host Route
**Problem**: Host has `/settings`, MFE also exposes `/settings`

```tsx
// Host routes - ORDER MATTERS
<Route path="/settings" element={<HostSettings />} />      // ✅ Wins
<Route path="/react/settings" element={<ReactRemote />} /> // ✅ Different path
<Route path="/*" element={<ReactRemote />} />              // ⚠️ Would shadow if first
```

### Scenario 3: Wildcard Route Catches Everything
**Problem**: Overly broad wildcard routes

```tsx
// BAD: Catches everything, including other MFE routes
<Route path="/*" element={<ReactRemote />} />

// GOOD: Scoped to specific prefix
<Route path="/react/*" element={<ReactRemote />} />
```

### Scenario 4: Nested Route Confusion
**Problem**: Deep linking within MFEs creates URL buildup

```
Expected: /vue/settings
Actual:   /vue/settings/dashboard/settings (keeps appending)
```

**Cause**: Navigation callbacks not properly stripping base paths

---

## Resolution Strategies

### Strategy 1: Namespace Prefixing (Recommended)
Give each MFE a unique URL prefix:

```tsx
<Routes>
  <Route path="/react/*" element={<ReactRemote />} />
  <Route path="/vue/*" element={<VueWrapper />} />
</Routes>
```

**Pros**:
- Clear ownership of routes
- Easy to debug
- No conflicts possible

**Cons**:
- Longer URLs
- Must strip prefix in remote apps

### Strategy 2: Query Parameter Routing
Use query params to identify active MFE:

```tsx
// URL: /dashboard?app=react
// URL: /dashboard?app=vue

<Route
  path="/dashboard"
  element={<SharedRoute />}
/>

function SharedRoute() {
  const [params] = useSearchParams();
  const app = params.get('app');

  if (app === 'vue') return <VueWrapper />;
  return <ReactRemote />;
}
```

**Pros**:
- Clean URLs
- Flexible switching

**Cons**:
- Query params can be lost
- Less intuitive

### Strategy 3: Subdomain Routing
Each MFE gets its own subdomain:

```
react.myapp.com/settings
vue.myapp.com/settings
```

**Pros**:
- Complete isolation
- Independent deployment

**Cons**:
- Complex DNS setup
- CORS configuration needed
- Cookie sharing requires extra config

### Strategy 4: Route Priority Configuration
Define explicit route priorities:

```tsx
const routeConfig = [
  { path: '/settings', priority: 1, component: HostSettings },
  { path: '/react/settings', priority: 2, component: ReactRemote },
  { path: '/vue/settings', priority: 3, component: VueRemote },
];

// Sort by priority and render
const sortedRoutes = routeConfig.sort((a, b) => a.priority - b.priority);
```

---

## Best Practices

### 1. Always Use Prefixes in Production
```tsx
// ✅ Good
<Route path="/react/*" element={<ReactRemote />} />
<Route path="/vue/*" element={<VueWrapper />} />

// ❌ Bad - Conflicts waiting to happen
<Route path="/*" element={<ReactRemote />} />
```

### 2. Document Route Ownership
Create a route registry:

```typescript
// routes-registry.ts
export const ROUTE_OWNERSHIP = {
  '/login': 'host',
  '/profile': 'host',
  '/react/*': 'react-remote',
  '/vue/*': 'vue-remote',
  '/admin/*': 'admin-remote',
};
```

### 3. Use Memory History in Remotes
```typescript
// Vue Remote
createRouter({
  history: createMemoryHistory(),  // ✅ Isolated from browser
  routes
});

// React Remote
<MemoryRouter>  // ✅ Isolated from browser
  <Routes>...</Routes>
</MemoryRouter>
```

### 4. Sync Navigation via Callbacks
```tsx
// Host passes navigation callback to remote
<VueWrapper
  onNavigate={(path) => navigate(`/vue${path}`)}
  basePath="/vue"
/>

// Remote calls callback instead of changing browser URL
function handleClick(path: string) {
  props.onNavigate(path);  // ✅ Host controls URL
}
```

### 5. Strip Base Path in Remotes
```typescript
// In VueWrapper
const vueInternalPath = location.pathname.replace('/vue', '') || '/';
vueRouter.push(vueInternalPath);
```

### 6. Avoid Stale Closures
Use refs for navigation callbacks:

```tsx
const navigateRef = useRef(navigate);
useEffect(() => {
  navigateRef.current = navigate;
}, [navigate]);

// In callback
onNavigate: (path) => {
  navigateRef.current(path);  // ✅ Always current
}
```

### 7. Handle 404s Gracefully
```tsx
<Routes>
  <Route path="/react/*" element={<ReactRemote />} />
  <Route path="/vue/*" element={<VueWrapper />} />
  <Route path="*" element={<NotFoundPage />} />  // ✅ Catch-all last
</Routes>
```

---

## Testing Conflicts

### Test Case 1: Direct URL Access
1. Navigate directly to `/settings` in browser
2. Verify correct app handles the route
3. Check no console errors

### Test Case 2: In-App Navigation
1. Click links within MFE
2. Verify URL updates correctly
3. Verify no URL "buildup" (e.g., `/vue/settings/settings`)

### Test Case 3: Browser Back/Forward
1. Navigate through multiple routes
2. Press browser back button
3. Verify correct page displays
4. Press forward button
5. Verify navigation works correctly

### Test Case 4: Refresh on Deep Route
1. Navigate to `/vue/dashboard/details`
2. Press refresh
3. Verify same page loads
4. Verify MFE state is preserved (or gracefully reset)

### Test Page in This Project
Visit `/conflict` in the host app to see a demonstration of:
- First-match-wins behavior
- Query parameter routing
- Prefix vs non-prefix routes

---

## Summary

| Strategy | Complexity | Isolation | URL Cleanliness |
|----------|------------|-----------|-----------------|
| Namespace Prefixing | Low | High | Medium |
| Query Parameters | Low | Medium | High |
| Subdomain Routing | High | Very High | High |
| Priority Config | Medium | Medium | High |

**Recommendation**: Use **namespace prefixing** for most cases. It's simple, explicit, and prevents conflicts by design.

---

## Related Files in This Project

- `apps/host/src/App.tsx` - Host routing configuration
- `apps/host/src/components/vue-wrapper.tsx` - Vue integration with route sync
- `apps/vue-remote/src/RemoteApp.ts` - Memory history setup
- `apps/host/src/pages/conflict-test-page.tsx` - Conflict demonstration
