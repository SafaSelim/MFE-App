import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '@mfe/auth-sdk';
import ProtectedRoute from './components/protected-route';
import VueWrapper from './components/vue-wrapper';
import LoginPage from './pages/login-page';

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

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <BrowserRouter>
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
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      ⚛️ React Remote
                    </Link>
                    <Link
                      to="/vue"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      🌟 Vue Remote
                    </Link>
                  </div>
                )}
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user?.username}</span>
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
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-600">
              © 2025 MFE Monorepo - React 19 + Vue 3 + Module Federation
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      <span className="ml-4 text-xl text-gray-700 font-medium">Loading...</span>
    </div>
  );
}

export default App;