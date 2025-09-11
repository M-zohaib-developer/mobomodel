// ...existing code...
import React, { useState } from "react";
import { Plus, Smartphone, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Device, Order } from "../../types";

interface PlaceOrderPageProps {
  onNavigate: (page: string) => void;
}

export function PlaceOrderPage({ onNavigate }: PlaceOrderPageProps) {
  const { state, dispatch } = useApp();
  const { settings, currentUser } = state;
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    // imei removed
    reportedIssue: "",
    boxes: "1",
    productsPerBox: "1",
    pickupMethod: "self", // 'self' | 'enterprise'
    pickupLocation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    const boxesNum = Number(formData.boxes);
    if (!formData.boxes.trim() || Number.isNaN(boxesNum) || boxesNum < 1) {
      newErrors.boxes = "Number of boxes must be at least 1";
    }

    const productsNum = Number(formData.productsPerBox);
    if (
      !formData.productsPerBox.trim() ||
      Number.isNaN(productsNum) ||
      productsNum < 1
    ) {
      newErrors.productsPerBox = "Products per box must be at least 1";
    }

    if (!formData.reportedIssue.trim()) {
      newErrors.reportedIssue = "Please describe the issue";
    }

    if (
      formData.pickupMethod === "enterprise" &&
      !formData.pickupLocation.trim()
    ) {
      newErrors.pickupLocation =
        "Pickup location is required for enterprise pickup";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentUser) return;

    setIsSubmitting(true);

    try {
      // Create new device (single representative device entry)
      const newDevice: Device = {
        id: Date.now().toString(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        // keep imei empty as it's no longer collected
        imei: "" as any,
        reportedIssue: formData.reportedIssue.trim(),
        status: "pending",
        clientId: currentUser.id,
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const boxesNum = Number(formData.boxes);
      const productsNum = Number(formData.productsPerBox);

      // Create new order with boxes/products and pickup information
      const newOrder: Order = {
        id: Date.now().toString(),
        clientId: currentUser.id,
        devices: [newDevice],
        totalDevices: boxesNum * productsNum,
        completedDevices: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // additional metadata for boxes / pickup
        boxes: boxesNum,
        productsPerBox: productsNum,
        pickupMethod: formData.pickupMethod as "self" | "enterprise",
        pickupLocation:
          formData.pickupMethod === "enterprise"
            ? formData.pickupLocation.trim()
            : "",
      } as any;

      // Update app state
      dispatch({ type: "ADD_DEVICE", payload: newDevice });
      dispatch({ type: "ADD_ORDER", payload: newOrder });

      // Persist to localStorage so order is visible to enterprise/admin/client across sessions
      try {
        const storedOrders = Array.isArray(
          JSON.parse(localStorage.getItem("orders") || "[]")
        )
          ? JSON.parse(localStorage.getItem("orders") || "[]")
          : state.orders || [];
        const updatedOrders = [...storedOrders, newOrder];
        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        const storedDevices = Array.isArray(
          JSON.parse(localStorage.getItem("devices") || "[]")
        )
          ? JSON.parse(localStorage.getItem("devices") || "[]")
          : state.devices || [];
        const updatedDevices = [...storedDevices, newDevice];
        localStorage.setItem("devices", JSON.stringify(updatedDevices));
      } catch {
        // ignore localStorage errors
      }

      // Reset form
      setFormData({
        brand: "",
        model: "",
        reportedIssue: "",
        boxes: "1",
        productsPerBox: "1",
        pickupMethod: "self",
        pickupLocation: "",
      });

      // Navigate to tracking page
      setTimeout(() => {
        onNavigate("order-tracking");
      }, 800);
    } catch (error) {
      setErrors({ general: "Failed to place order. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? value.toString() : value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              settings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Place New Order
          </h1>
          <p
            className={`text-lg ${
              settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Submit your device details for refurbishment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div
            className={`lg:col-span-2 rounded-xl p-6 border ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Device Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Apple, Samsung, Google"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {errors.brand && (
                    <p className="mt-1 text-red-400 text-sm">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Device Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., iPhone 14, Galaxy S23"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {errors.model && (
                    <p className="mt-1 text-red-400 text-sm">{errors.model}</p>
                  )}
                </div>
              </div>

              {/* Number of Boxes & Products per Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Number of Boxes *
                  </label>
                  <input
                    type="number"
                    name="boxes"
                    min={1}
                    value={formData.boxes}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {errors.boxes && (
                    <p className="mt-1 text-red-400 text-sm">{errors.boxes}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Products per Box *
                  </label>
                  <input
                    type="number"
                    name="productsPerBox"
                    min={1}
                    value={formData.productsPerBox}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {errors.productsPerBox && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.productsPerBox}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Reported Issue *
                </label>
                <textarea
                  name="reportedIssue"
                  value={formData.reportedIssue}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the issue with your device in detail..."
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                {errors.reportedIssue && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.reportedIssue}
                  </p>
                )}
              </div>

              {/* Pickup method */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Delivery / Pickup
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="self"
                      checked={formData.pickupMethod === "self"}
                      onChange={handleInputChange}
                      className="form-radio"
                    />
                    <span
                      className={`ml-2 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      I will deliver
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="enterprise"
                      checked={formData.pickupMethod === "enterprise"}
                      onChange={handleInputChange}
                      className="form-radio"
                    />
                    <span
                      className={`ml-2 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Enterprise pickup
                    </span>
                  </label>
                </div>
              </div>

              {/* Conditional pickup location */}
              {formData.pickupMethod === "enterprise" && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    placeholder="Enter pickup address or landmark"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {errors.pickupLocation && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.pickupLocation}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className={`px-6 py-3 rounded-lg border transition-colors duration-200 ${
                    settings.theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Panel */}
          <div
            className={`rounded-xl p-6 border h-fit ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Smartphone className="h-6 w-6 text-green-600 mr-2" />
              <h3
                className={`text-lg font-semibold ${
                  settings.theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Order Process
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Submit Details
                  </h4>
                  <p
                    className={`text-sm ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Provide device information and issue description
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Quality Check
                  </h4>
                  <p
                    className={`text-sm ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Initial assessment and diagnosis
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Technician Work
                  </h4>
                  <p
                    className={`text-sm ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Professional repair and refurbishment
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5">
                  4
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Final Cleaning
                  </h4>
                  <p
                    className={`text-sm ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Device cleaning and final inspection
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5">
                  5
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      settings.theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Completed
                  </h4>
                  <p
                    className={`text-sm ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Device ready for pickup/delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
