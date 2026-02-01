import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '@mfe/auth-sdk';
import './App.css';

export default function App() {
  const { user, token } = useAuth();
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setTimeout(() => {
      setData(['Item 1', 'Item 2', 'Item 3']);
    }, 500);
  };

  return (
    <div className="react-remote">
      <div className="remote-header">
        <h2>⚛️ React Remote Application</h2>
        <p>Logged in as: <strong>{user?.username}</strong></p>
      </div>

      <nav className="remote-nav">
        <Link to="">Home</Link>
        <Link to="dashboard">Dashboard</Link>
        <Link to="settings">Settings</Link>
      </nav>

      <div className="remote-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage data={data} />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <h3>React Remote Home</h3>
      <p>This is a standalone React application loaded as a remote module.</p>
    </div>
  );
}

function DashboardPage({ data }: { data: string[] }) {
  return (
    <div>
      <h3>Dashboard</h3>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h3>Settings</h3>
      <p>Configure your preferences here.</p>
    </div>
  );
}