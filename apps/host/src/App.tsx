import { lazy, Suspense, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@mfe/auth-sdk';
import ProtectedRoute from './components/protected-route';
import VueWrapper from './components/vue-wrapper';
import LoginPage from './pages/login-page';

// Context to track which MFE app is "active"
const MFEContext = createContext<{
  activeApp: 'react' | 'vue' | null;
  setActiveApp: (app: 'react' | 'vue' | null) => void;
}>({ activeApp: null, setActiveApp: () => {} });

const useMFEContext = () => useContext(MFEContext);

const ReactRemoteApp = lazy(() => import('reactRemote/App'));

// Vue remote module - loaded via dynamic ESM import (Module Federation v2)
let vueRemoteModule: any = null;
const loadVueRemote = async () => {
  // Dynamic import of Vue remote's remoteEntry as ES module
  // @ts-ignore - dynamic URL import
  const remoteEntry = await import(/* webpackIgnore: true */ 'http://localhost:3002/remoteEntry.js');
  // Initialize the remote container
  await remoteEntry.init({});
  // Get the exposed App module
  const factory = await remoteEntry.get('./App');
  vueRemoteModule = await factory();
  return vueRemoteModule;
};

// Lazy wrapper component for Vue
const VueRemoteLazy = lazy(() =>
  loadVueRemote().then(() => ({
    default: () => <VueWrapper vueModule={vueRemoteModule} basePath="/vue" />,
  }))
);

// Shared route component - decides which app based on query param or context
function SharedRoute() {
  const [searchParams] = useSearchParams();
  const { activeApp } = useMFEContext();

  // Priority: 1. Query param (?app=react), 2. Context, 3. Default to React
  const appParam = searchParams.get('app') as 'react' | 'vue' | null;
  const targetApp = appParam || activeApp || 'react';

  if (targetApp === 'vue') {
    return <VueRemoteLazy />;
  }
  return <ReactRemoteApp />;
}

function App() {
  const [activeApp, setActiveApp] = useState<'react' | 'vue' | null>(null);

  return (
    <MFEContext.Provider value={{ activeApp, setActiveApp }}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MFEContext.Provider>
  );
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const { setActiveApp, activeApp } = useMFEContext();

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navbar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Brand */}
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">M</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    MFE Host
                  </span>
                </Link>

                {/* Navigation Links */}
                {isAuthenticated && (
                  <div className="hidden md:flex space-x-4">
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Home
                    </Link>
                    <Link
                      to="/react"
                      onClick={() => setActiveApp('react')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeApp === 'react' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:text-primary-600'}`}
                    >
                      ⚛️ React Remote
                    </Link>
                    <Link
                      to="/vue"
                      onClick={() => setActiveApp('vue')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeApp === 'vue' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:text-primary-600'}`}
                    >
                      🌟 Vue Remote
                    </Link>
                    <Link
                      to="/conflict"
                      className="text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      ⚠️ Conflict Test
                    </Link>
                  </div>
                )}
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                      {user?.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || user.username}
                          className="w-8 h-8 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold">
                            {user?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{user?.name || user?.username}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePage />} />

              <Route
                path="/react/*"
                element={
                  <ProtectedRoute>
                    <ReactRemoteApp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/vue/*"
                element={
                  <ProtectedRoute>
                    <VueRemoteLazy />
                  </ProtectedRoute>
                }
              />

              {/* Conflict Test Routes - Same path, different remotes */}
              <Route
                path="/conflict"
                element={
                  <ProtectedRoute>
                    <ConflictTestPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared routes - same URL, app decided by ?app= param */}
              <Route
                path="/shared/*"
                element={
                  <ProtectedRoute>
                    <SharedRoute />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-600">
              © 2026 MFE Monorepo - React 19 + Vue 3 + Module Federation
            </p>
          </div>
        </footer>
      </div>
  );
}

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="card text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Micro Frontend Architecture
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Host Application powered by React 19, Tailwind CSS, and Webpack Module Federation
        </p>
        {!isAuthenticated && (
          <Link to="/login" className="btn-primary inline-block">
            Get Started - Login to Access Remote Apps
          </Link>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            React 19
          </h3>
          <p className="text-gray-600">
            Latest React with improved performance and new features
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Vue 3 Remote
          </h3>
          <p className="text-gray-600">
            Vue 3 Composition API with TypeScript and Vite
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Shared Auth
          </h3>
          <p className="text-gray-600">
            Centralized authentication across all micro frontends
          </p>
        </div>
      </div>

      {isAuthenticated && (
        <div className="card bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎉 You're Logged In!
          </h2>
          <p className="text-gray-700 mb-4">
            You can now access remote applications:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/react" className="btn-primary">
              ⚛️ Open React Remote →
            </Link>
            <Link to="/vue" className="btn-secondary">
              🌟 Open Vue Remote →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ConflictTestPage() {
  return (
    <div className="space-y-6">
      <div className="card border-2 border-orange-300 bg-orange-50">
        <h1 className="text-2xl font-bold text-orange-800 mb-4">
          ⚠️ Routing Conflict Test
        </h1>
        <p className="text-orange-700 mb-4">
          This page demonstrates what happens when multiple MFE remotes have the same route paths.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scenario 1 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Scenario 1: Prefixed Routes (Current Setup)
          </h2>
          <p className="text-gray-600 mb-4">
            Routes are namespaced by app prefix. No conflicts possible.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono">/react/settings</span>
              <span className="text-gray-500">→ React Remote</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono">/vue/settings</span>
              <span className="text-gray-500">→ Vue Remote</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/react/settings" className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
              Open React Settings
            </Link>
            <Link to="/vue/settings" className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              Open Vue Settings
            </Link>
          </div>
        </div>

        {/* Scenario 2 */}
        <div className="card border-2 border-yellow-200 bg-yellow-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Scenario 2: Same URL, Different Apps (Query Param)
          </h2>
          <p className="text-gray-600 mb-4">
            Both apps claim <code className="bg-gray-100 px-1 rounded">/shared/settings</code>.
            Use <code className="bg-gray-100 px-1 rounded">?app=react</code> or <code className="bg-gray-100 px-1 rounded">?app=vue</code> to choose.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono">/shared/settings?app=react</span>
              <span className="text-gray-500">→ React Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono">/shared/settings?app=vue</span>
              <span className="text-gray-500">→ Vue Settings</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/shared/settings?app=react" className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
              React Settings
            </Link>
            <Link to="/shared/settings?app=vue" className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              Vue Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card bg-blue-50 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">
          💡 How to Handle Route Conflicts
        </h2>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">1.</span>
            <span><strong>Namespace by prefix</strong> - Use /react/*, /vue/* (recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">2.</span>
            <span><strong>Redirect aliases</strong> - Map /settings → /react/settings for user convenience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">3.</span>
            <span><strong>Central route registry</strong> - Host manages all routes, remotes expose components only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">4.</span>
            <span><strong>Route manifest</strong> - Remotes declare routes, host resolves conflicts at build time</span>
          </li>
        </ul>
      </div>

      {/* Code Example */}
      <div className="card bg-gray-900 text-gray-100">
        <h2 className="text-lg font-semibold text-white mb-3">
          📝 Implementation Code
        </h2>
        <pre className="text-sm overflow-x-auto"><code>{`// SharedRoute component - decides app based on query param
function SharedRoute() {
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get('app'); // 'react' or 'vue'

  if (appParam === 'vue') {
    return <VueRemoteLazy />;
  }
  return <ReactRemoteApp />; // Default
}

// Route definition
<Route path="/shared/*" element={<SharedRoute />} />`}</code></pre>
      </div>

      {/* Alternative Solutions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          🔧 Other Solutions for Route Conflicts
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-700">1. Hash-based</strong>
            <p className="text-gray-600 mt-1">/settings#react vs /settings#vue</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-700">2. Subdomain</strong>
            <p className="text-gray-600 mt-1">react.app.com/settings vs vue.app.com/settings</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-700">3. Session Context</strong>
            <p className="text-gray-600 mt-1">Remember last visited app, use that for /settings</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-700">4. Route Registry</strong>
            <p className="text-gray-600 mt-1">Build-time conflict detection, fail if duplicate routes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      <span className="ml-4 text-xl text-gray-700 font-medium">Loading...</span>
    </div>
  );
}

export default App;