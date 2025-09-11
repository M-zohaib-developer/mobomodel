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
  Eye,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface EnterpriseDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnterpriseDashboard({ onNavigate }: EnterpriseDashboardProps) {
  const { state } = useApp();
  const { devices, orders, settings, currentUser } = state;

  const getEnterpriseStats = () => {
    if (!currentUser)
      return {
        total: 0,
        pending: 0,
        qc: 0,
        technician: 0,
        clearance: 0,
        completed: 0,
        orders: 0,
      };

    const allDevices = devices; // Enterprise can see all devices
    const allOrders = orders; // Enterprise can see all orders

    return {
      total: allDevices.length,
      pending: allDevices.filter((d) => d.status === "pending").length,
      qc: allDevices.filter((d) => d.status === "qc").length,
      technician: allDevices.filter((d) => d.status === "technician").length,
      clearance: allDevices.filter((d) => d.status === "clearance").length,
      completed: allDevices.filter((d) => d.status === "completed").length,
      orders: allOrders.length,
    };
  };

  const stats = getEnterpriseStats();

  const getRecentOrders = () => {
    return orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const recentOrders = getRecentOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "clearance":
        return "text-blue-600 dark:text-blue-400";
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
        label: "Manage Orders",
        action: () => onNavigate("order-management"),
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        label: "Quality Check",
        action: () => onNavigate("qc-page"),
        color: "bg-orange-600 hover:bg-orange-700",
      },
      {
        label: "Clearance",
        action: () => onNavigate("clearance-page"),
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        label: "Repair QC",
        action: () => onNavigate("repair-qc-page"),
        color: "bg-purple-600 hover:bg-purple-700",
      },
      {
        label: "Inventory",
        action: () => onNavigate("inventory-page"),
        color: "bg-indigo-600 hover:bg-indigo-700",
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
            Enterprise Dashboard
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Manage device orders and oversee the refurbishment process
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
                  {stats.total}
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
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  QC Review
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.qc}
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
              <Users className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Technician
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.technician}
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
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Completed
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.completed}
                </p>
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
            Workflow Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Recent Orders */}
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
              Recent Orders
            </h2>
            <button
              onClick={() => onNavigate("order-management")}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package
                className={`h-12 w-12 mx-auto mb-4 ${
                  settings.theme === "dark" ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg font-medium mb-2 ${
                  settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No orders yet
              </p>
              <p
                className={`mb-4 ${
                  settings.theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Orders will appear here when clients place them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const orderDevices = devices.filter((d) =>
                  order.devices.some((od) => od.id === d.id)
                );
                const primaryDevice = orderDevices[0];

                return (
                  <div
                    key={order.id}
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
                        Order #{order.id.slice(-6)}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          settings.theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {order.totalDevices} device(s) •{" "}
                        {primaryDevice
                          ? `${primaryDevice.brand} ${primaryDevice.model}`
                          : "Multiple devices"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-medium capitalize ${getStatusColor(
                          primaryDevice?.status || "pending"
                        )}`}
                      >
                        {getStatusLabel(primaryDevice?.status || "pending")}
                      </span>
                      <span
                        className={`text-xs ${
                          settings.theme === "dark"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onNavigate("order-management")}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
