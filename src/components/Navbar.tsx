import React from "react";
import {
  Home,
  Package,
  Plus,
  Search,
  FileText,
  Users,
  Settings,
  LogOut,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { useApp, useCurrentTheme } from "../context/AppContext";

interface NavbarProps {
  onNavigate: (page: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const { state, dispatch } = useApp();
  const currentTheme = useCurrentTheme();
  const { currentPage, currentUser } = state;

  const getNavItems = () => {
    if (!currentUser) return [];

    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "settings", label: "Settings", icon: Settings },
    ];

    switch (currentUser.role) {
      case "client":
        return [
          ...commonItems.slice(0, 1),
          { id: "place-order", label: "Place Order", icon: Plus },
          { id: "order-tracking", label: "Track Orders", icon: Search },
          { id: "reports", label: "Reports", icon: FileText },
          ...commonItems.slice(1),
        ];
      case "enterprise":
        return [
          ...commonItems.slice(0, 1),
          { id: "order-management", label: "Order Management", icon: Package },
          { id: "qc-page", label: "Quality Check", icon: CheckCircle },
          { id: "clearance-page", label: "Clearance", icon: CheckCircle },
           { id: "technician-page", label: "Technician", icon: CheckCircle },
          { id: "repair-qc-page", label: "Repair QC", icon: CheckCircle },
          { id: "inventory-page", label: "Inventory", icon: Package },
          { id: "reports", label: "Reports", icon: FileText },
          ...commonItems.slice(1),
        ];
      case "admin":
        return [
          ...commonItems.slice(0, 1),
          { id: "user-management", label: "User Management", icon: Users },
          {
            id: "admin-order-management",
            label: "Order Management",
            icon: Package,
          },
          { id: "technician-management", label: "Technicians", icon: Users },
          { id: "analytics", label: "Analytics", icon: FileText },
          ...commonItems.slice(1),
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    onNavigate("login");
  };

  if (!state.isAuthenticated) return null;

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        currentTheme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-green-600" />
              <span
                className={`ml-2 text-xl font-bold ${
                  currentTheme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                MoboCheck
              </span>
            </div>

            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                        : currentTheme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`text-sm ${
                currentTheme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {currentUser?.name} ({currentUser?.role})
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentTheme === "dark"
                  ? "text-red-400 hover:text-red-300 hover:bg-red-800"
                  : "text-red-600 hover:text-red-700 hover:bg-red-100"
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto space-x-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                      : currentTheme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
