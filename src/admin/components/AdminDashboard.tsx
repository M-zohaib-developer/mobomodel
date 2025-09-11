import React from "react";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Smartphone,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { state } = useApp();
  const {
    devices,
    orders,
    settings,
    currentUser,
    technicians,
    users,
    reports,
  } = state;

  const getAdminStats = () => {
    return {
      totalDevices: devices.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalTechnicians: technicians.length,
      totalReports: reports.length,
      pendingDevices: devices.filter((d) => d.status === "pending").length,
      inProgressDevices: devices.filter((d) =>
        ["qc", "technician", "repair-qc", "clearance"].includes(d.status)
      ).length,
      completedDevices: devices.filter((d) => d.status === "completed").length,
      clientUsers: users.filter((u) => u.role === "client").length,
      enterpriseUsers: users.filter((u) => u.role === "enterprise").length,
      adminUsers: users.filter((u) => u.role === "admin").length,
    };
  };

  const stats = getAdminStats();

  const getRecentActivity = () => {
    return devices
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  };

  const recentDevices = getRecentActivity();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "clearance":
        return "text-blue-600 dark:text-blue-400";
      case "repair-qc":
        return "text-purple-600 dark:text-purple-400";
      case "technician":
        return "text-yellow-600 dark:text-yellow-400";
      case "qc":
        return "text-orange-600 dark:text-orange-400";
      case "pending":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "qc":
        return "QC Review";
      case "technician":
        return "Technician";
      case "repair-qc":
        return "Repair QC";
      case "clearance":
        return "Clearance";
      case "completed":
        return "Completed";
      default:
        return status.replace("-", " ");
    }
  };

  const getQuickActions = () => {
    return [
      {
        label: "User Management",
        action: () => onNavigate("user-management"),
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        label: "Order Management",
        action: () => onNavigate("admin-order-management"),
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        label: "Technician Management",
        action: () => onNavigate("technician-management"),
        color: "bg-purple-600 hover:bg-purple-700",
      },
      {
        label: "Analytics",
        action: () => onNavigate("analytics"),
        color: "bg-orange-600 hover:bg-orange-700",
      },
    ];
  };

  const quickActions = getQuickActions();

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              settings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Admin Dashboard
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            System overview and management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                : "bg-white border-gray-200 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Total Devices
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalDevices}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                : "bg-white border-gray-200 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Total Users
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                : "bg-white border-gray-200 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Total Orders
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                : "bg-white border-gray-200 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Total Reports
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalReports}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Device Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Pending
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.pendingDevices}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  In Progress
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.inProgressDevices}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Completed
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.completedDevices}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              User Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Clients
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.clientUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Enterprises
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.enterpriseUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Admins
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.adminUsers}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              System Health
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Technicians
                </span>
                <span
                  className={`font-medium ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalTechnicians}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Completion Rate
                </span>
                <span className={`font-medium text-green-600`}>
                  {stats.totalDevices > 0
                    ? Math.round(
                        (stats.completedDevices / stats.totalDevices) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`rounded-xl p-6 border mb-8 ${
            settings.theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              settings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            System Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`px-6 py-4 text-white rounded-lg transition-colors duration-200 ${action.color} text-center`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className={`rounded-xl p-6 border ${
            settings.theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-semibold ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Device Activity
            </h2>
          </div>

          {recentDevices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone
                className={`h-12 w-12 mx-auto mb-4 ${
                  settings.theme === "dark" ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg font-medium mb-2 ${
                  settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No devices in system
              </p>
              <p
                className={`mb-4 ${
                  settings.theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Device activity will appear here once clients start placing
                orders
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDevices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                    settings.theme === "dark"
                      ? "border-gray-600 hover:bg-gray-750"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        settings.theme === "dark"
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {device.brand} {device.model}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      IMEI: {device.imei} • Issue: {device.reportedIssue}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm font-medium capitalize ${getStatusColor(
                        device.status
                      )}`}
                    >
                      {getStatusLabel(device.status)}
                    </span>
                    <span
                      className={`text-xs ${
                        settings.theme === "dark"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(device.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
