import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  Package,
  User,
  Archive,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Device, InventoryReview } from "../../types";

interface InventoryPageProps {
  onNavigate: (page: string) => void;
}

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { state, dispatch } = useApp();
  const { devices, settings, currentUser } = state;
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const inventoryDevices = devices.filter((d) => d.status === "inventory");

  const handleInventoryReview = (
    device: Device,
    status: "approved" | "rejected"
  ) => {
    const inventoryReview: InventoryReview = {
      id: Date.now().toString(),
      deviceId: device.id,
      orderId: device.orderId || "",
      inventoryId: currentUser?.id || "",
      status,
      notes: reviewNotes,
      createdAt: new Date().toISOString(),
    };

    // store review record
    dispatch({ type: "ADD_INVENTORY_REVIEW", payload: inventoryReview });

    // determine next device status
    let newStatus: Device["status"];
    if (status === "approved") {
      // send back to technician queue (unassigned) for the normal tech workflow
      newStatus = "technician";
    } else {
      // inventory rejected -> mark failed and surface in reports
      newStatus = "failed";
    }

    const updatedDevice: Device = {
      ...device,
      status: newStatus,
      // clear technician assignment when sending back to technician queue
      technicianId: status === "approved" ? undefined as any : device.technicianId,
      inventoryNotes: [...(device.inventoryNotes || []), reviewNotes],
      inventoryDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // update app state
    dispatch({ type: "UPDATE_DEVICE", payload: updatedDevice });

    // persist devices list to localStorage so change survives reloads
    try {
      const currentDevices = Array.isArray(state.devices) ? state.devices : [];
      const persisted = currentDevices.map((d) =>
        d.id === updatedDevice.id ? updatedDevice : d
      );
      localStorage.setItem("devices", JSON.stringify(persisted));
    } catch {
      // ignore localStorage errors
    }

    // reset UI modal / inputs
    setShowReviewModal(false);
    setSelectedDevice(null);
    setReviewNotes("");

    // navigate to report page when inventory rejects a device
    if (status === "rejected") {
      onNavigate("reports");
    }
  };

  const handleReviewDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowReviewModal(true);
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
            Inventory Management
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Review devices that require inventory assessment
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Pending Inventory Review
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {inventoryDevices.length}
                </p>
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
                  Approved Today
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {
                    state.inventoryReviews.filter(
                      (r) =>
                        r.status === "approved" &&
                        new Date(r.createdAt).toDateString() ===
                          new Date().toDateString()
                    ).length
                  }
                </p>
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
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Rejected Today
                </p>
                <p
                  className={`text-2xl font-bold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {
                    state.inventoryReviews.filter(
                      (r) =>
                        r.status === "rejected" &&
                        new Date(r.createdAt).toDateString() ===
                          new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Devices List */}
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
                    Device
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
                    Issue
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Previous Notes
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
                {inventoryDevices.map((device) => (
                  <tr
                    key={device.id}
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
                        <Package className="h-4 w-4 mr-2 text-green-600" />
                        <div>
                          <div className="font-medium">
                            {device.brand} {device.model}
                          </div>
                          <div
                            className={`text-sm ${
                              settings.theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            IMEI: {device.imei}
                          </div>
                        </div>
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
                        {getClientName(device.clientId)}
                      </div>
                    </td>
                    <td
                      className={`py-4 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {device.reportedIssue}
                    </td>
                    <td
                      className={`py-4 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {device.technicianNotes &&
                      device.technicianNotes.length > 0
                        ? device.technicianNotes[
                            device.technicianNotes.length - 1
                          ]
                        : "No previous notes"}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleReviewDevice(device)}
                        className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {inventoryDevices.length === 0 && (
          <div className="text-center py-12">
            <Archive
              className={`h-16 w-16 mx-auto mb-4 ${
                settings.theme === "dark" ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              No devices pending inventory review
            </h3>
            <p
              className={`${
                settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              All devices have been reviewed or are in other stages
            </p>
          </div>
        )}

        {/* Inventory Review Modal */}
        {showReviewModal && selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-2xl rounded-xl p-6 ${
                settings.theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Inventory Review - {selectedDevice.brand}{" "}
                  {selectedDevice.model}
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
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
                {/* Device Info */}
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
                    Device Information
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
                        <span className="font-medium">Brand:</span>{" "}
                        {selectedDevice.brand}
                      </p>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Model:</span>{" "}
                        {selectedDevice.model}
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
                        <span className="font-medium">IMEI:</span>{" "}
                        {selectedDevice.imei}
                      </p>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Client:</span>{" "}
                        {getClientName(selectedDevice.clientId)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p
                      className={`text-sm ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="font-medium">Reported Issue:</span>{" "}
                      {selectedDevice.reportedIssue}
                    </p>
                  </div>
                </div>

                {/* Previous Notes */}
                {selectedDevice.technicianNotes &&
                  selectedDevice.technicianNotes.length > 0 && (
                    <div
                      className={`p-4 rounded-lg ${
                        settings.theme === "dark"
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-2 ${
                          settings.theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        Previous Technician Notes
                      </h3>
                      <p
                        className={`text-sm ${
                          settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedDevice.technicianNotes.join(". ")}
                      </p>
                    </div>
                  )}

                {/* Inventory Notes */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Inventory Assessment Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter your inventory assessment notes..."
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    settings.theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleInventoryReview(selectedDevice, "rejected")
                  }
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleInventoryReview(selectedDevice, "approved")
                  }
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
