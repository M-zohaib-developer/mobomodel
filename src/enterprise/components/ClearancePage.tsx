import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Device, ClearanceReview } from "../../types";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  Package,
  User,
  FileText,
} from "lucide-react";

interface ClearancePageProps {
  onNavigate: (page: string) => void;
}

export function ClearancePage({ onNavigate }: ClearancePageProps) {
  const { state, dispatch } = useApp();
  const { devices, currentUser } = state;
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const clearanceDevices = devices.filter((d) => d.status === "clearance");

  const handleClearanceReview = (
    device: Device,
    status: "approved" | "rejected"
  ) => {
    // create review record
    const clearanceReview: ClearanceReview = {
      id: Date.now().toString(),
      deviceId: device.id,
      orderId: device.orderId || "",
      clearanceId: currentUser?.id || "",
      status,
      notes: reviewNotes,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_CLEARANCE_REVIEW", payload: clearanceReview });

    // update device status
    const newStatus: Device["status"] = status === "approved" ? "completed" : "failed";

    const updatedDevice: Device = {
      ...device,
      status: newStatus,
      clearanceNotes: [...(device.clearanceNotes || []), reviewNotes],
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "UPDATE_DEVICE", payload: updatedDevice });

    // persist devices state to localStorage (so reports / other pages see change after reload)
    try {
      const persisted = Array.isArray(state.devices) ? state.devices.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)) : [updatedDevice];
      localStorage.setItem("devices", JSON.stringify(persisted));
    } catch {
      // ignore
    }

    // store pending report target so Reports page can open with the device selected
    try {
      localStorage.setItem("pendingReportDeviceId", updatedDevice.id);
    } catch {}

    // navigate enterprise to reports page for writing the report
    onNavigate("reports");

    // reset local UI
    setSelectedDevice(null);
    setReviewNotes("");
  };

  const handleReviewDevice = (device: Device) => {
    setSelectedDevice(device);
  };

  const getClientName = (clientId: string) => {
    const client = state.users.find((u) => u.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        state.settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              state.settings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Final Clearance
          </h1>
          <p
            className={`text-lg ${
              state.settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Final review and approval of refurbished devices
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 border ${
              state.settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    state.settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Pending Clearance
                </p>
                <p
                  className={`text-2xl font-bold ${
                    state.settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {clearanceDevices.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${
              state.settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    state.settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Approved Today
                </p>
                <p
                  className={`text-2xl font-bold ${
                    state.settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {
                    state.clearanceReviews.filter(
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
              state.settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    state.settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Reports Generated
                </p>
                <p
                  className={`text-2xl font-bold ${
                    state.settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {
                    state.reports.filter(
                      (r) =>
                        r.status === "submitted" &&
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
            state.settings.theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  state.settings.theme === "dark" ? "bg-gray-750" : "bg-gray-50"
                }`}
              >
                <tr>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Device
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Client
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Issue
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    QC Notes
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clearanceDevices.map((device) => (
                  <tr
                    key={device.id}
                    className={`border-t ${
                      state.settings.theme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <td
                      className={`py-4 px-4 ${
                        state.settings.theme === "dark"
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
                              state.settings.theme === "dark"
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
                        state.settings.theme === "dark"
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
                        state.settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {device.reportedIssue}
                    </td>
                    <td
                      className={`py-4 px-4 ${
                        state.settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {device.qcNotes && device.qcNotes.length > 0
                        ? device.qcNotes[device.qcNotes.length - 1]
                        : "No QC notes"}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleReviewDevice(device)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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

        {clearanceDevices.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle
              className={`h-16 w-16 mx-auto mb-4 ${
                state.settings.theme === "dark" ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                state.settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              No devices pending clearance
            </h3>
            <p
              className={`${
                state.settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              All devices have been cleared or are in other stages
            </p>
          </div>
        )}

        {/* Clearance Review Modal */}
        {selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-2xl rounded-xl p-6 ${
                state.settings.theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    state.settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Final Clearance Review - {selectedDevice.brand}{" "}
                  {selectedDevice.model}
                </h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    state.settings.theme === "dark"
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
                    state.settings.theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <h3
                    className={`font-medium mb-2 ${
                      state.settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Device Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          state.settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">Brand:</span>{" "}
                        {selectedDevice.brand}
                      </p>
                      <p
                        className={`text-sm ${
                          state.settings.theme === "dark"
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
                          state.settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">IMEI:</span>{" "}
                        {selectedDevice.imei}
                      </p>
                      <p
                        className={`text-sm ${
                          state.settings.theme === "dark"
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
                        state.settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="font-medium">Reported Issue:</span>{" "}
                      {selectedDevice.reportedIssue}
                    </p>
                  </div>
                </div>

                {/* QC Notes */}
                {selectedDevice.qcNotes &&
                  selectedDevice.qcNotes.length > 0 && (
                    <div
                      className={`p-4 rounded-lg ${
                        state.settings.theme === "dark"
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-2 ${
                          state.settings.theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        QC Review Notes
                      </h3>
                      <p
                        className={`text-sm ${
                          state.settings.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedDevice.qcNotes.join(". ")}
                      </p>
                    </div>
                  )}

                {/* Clearance Notes */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      state.settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Final Clearance Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter your final clearance notes..."
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      state.settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    state.settings.theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleClearanceReview(selectedDevice, "rejected")
                  }
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleClearanceReview(selectedDevice, "approved")
                  }
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
