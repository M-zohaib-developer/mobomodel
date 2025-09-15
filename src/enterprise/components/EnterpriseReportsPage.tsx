import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { Report, Device, Order } from "../../types";

interface EnterpriseReportsPageProps {
  onNavigate: (page: string) => void;
}

export function EnterpriseReportsPage({
  onNavigate,
}: EnterpriseReportsPageProps) {
  const { state, dispatch } = useApp();
  const { devices, currentUser, settings, orders } = state;
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // devices that usually require reports
  const candidateDevices = devices.filter((d: Device) =>
    ["failed", "completed", "clearance", "report-required"].includes(d.status)
  );

  useEffect(() => {
    // if pendingReportDeviceId exists (from Clearance flow) auto-select
    const pending = localStorage.getItem("pendingReportDeviceId");
    if (pending) {
      setSelectedDeviceId(pending);
      try {
        localStorage.removeItem("pendingReportDeviceId");
      } catch (err) {
        console.warn("Could not remove pendingReportDeviceId", err);
      }
    }
  }, []);

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

    // create a Report matching the app's Report type
    const report: Report = {
      id: Date.now().toString(),
      deviceId: selectedDeviceId,
      orderId:
        (devices.find((d) => d.id === selectedDeviceId) || {}).orderId || "",
      clientId:
        (devices.find((d) => d.id === selectedDeviceId) || {}).clientId || "",
      summary: description.trim(),
      workDone: [],
      partsReplaced: [],
      finalStatus: "",
      technicianNotes: "",
      generatedBy: currentUser?.id || "",
      createdAt: new Date().toISOString(),
      status: "draft",
    };

    dispatch({ type: "ADD_REPORT", payload: report });

    try {
      const stored = JSON.parse(localStorage.getItem("reports") || "[]");
      const updated = Array.isArray(stored) ? [...stored, report] : [report];
      localStorage.setItem("reports", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist reports", err);
    }

    // update device metadata (don't invent unknown fields)
    const device = devices.find((d) => d.id === selectedDeviceId);
    if (device) {
      const updatedDevice: Device = {
        ...device,
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
      } catch (err) {
        console.warn("Failed to persist device update", err);
      }
    }

    setSubmitting(false);
    setDescription("");
    setSelectedDeviceId("");
    onNavigate("dashboard");
  };

  // --- New: auto-generate itemized device report for an order ---
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [generatedRows, setGeneratedRows] = useState<
    Array<{
      seq: number;
      boxId: string;
      deviceId: string;
      brand: string;
      model: string;
      imei: string;
    }>
  >([]);

  const handleAutoGenerate = () => {
    if (!selectedOrderId)
      return alert("Select an order to generate report for.");
    const order = orders?.find((o) => o.id === selectedOrderId);
    if (!order) return alert("Order not found.");

    // enumerate devices 1..N and assign a boxId if missing
    const rows: Array<{
      seq: number;
      boxId: string;
      deviceId: string;
      brand: string;
      model: string;
      imei: string;
    }> = [];
    const orderDevices: Device[] = order.devices || [];

    const mergedDevices = Array.isArray(state.devices)
      ? [...state.devices]
      : [];

    orderDevices.forEach((d: Device, idx: number) => {
      const boxId = d.boxId || `${order.id}-BOX-${idx + 1}`;
      rows.push({
        seq: idx + 1,
        boxId,
        deviceId: d.id,
        brand: d.brand,
        model: d.model,
        imei: d.imei,
      });

      // update or add device in global devices
      const existingIndex = mergedDevices.findIndex((md) => md.id === d.id);
      const updatedDevice = {
        ...d,
        boxId,
        updatedAt: new Date().toISOString(),
      } as Device;
      if (existingIndex >= 0)
        mergedDevices[existingIndex] = {
          ...mergedDevices[existingIndex],
          ...updatedDevice,
        };
      else mergedDevices.push(updatedDevice);
    });

    try {
      localStorage.setItem("devices", JSON.stringify(mergedDevices));
      // dispatch updates for every updated device
      mergedDevices.forEach((md) =>
        dispatch({ type: "UPDATE_DEVICE", payload: md })
      );
    } catch (err) {
      console.error("Failed to persist devices after generate", err);
    }

    setGeneratedRows(rows);
  };

  const downloadCSV = () => {
    if (!generatedRows.length) return alert("No generated rows to export.");
    const headers = ["Seq", "Box ID", "Device ID", "Brand", "Model", "IMEI"];
    const csv = [headers.join(",")]
      .concat(
        generatedRows.map((r) =>
          [r.seq, r.boxId, r.deviceId, r.brand, r.model, r.imei]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${selectedOrderId || "report"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-200 ${
        settings?.theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Enterprise Reports</h1>

      {/* Auto-generate per-order report */}
      <div className="mb-6 p-4 rounded bg-white border">
        <label className="block text-sm font-medium mb-2">
          Select Order to auto-generate
        </label>
        <div className="flex gap-2 items-center">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
          >
            <option value="">Choose an order</option>
            {(orders || []).map((o: Order) => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.clientId} —{" "}
                {o.totalDevices || (o.devices || []).length} devices
              </option>
            ))}
          </select>
          <button
            onClick={handleAutoGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Generate
          </button>
          <button onClick={downloadCSV} className="px-4 py-2 border rounded">
            Export CSV
          </button>
        </div>

        {generatedRows.length > 0 && (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-1">#</th>
                  <th className="p-1">Box ID</th>
                  <th className="p-1">Device ID</th>
                  <th className="p-1">Brand</th>
                  <th className="p-1">Model</th>
                  <th className="p-1">IMEI</th>
                </tr>
              </thead>
              <tbody>
                {generatedRows.map((r) => (
                  <tr key={r.deviceId} className="border-t">
                    <td className="p-1">{r.seq}</td>
                    <td className="p-1">{r.boxId}</td>
                    <td className="p-1">{r.deviceId}</td>
                    <td className="p-1">{r.brand}</td>
                    <td className="p-1">{r.model}</td>
                    <td className="p-1">{r.imei}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitReport} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select device to report</option>
            {candidateDevices.map((d: Device) => (
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent Reports</h2>
        <div className="space-y-3">
          {(state.reports || [])
            .slice()
            .reverse()
            .map((r: Report) => (
              <div
                key={r.id}
                className={`p-3 rounded ${
                  settings?.theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div
                  className={`${
                    settings?.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  } text-sm`}
                >
                  Device: {r.deviceId} • Order: {r.orderId}
                </div>
                <div className="font-medium">{r.summary}</div>
                <div
                  className={`${
                    settings?.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-400"
                  } text-xs`}
                >
                  By: {r.generatedBy} • {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
