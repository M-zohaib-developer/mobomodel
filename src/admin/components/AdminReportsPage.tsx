import React from "react";
import { useApp } from "../../context/AppContext";
import { Report, Device } from "../../types";

interface AdminReportsPageProps {
  onNavigate: (page: string) => void;
}

export function AdminReportsPage({ onNavigate }: AdminReportsPageProps) {
  const { state } = useApp();
  const { reports = [], devices = [] } = state;

  // admin can read all reports (or filter by recipients includes 'admin')
  const visibleReports = (reports as Report[]).filter((r) => (r.recipients || []).includes("admin") || true);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Reports</h1>

      <div className="space-y-3">
        {visibleReports.length === 0 && <div className="text-sm text-gray-500">No reports available</div>}
        {visibleReports.slice().reverse().map((r: Report) => {
          const device = (devices as Device[]).find((d) => d.id === r.deviceId);
          return (
            <div key={r.id} className="p-3 border rounded">
              <div className="text-sm text-gray-600">Device: {device ? `${device.brand} ${device.model}` : r.deviceId} • Order: {r.orderId}</div>
              <div className="font-medium">{r.description}</div>
              <div className="text-xs text-gray-400">By: {r.reporterId} • {new Date(r.createdAt).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}