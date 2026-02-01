import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '@mfe/auth-sdk';
import './App.css';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="react-remote">
      <div className="remote-header">
        <div className="header-content">
          <div className="header-title">
            <span className="react-logo">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="2.5" fill="#61dafb"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1" transform="rotate(120 12 12)"/>
              </svg>
            </span>
            <h2>React Remote</h2>
          </div>
          {user && (
            <div className="user-badge">
              {user.picture ? (
                <img src={user.picture} alt={user.name || user.username} className="user-avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="user-initial">{(user.name || user.username).charAt(0).toUpperCase()}</span>
              )}
              <span className="user-name">{user.name || user.username}</span>
            </div>
          )}
        </div>
      </div>

      <nav className="remote-nav">
        <NavLink to="" end className="nav-link">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Home
        </NavLink>
        <NavLink to="dashboard" className="nav-link">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="settings" className="nav-link">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </NavLink>
      </nav>

      <div className="remote-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>Welcome to React Remote</h1>
        <p>A standalone React 19 application seamlessly integrated via Module Federation</p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon react-icon">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)"/>
              <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)"/>
            </svg>
          </div>
          <h3>React 19</h3>
          <p>Built with the latest React featuring improved performance and concurrent features</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon ts-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
            </svg>
          </div>
          <h3>TypeScript</h3>
          <p>Full TypeScript support with type-safe components and strict checking</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon webpack-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 0L2.5 5.5v13L12 24l9.5-5.5v-13L12 0zm7.5 16.5L12 20.5l-7.5-4v-9L12 3.5l7.5 4v9z"/>
              <path d="M12 6.5L6.5 10v6L12 19.5l5.5-3.5v-6L12 6.5zm4 8.5l-4 2.5-4-2.5v-5L12 8l4 2.5v5z"/>
            </svg>
          </div>
          <h3>Webpack 5</h3>
          <p>Module Federation with Webpack 5 for seamless micro-frontend integration</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon router-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0-6v6"/>
            </svg>
          </div>
          <h3>React Router</h3>
          <p>Declarative routing with nested routes and seamless navigation</p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, revenue: 0, orders: 0, conversion: 0 });

  useEffect(() => {
    const targets = { users: 2847, revenue: 84521, orders: 1293, conversion: 4.7 };
    const duration = 1000;
    const steps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      setStats({
        users: Math.round(targets.users * eased),
        revenue: Math.round(targets.revenue * eased),
        orders: Math.round(targets.orders * eased),
        conversion: Math.round(targets.conversion * eased * 10) / 10,
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const activities = [
    { type: 'success', text: 'New subscription activated', time: '1 min ago' },
    { type: 'info', text: 'User profile updated', time: '4 min ago' },
    { type: 'warning', text: 'API rate limit warning', time: '8 min ago' },
    { type: 'success', text: 'Payment processed', time: '15 min ago' },
    { type: 'info', text: 'Report generated', time: '22 min ago' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Real-time metrics and analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.users.toLocaleString()}</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-trend positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            +18.2%
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">${stats.revenue.toLocaleString()}</span>
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-trend positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            +12.5%
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.orders.toLocaleString()}</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-trend positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            +31.4%
          </div>
        </div>

        <div className="stat-card conversion">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.conversion}%</span>
            <span className="stat-label">Conversion</span>
          </div>
          <div className="stat-trend negative">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
            </svg>
            -1.8%
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-dot ${activity.type}`}></div>
              <div className="activity-content">
                <span className="activity-text">{activity.text}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    username: 'ReactUser',
    email: 'react@example.com',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    theme: 'system',
  });
  const [showToast, setShowToast] = useState(false);

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'system', name: 'System', icon: '💻' },
  ];

  const saveSettings = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const resetSettings = () => {
    setSettings({
      username: 'ReactUser',
      email: 'react@example.com',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: 'system',
    });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences and account settings</p>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profile Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            Notifications
          </h2>

          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Email Notifications</span>
                <span className="toggle-desc">Receive updates via email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Push Notifications</span>
                <span className="toggle-desc">Browser push notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Marketing Emails</span>
                <span className="toggle-desc">News and promotional content</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
            Appearance
          </h2>

          <div className="theme-selector">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${settings.theme === theme.id ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, theme: theme.id })}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn-secondary" onClick={resetSettings}>Reset to Default</button>
        <button className="btn-primary" onClick={saveSettings}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
          Save Changes
        </button>
      </div>

      {showToast && (
        <div className="toast">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Settings saved successfully!
        </div>
      )}
    </div>
  );
}
