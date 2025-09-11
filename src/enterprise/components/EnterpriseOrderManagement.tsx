import React, { useState } from "react";
import {
  Package,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Device, Order } from "../../types";

interface EnterpriseOrderManagementProps {
  onNavigate: (page: string) => void;
}

export function EnterpriseOrderManagement({
  onNavigate,
}: EnterpriseOrderManagementProps) {
  const { state, dispatch } = useApp();
  const { orders, devices, settings, currentUser } = state;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const getOrderStatus = (order: Order) => {
    const orderDevices = devices.filter((d) =>
      order.devices.some((od) => od.id === d.id)
    );
    if (orderDevices.length === 0) return "pending";

    const statuses = orderDevices.map((d) => d.status);
    if (statuses.every((s) => s === "completed")) return "completed";
    if (statuses.some((s) => s === "completed")) return "partial";
    if (
      statuses.some((s) =>
        ["qc", "technician", "repair-qc", "clearance"].includes(s)
      )
    )
      return "in-progress";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "partial":
        return "text-blue-600 dark:text-blue-400";
      case "in-progress":
        return "text-yellow-600 dark:text-yellow-400";
      case "pending":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "partial":
        return "Partially Complete";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const handleAssignToQC = (order: Order) => {
    const orderDevices = devices.filter((d) =>
      order.devices.some((od) => od.id === d.id)
    );

    orderDevices.forEach((device) => {
      if (device.status === "pending") {
        const updatedDevice: Device = {
          ...device,
          status: "qc",
          qcId: currentUser?.id,
          qcDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: "UPDATE_DEVICE", payload: updatedDevice });
      }
    });

    // Update order status
    const updatedOrder: Order = {
      ...order,
      status: "in-progress",
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "UPDATE_ORDER", payload: updatedOrder });
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getClientName = (clientId: string) => {
    const client = state.users.find((u) => u.id === clientId);
    return client ? client.name : "Unknown Client";
  };

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
            Order Management
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Review and manage client orders
          </p>
        </div>

        {/* Orders List */}
        <div
          className={`rounded-xl border overflow-hidden ${
            settings.theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  settings.theme === "dark" ? "bg-gray-750" : "bg-gray-50"
                }`}
              >
                <tr>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Order ID
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Client
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Devices
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Created
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderStatus = getOrderStatus(order);
                  const orderDevices = devices.filter((d) =>
                    order.devices.some((od) => od.id === d.id)
                  );

                  return (
                    <tr
                      key={order.id}
                      className={`border-t ${
                        settings.theme === "dark"
                          ? "border-gray-700"
                          : "border-gray-200"
                      }`}
                    >
                      <td
                        className={`py-4 px-4 ${
                          settings.theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-green-600" />#
                          {order.id.slice(-6)}
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {getClientName(order.clientId)}
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {orderDevices.length} device(s)
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            orderStatus
                          )}`}
                        >
                          {getStatusLabel(orderStatus)}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-4 text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              settings.theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {orderStatus === "pending" && (
                            <button
                              onClick={() => handleAssignToQC(order)}
                              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
                              title="Assign to QC"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-4xl rounded-xl p-6 ${
                settings.theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Order Details - #{selectedOrder.id.slice(-6)}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div
                  className={`p-4 rounded-lg ${
                    settings.theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <h3
                    className={`font-medium mb-2 ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Order Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Client:</span>{" "}
                        {getClientName(selectedOrder.clientId)}
                      </p>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Total Devices:</span>{" "}
                        {selectedOrder.totalDevices}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Status:</span>{" "}
                        {getStatusLabel(getOrderStatus(selectedOrder))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Devices */}
                <div>
                  <h3
                    className={`font-medium mb-4 ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Devices in Order
                  </h3>
                  <div className="space-y-3">
                    {devices
                      .filter((d) =>
                        selectedOrder.devices.some((od) => od.id === d.id)
                      )
                      .map((device) => (
                        <div
                          key={device.id}
                          className={`p-4 rounded-lg border ${
                            settings.theme === "dark"
                              ? "border-gray-600"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4
                                className={`font-medium ${
                                  settings.theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {device.brand} {device.model}
                              </h4>
                              <p
                                className={`text-sm ${
                                  settings.theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                IMEI: {device.imei} • Issue:{" "}
                                {device.reportedIssue}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                device.status
                              )}`}
                            >
                              {getStatusLabel(device.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    settings.theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Close
                </button>
                {getOrderStatus(selectedOrder) === "pending" && (
                  <button
                    onClick={() => {
                      handleAssignToQC(selectedOrder);
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Assign to QC
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
