import React from "react";
import { useApp } from "../../context/AppContext";
import { Report, Device } from "../../types";

interface ClientReportsPageProps {
  onNavigate: (page: string) => void;
}

export function ClientReportsPage({ onNavigate }: ClientReportsPageProps) {
  const { state } = useApp();
  const { reports = [], devices = [], currentUser } = state;

  // client sees reports addressed to clients and related to their own devices
  const visibleReports = (reports as Report[]).filter((r) => {
    if (!Array.isArray(r.recipients)) return false;
    if (!r.recipients.includes("client")) return false;
    const device = (devices as Device[]).find((d) => d.id === r.deviceId);
    return device?.clientId === currentUser?.id;
  });

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">My Reports</h1>

      <div className="space-y-3">
        {visibleReports.length === 0 && (
          <div className="text-sm text-gray-500">No reports available</div>
        )}
        {visibleReports
          .slice()
          .reverse()
          .map((r: Report) => {
            const device = (devices as Device[]).find(
              (d) => d.id === r.deviceId
            );
            return (
              <div key={r.id} className="p-3 border rounded">
                <div className="text-sm text-gray-600">
                  Device:{" "}
                  {device ? `${device.brand} ${device.model}` : r.deviceId} •
                  Order: {r.orderId}
                </div>
                <div className="font-medium">{r.description}</div>
                <div className="text-xs text-gray-400">
                  By: {r.reporterId} • {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
