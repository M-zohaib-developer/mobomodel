import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { Report, Device } from "../../types";

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { state, dispatch } = useApp();
  const { devices, currentUser } = state;

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If ClearancePage placed a pending device id in localStorage, pick it
    const pending = localStorage.getItem("pendingReportDeviceId");
    if (pending) {
      setSelectedDeviceId(pending);
      // remove it so it doesn't persist after using once
      try {
        localStorage.removeItem("pendingReportDeviceId");
      } catch {}
    }
  }, []);

  // allow enterprise to pick devices that need report OR show all for convenience
  const availableDevices: Device[] = devices.filter(
    (d) =>
      // show devices that likely need reporting (failed/completed/clearance)
      ["failed", "completed", "clearance", "report-required"].includes(
        d.status
      ) || d.id === selectedDeviceId
  );

  const handleSubmitReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDeviceId) {
      alert("Select a device to report.");
      return;
    }
    if (!description.trim()) {
      alert("Enter report description.");
      return;
    }

    setSubmitting(true);

    const report: Report = {
      id: Date.now().toString(),
      deviceId: selectedDeviceId,
      orderId:
        (devices.find((d) => d.id === selectedDeviceId) || {}).orderId || "",
      reporterId: currentUser?.id || "",
      description: description.trim(),
      recipients: ["admin", "client"], // admin + client will see this report
      createdAt: new Date().toISOString(),
    };

    // dispatch and persist
    dispatch({ type: "ADD_REPORT", payload: report });

    try {
      const stored = JSON.parse(localStorage.getItem("reports") || "[]");
      const updated = Array.isArray(stored) ? [...stored, report] : [report];
      localStorage.setItem("reports", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Optionally update device to mark report attached
    const device = devices.find((d) => d.id === selectedDeviceId);
    if (device) {
      const updatedDevice: Device = {
        ...device,
        reportId: report.id,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "UPDATE_DEVICE", payload: updatedDevice });
      try {
        const persisted = Array.isArray(state.devices)
          ? state.devices.map((d) =>
              d.id === updatedDevice.id ? updatedDevice : d
            )
          : [updatedDevice];
        localStorage.setItem("devices", JSON.stringify(persisted));
      } catch {}
    }

    // after submit, navigate enterprise back to dashboard (or wherever you prefer)
    setSubmitting(false);
    setDescription("");
    setSelectedDeviceId("");
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <form onSubmit={handleSubmitReport} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select device to report</option>
            {availableDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.brand} {d.model} — {d.status} — Order: {d.orderId || "—"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border rounded"
            placeholder="Write the report / notes for admin and client..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>

      {/* Below: list of existing reports so admin/client pages can read from state.reports/localStorage */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent Reports</h2>
        <div className="space-y-3">
          {(state.reports || [])
            .slice()
            .reverse()
            .map((r: Report) => (
              <div key={r.id} className="p-3 border rounded">
                <div className="text-sm text-gray-600">
                  Device: {r.deviceId} • Order: {r.orderId}
                </div>
                <div className="font-medium">{r.description}</div>
                <div className="text-xs text-gray-400">
                  By: {r.reporterId} • {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
