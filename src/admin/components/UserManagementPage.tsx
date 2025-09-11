import React, { useState } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  UserCheck,
  Building,
  Shield,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { User } from "../../types";

interface UserManagementPageProps {
  onNavigate: (page: string) => void;
}

export function UserManagementPage({ onNavigate }: UserManagementPageProps) {
  const { state, dispatch } = useApp();
  const { users, settings } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "client" as User["role"],
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      role: "client",
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.name.trim() || !userForm.email.trim()) return;

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
      };

      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: "ADD_USER", payload: newUser });
    }

    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch({ type: "DELETE_USER", payload: userId });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "client":
        return <UserCheck className="h-4 w-4" />;
      case "enterprise":
        return <Building className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "enterprise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              User Management
            </h1>
            <p
              className={`text-lg ${
                settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Manage system users and their permissions
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              count: users.length,
              color: "text-blue-600",
            },
            {
              label: "Clients",
              count: users.filter((u) => u.role === "client").length,
              color: "text-green-600",
            },
            {
              label: "Enterprises",
              count: users.filter((u) => u.role === "enterprise").length,
              color: "text-purple-600",
            },
            {
              label: "Admins",
              count: users.filter((u) => u.role === "admin").length,
              color: "text-red-600",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border ${
                settings.theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.count}
              </div>
              <div
                className={`text-sm ${
                  settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className={`rounded-xl p-6 border mb-8 ${
            settings.theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
                  settings.theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                settings.theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="enterprise">Enterprises</option>
              <option value="admin">Admins</option>
            </select>
            <div className="flex items-center">
              <span
                className={`text-sm ${
                  settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
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
                    User
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Email
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Role
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
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
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
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm flex items-center justify-center mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-4 ${
                        settings.theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td
                      className={`py-4 px-4 text-sm ${
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            settings.theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-md rounded-xl p-6 ${
                settings.theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  settings.theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {editingUser ? "Edit User" : "Add New User"}
              </h2>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as User["role"],
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="client">Client</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    {editingUser ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
