import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Users,
  Smartphone,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const { state } = useApp();
  const { devices, orders, users, technicians, settings } = state;
  const [timeRange, setTimeRange] = useState("30");

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(timeRange));
    return { start, end };
  };

  const { start, end } = getDateRange();

  const getFilteredData = () => {
    return {
      devices: devices.filter(
        (d) => new Date(d.createdAt) >= start && new Date(d.createdAt) <= end
      ),
      orders: orders.filter(
        (o) => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end
      ),
    };
  };

  const { devices: filteredDevices, orders: filteredOrders } =
    getFilteredData();

  const analytics = {
    totalRevenue: filteredDevices.reduce(
      (sum, d) => sum + (d.estimate || 0),
      0
    ),
    avgRepairTime:
      filteredDevices.filter((d) => d.status === "completed").length > 0
        ? Math.round(
            filteredDevices
              .filter((d) => d.status === "completed")
              .reduce((sum, d) => {
                const created = new Date(d.createdAt);
                const completed = new Date(d.completedAt || d.updatedAt);
                return (
                  sum +
                  (completed.getTime() - created.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
              }, 0) /
              filteredDevices.filter((d) => d.status === "completed").length
          )
        : 0,
    completionRate:
      filteredDevices.length > 0
        ? Math.round(
            (filteredDevices.filter((d) => d.status === "completed").length /
              filteredDevices.length) *
              100
          )
        : 0,
    customerSatisfaction: 95, // Mock data
  };

  const statusDistribution = [
    {
      status: "Pending",
      count: filteredDevices.filter((d) => d.status === "pending").length,
      color: "bg-gray-500",
    },
    {
      status: "QC",
      count: filteredDevices.filter((d) => d.status === "qc").length,
      color: "bg-yellow-500",
    },
    {
      status: "Technician",
      count: filteredDevices.filter((d) => d.status === "technician-diagnosis")
        .length,
      color: "bg-blue-500",
    },
    {
      status: "Cleaning",
      count: filteredDevices.filter((d) => d.status === "cleaning").length,
      color: "bg-purple-500",
    },
    {
      status: "Completed",
      count: filteredDevices.filter((d) => d.status === "completed").length,
      color: "bg-green-500",
    },
  ];

  const brandDistribution = devices.reduce((acc, device) => {
    acc[device.brand] = (acc[device.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBrands = Object.entries(brandDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const technicianPerformance = technicians.map((tech) => {
    const assignedDevices = devices.filter((d) => d.technicianId === tech.id);
    const completedDevices = assignedDevices.filter(
      (d) => d.status === "completed"
    );
    const avgTime =
      completedDevices.length > 0
        ? Math.round(
            completedDevices.reduce((sum, d) => {
              const created = new Date(d.createdAt);
              const completed = new Date(d.completedAt || d.updatedAt);
              return (
                sum +
                (completed.getTime() - created.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            }, 0) / completedDevices.length
          )
        : 0;

    return {
      name: tech.name,
      assigned: assignedDevices.length,
      completed: completedDevices.length,
      avgTime,
      efficiency:
        assignedDevices.length > 0
          ? Math.round((completedDevices.length / assignedDevices.length) * 100)
          : 0,
    };
  });

  const exportAnalytics = () => {
    const data = {
      summary: analytics,
      statusDistribution,
      brandDistribution: topBrands,
      technicianPerformance,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_report_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Analytics & Reports
            </h1>
            <p
              className={`text-lg ${
                settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Comprehensive insights into system performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                settings.theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={exportAnalytics}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Total Revenue
                </p>
                <p className={`text-2xl font-bold text-green-600`}>
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Avg Repair Time
                </p>
                <p className={`text-2xl font-bold text-blue-600`}>
                  {analytics.avgRepairTime} days
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Completion Rate
                </p>
                <p className={`text-2xl font-bold text-purple-600`}>
                  {analytics.completionRate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Customer Satisfaction
                </p>
                <p className={`text-2xl font-bold text-yellow-600`}>
                  {analytics.customerSatisfaction}%
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
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
              Device Status Distribution
            </h3>
            <div className="space-y-3">
              {statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                    <span
                      className={`${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Brands */}
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
              Top Device Brands
            </h3>
            <div className="space-y-3">
              {topBrands.map(([brand, count]) => (
                <div key={brand} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 text-green-600 mr-3" />
                    <span
                      className={`${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {brand}
                    </span>
                  </div>
                  <span
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technician Performance */}
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
            Technician Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    settings.theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Technician
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Assigned
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Completed
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Avg Time (days)
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody>
                {technicianPerformance.map((tech) => (
                  <tr
                    key={tech.name}
                    className={`border-b ${
                      settings.theme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <td
                      className={`py-3 px-4 ${
                        settings.theme === "dark"
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {tech.name}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {tech.assigned}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {tech.completed}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {tech.avgTime}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tech.efficiency >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : tech.efficiency >= 60
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }`}
                      >
                        {tech.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
