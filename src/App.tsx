import React, { useState, useEffect } from "react";
import { AppProvider, useApp, useCurrentTheme } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./components/LoginPage";
import { ClientDashboard } from "./client/components/ClientDashboard";
import { EnterpriseDashboard } from "./enterprise/components/EnterpriseDashboard";
import { AdminDashboard } from "./admin/components/AdminDashboard";
import { PlaceOrderPage } from "./client/components/PlaceOrderPage";
import { OrderTrackingPage } from "./client/components/OrderTrackingPage";
import { ClientReportsPage } from "./client/components/ClientReportsPage";
import { EnterpriseReportsPage } from "./enterprise/components/EnterpriseReportsPage";
import { SettingsPage } from "./shared/components/SettingsPage";

// Import additional components that will be created
import { BulkOrderPage } from "./enterprise/components/BulkOrderPage";
import { DeviceManagementPage } from "./enterprise/components/DeviceManagementPage";
import { EnterpriseOrderManagement } from "./enterprise/components/EnterpriseOrderManagement";
import { QCPage } from "./enterprise/components/QCPage";
import { ClearancePage } from "./enterprise/components/ClearancePage";
import { RepairQCPage } from "./enterprise/components/RepairQCPage";
import { InventoryPage } from "./enterprise/components/InventoryPage";
import { TechnicianManagementPage as TechnicianPage } from "./enterprise/components/TechnicianPage";

import { UserManagementPage } from "./admin/components/UserManagementPage";
import { OrderManagementPage } from "./admin/components/OrderManagementPage";
import { AdminReportsPage } from "./admin/components/AdminReportsPage";
import { TechnicianManagementPage } from "./admin/components/TechnicianManagementPage";
import { AnalyticsPage } from "./admin/components/AnalyticsPage";


function AppContent() {
  const { state } = useApp();
  const currentTheme = useCurrentTheme();
  const { currentUser } = state;
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    if (!state.isAuthenticated) {
      setCurrentPage("login");
    } else if (currentPage === "login") {
      setCurrentPage("dashboard");
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
      case "dashboard":
        // Render different dashboards based on user role
        if (currentUser?.role === "client") {
          return <ClientDashboard onNavigate={handleNavigate} />;
        } else if (currentUser?.role === "enterprise") {
          return <EnterpriseDashboard onNavigate={handleNavigate} />;
        } else if (currentUser?.role === "admin") {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        return <ClientDashboard onNavigate={handleNavigate} />;
      case "place-order":
        return <PlaceOrderPage onNavigate={handleNavigate} />;
      case "order-tracking":
        return <OrderTrackingPage onNavigate={handleNavigate} />;
      case "bulk-order":
        return <BulkOrderPage onNavigate={handleNavigate} />;
      case "device-management":
        return <DeviceManagementPage onNavigate={handleNavigate} />;
      case "order-management":
        return <EnterpriseOrderManagement onNavigate={handleNavigate} />;
      case "qc-page":
        return <QCPage onNavigate={handleNavigate} />;
      case "clearance-page":
        return <ClearancePage onNavigate={handleNavigate} />;
        case "technician-page":
  return <TechnicianPage onNavigate={handleNavigate} />;

      case "repair-qc-page":
        return <RepairQCPage onNavigate={handleNavigate} />;
      case "inventory-page":
        return <InventoryPage onNavigate={handleNavigate} />;
      case "user-management":
        return <UserManagementPage onNavigate={handleNavigate} />;
      case "admin-order-management":
        return <OrderManagementPage onNavigate={handleNavigate} />;
      case "technician-management":
        return <TechnicianManagementPage onNavigate={handleNavigate} />;
      case "analytics":
        return <AnalyticsPage onNavigate={handleNavigate} />;
        case "admin-reports":
        return <AdminReportsPage onNavigate={handleNavigate} />;
      case "reports":
        return <EnterpriseReportsPage onNavigate={handleNavigate} />;
        case "client-reports":
        return <ClientReportsPage onNavigate={handleNavigate} />;
      case "settings":
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        currentTheme === "dark" ? "dark" : ""
      }`}
    >
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
