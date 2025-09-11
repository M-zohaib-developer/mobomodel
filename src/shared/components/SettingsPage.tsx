import React, { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Save,
  Globe,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { state, dispatch } = useApp();
  const { settings, currentUser } = state;
  const [localSettings, setLocalSettings] = useState(settings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
  });

  const handleSettingsChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleThemeChange = (theme: "light" | "dark") => {
    if (currentUser) {
      // Update role-specific theme
      dispatch({
        type: "UPDATE_ROLE_THEME",
        payload: { role: currentUser.role, theme },
      });
    } else {
      // Update global theme
      handleSettingsChange("theme", theme);
    }
  };

  const handleSaveSettings = () => {
    dispatch({ type: "UPDATE_SETTINGS", payload: localSettings });

    // Update user profile if changed
    if (
      profileData.name !== currentUser?.name ||
      profileData.avatar !== currentUser?.avatar
    ) {
      dispatch({
        type: "UPDATE_USER",
        payload: {
          name: profileData.name,
          avatar: profileData.avatar,
        },
      });
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm("Are you absolutely sure? This action cannot be undone.")
    ) {
      localStorage.removeItem("mobocheck-state");
      dispatch({ type: "LOGOUT" });
      onNavigate("login");
    }
    setShowDeleteConfirm(false);
  };

  const handleClearData = () => {
    if (window.confirm("This will delete all your data. Are you sure?")) {
      // Clear user-specific data based on role
      if (currentUser?.role === "admin") {
        // Admin can clear all system data
        dispatch({
          type: "INITIALIZE_STATE",
          payload: {
            ...state,
            devices: [],
            orders: [],
            reports: [],
          },
        });
      } else {
        // Users can only clear their own data
        const userDevices = state.devices.filter(
          (d) => d.clientId !== currentUser?.id
        );
        const userOrders = state.orders.filter(
          (o) => o.clientId !== currentUser?.id
        );

        dispatch({
          type: "INITIALIZE_STATE",
          payload: {
            ...state,
            devices: userDevices,
            orders: userOrders,
          },
        });
      }
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        localSettings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              localSettings.theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Settings
          </h1>
          <p
            className={`text-lg ${
              localSettings.theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Customize your MoboCheck experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div
            className={`rounded-xl p-6 border ${
              localSettings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-green-600 mr-2" />
              <h2
                className={`text-xl font-semibold ${
                  localSettings.theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Profile Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    localSettings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    localSettings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    localSettings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className={`w-full px-3 py-2 rounded-lg border cursor-not-allowed ${
                    localSettings.theme === "dark"
                      ? "bg-gray-750 border-gray-600 text-gray-400"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    localSettings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  value={profileData.avatar}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    localSettings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <div
                  className={`p-3 rounded-lg ${
                    localSettings.theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      localSettings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="font-medium">Role:</span>{" "}
                    {currentUser?.role?.toUpperCase()}
                  </p>
                  <p
                    className={`text-sm ${
                      localSettings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="font-medium">Member Since:</span>{" "}
                    {currentUser
                      ? new Date(currentUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div
            className={`rounded-xl p-6 border ${
              localSettings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-green-600 mr-2" />
              <h2
                className={`text-xl font-semibold ${
                  localSettings.theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Appearance
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
                    localSettings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                      localSettings.theme === "light"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : localSettings.theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                      localSettings.theme === "dark"
                        ? "border-green-600 bg-green-900 text-green-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div
            className={`rounded-xl p-6 border ${
              localSettings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-green-600 mr-2" />
              <h2
                className={`text-xl font-semibold ${
                  localSettings.theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-medium ${
                      localSettings.theme === "dark"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Enable Notifications
                  </h3>
                  <p
                    className={`text-sm ${
                      localSettings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Receive notifications for order updates and status changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications}
                    onChange={(e) =>
                      handleSettingsChange("notifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Settings */}
          <div
            className={`rounded-xl p-6 border ${
              localSettings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-green-600 mr-2" />
              <h2
                className={`text-xl font-semibold ${
                  localSettings.theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-medium ${
                      localSettings.theme === "dark"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Auto-save
                  </h3>
                  <p
                    className={`text-sm ${
                      localSettings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Automatically save your work as you type
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSave}
                    onChange={(e) =>
                      handleSettingsChange("autoSave", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    localSettings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Language
                </label>
                <select
                  value={localSettings.language}
                  onChange={(e) =>
                    handleSettingsChange("language", e.target.value)
                  }
                  className={`w-full max-w-xs px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    localSettings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div
            className={`rounded-xl p-6 border ${
              localSettings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h2
                className={`text-xl font-semibold ${
                  localSettings.theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Data Management
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3
                    className={`font-medium ${
                      localSettings.theme === "dark"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Clear {currentUser?.role === "admin" ? "All System" : "My"}{" "}
                    Data
                  </h3>
                  <p
                    className={`text-sm ${
                      localSettings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {currentUser?.role === "admin"
                      ? "Remove all devices, orders, and reports from the system"
                      : "Remove all your devices and orders"}
                  </p>
                </div>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                >
                  Clear Data
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-red-600 dark:text-red-400">
                      Delete Account
                    </h3>
                    <p
                      className={`text-sm ${
                        localSettings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-md rounded-xl p-6 ${
                localSettings.theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 text-red-600 dark:text-red-400`}
              >
                Delete Account
              </h2>
              <p
                className={`mb-6 ${
                  localSettings.theme === "dark"
                    ? "text-gray-300"
                    : "text-gray-700"
                }`}
              >
                This action cannot be undone. This will permanently delete your
                account and remove all associated data from the system.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    localSettings.theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
