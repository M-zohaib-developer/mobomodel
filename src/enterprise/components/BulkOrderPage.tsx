import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Device, Order } from "../../types";

interface BulkOrderPageProps {
  onNavigate: (page: string) => void;
}

export function BulkOrderPage({ onNavigate }: BulkOrderPageProps) {
  const { state, dispatch } = useApp();
  const { settings, currentUser } = state;
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const requiredHeaders = ["brand", "model", "imei", "issue"];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          setErrors([`Missing required columns: ${missingHeaders.join(", ")}`]);
          return;
        }

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(",").map((v) => v.trim());
            const row: any = {};
            headers.forEach((header, i) => {
              row[header] = values[i] || "";
            });
            row.rowIndex = index + 2; // +2 because we start from line 2 (after header)
            return row;
          });

        // Validate data
        const validationErrors: string[] = [];
        data.forEach((row, index) => {
          if (!row.brand)
            validationErrors.push(`Row ${row.rowIndex}: Brand is required`);
          if (!row.model)
            validationErrors.push(`Row ${row.rowIndex}: Model is required`);
          if (!row.imei)
            validationErrors.push(`Row ${row.rowIndex}: IMEI is required`);
          if (row.imei && row.imei.length < 15)
            validationErrors.push(
              `Row ${row.rowIndex}: IMEI must be at least 15 digits`
            );
          if (!row.issue)
            validationErrors.push(
              `Row ${row.rowIndex}: Issue description is required`
            );
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        setUploadedData(data);
        setErrors([]);
      } catch (error) {
        setErrors(["Failed to parse CSV file. Please check the format."]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitBulkOrder = async () => {
    if (!currentUser || uploadedData.length === 0) return;

    setIsProcessing(true);

    try {
      const devices: Device[] = uploadedData.map((row, index) => ({
        id: `${Date.now()}-${index}`,
        brand: row.brand,
        model: row.model,
        imei: row.imei,
        reportedIssue: row.issue,
        status: "pending",
        clientId: currentUser.id,
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const newOrder: Order = {
        id: Date.now().toString(),
        clientId: currentUser.id,
        devices: devices,
        totalDevices: devices.length,
        completedDevices: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add all devices
      devices.forEach((device) => {
        dispatch({ type: "ADD_DEVICE", payload: device });
      });

      // Add order
      dispatch({ type: "ADD_ORDER", payload: newOrder });

      // Reset form
      setUploadedData([]);

      // Navigate to device management
      setTimeout(() => {
        onNavigate("device-management");
      }, 1000);
    } catch (error) {
      setErrors(["Failed to process bulk order. Please try again."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "Brand,Model,IMEI,Issue\nApple,iPhone 14,123456789012345,Screen cracked\nSamsung,Galaxy S23,987654321098765,Battery not charging";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_order_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              settings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Bulk Order Upload
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Upload multiple devices at once using CSV or Excel files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className={`lg:col-span-2 space-y-6`}>
            {/* Template Download */}
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
                  Step 1: Download Template
                </h2>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </button>
              </div>
              <p
                className={`text-sm ${
                  settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Download the CSV template and fill in your device information.
                Required columns: Brand, Model, IMEI, Issue
              </p>
            </div>

            {/* File Upload */}
            <div
              className={`rounded-xl p-6 border ${
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
                Step 2: Upload Your File
              </h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  settings.theme === "dark"
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Upload
                  className={`h-12 w-12 mx-auto mb-4 ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Upload CSV File
                </p>
                <p
                  className={`text-sm mb-4 ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Select your CSV file with device information
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-red-400 font-medium mb-2">
                      Validation Errors:
                    </h3>
                    <ul className="text-red-400 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {uploadedData.length > 0 && errors.length === 0 && (
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
                    Step 3: Review & Submit
                  </h2>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {uploadedData.length} devices ready
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`border-b ${
                          settings.theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        }`}
                      >
                        <th
                          className={`text-left py-2 px-3 ${
                            settings.theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          Brand
                        </th>
                        <th
                          className={`text-left py-2 px-3 ${
                            settings.theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          Model
                        </th>
                        <th
                          className={`text-left py-2 px-3 ${
                            settings.theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          IMEI
                        </th>
                        <th
                          className={`text-left py-2 px-3 ${
                            settings.theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          Issue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedData.slice(0, 5).map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b ${
                            settings.theme === "dark"
                              ? "border-gray-700"
                              : "border-gray-200"
                          }`}
                        >
                          <td
                            className={`py-2 px-3 ${
                              settings.theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {row.brand}
                          </td>
                          <td
                            className={`py-2 px-3 ${
                              settings.theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {row.model}
                          </td>
                          <td
                            className={`py-2 px-3 ${
                              settings.theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {row.imei}
                          </td>
                          <td
                            className={`py-2 px-3 ${
                              settings.theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {row.issue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {uploadedData.length > 5 && (
                    <p
                      className={`text-sm mt-2 ${
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      ... and {uploadedData.length - 5} more devices
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setUploadedData([])}
                    className={`px-6 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmitBulkOrder}
                    disabled={isProcessing}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Bulk Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div
            className={`rounded-xl p-6 border h-fit ${
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
              Bulk Upload Guide
            </h3>

            <div className="space-y-4">
              <div>
                <h4
                  className={`font-medium mb-2 ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Required Columns:
                </h4>
                <ul
                  className={`text-sm space-y-1 ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  <li>
                    • <strong>Brand:</strong> Device manufacturer
                  </li>
                  <li>
                    • <strong>Model:</strong> Device model name
                  </li>
                  <li>
                    • <strong>IMEI:</strong> 15-digit IMEI number
                  </li>
                  <li>
                    • <strong>Issue:</strong> Problem description
                  </li>
                </ul>
              </div>

              <div>
                <h4
                  className={`font-medium mb-2 ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  File Requirements:
                </h4>
                <ul
                  className={`text-sm space-y-1 ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  <li>• CSV format only</li>
                  <li>• Maximum 1000 devices per upload</li>
                  <li>• First row must contain headers</li>
                  <li>• No empty rows or columns</li>
                </ul>
              </div>

              <div>
                <h4
                  className={`font-medium mb-2 ${
                    settings.theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Processing Time:
                </h4>
                <p
                  className={`text-sm ${
                    settings.theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Large uploads may take a few minutes to process. You'll be
                  redirected to the device management page once complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
