import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { PlaceOrderPage } from './components/PlaceOrderPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';

// Import additional components that will be created
import { BulkOrderPage } from './components/BulkOrderPage';
import { DeviceManagementPage } from './components/DeviceManagementPage';
import { UserManagementPage } from './components/UserManagementPage';
import { OrderManagementPage } from './components/OrderManagementPage';
import { TechnicianManagementPage } from './components/TechnicianManagementPage';
import { AnalyticsPage } from './components/AnalyticsPage';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (!state.isAuthenticated) {
      setCurrentPage('login');
    } else if (currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [state.isAuthenticated, currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (!state.isAuthenticated) {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'place-order':
        return <PlaceOrderPage onNavigate={handleNavigate} />;
      case 'order-tracking':
        return <OrderTrackingPage onNavigate={handleNavigate} />;
      case 'bulk-order':
        return <BulkOrderPage onNavigate={handleNavigate} />;
      case 'device-management':
        return <DeviceManagementPage onNavigate={handleNavigate} />;
      case 'user-management':
        return <UserManagementPage onNavigate={handleNavigate} />;
      case 'order-management':
        return <OrderManagementPage onNavigate={handleNavigate} />;
      case 'technician-management':
        return <TechnicianManagementPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      state.settings.theme === 'dark' ? 'dark' : ''
    }`}>
      <Navbar onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;