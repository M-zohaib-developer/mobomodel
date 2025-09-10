import React from 'react';
import { Package, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Smartphone, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { state } = useApp();
  const { devices, orders, settings, currentUser, technicians, users } = state;

  const getStatsForRole = () => {
    switch (currentUser?.role) {
      case 'client':
        const clientDevices = devices.filter(d => d.clientId === currentUser.id);
        const clientOrders = orders.filter(o => o.clientId === currentUser.id);
        return {
          total: clientDevices.length,
          pending: clientDevices.filter(d => d.status === 'pending').length,
          inProgress: clientDevices.filter(d => ['qc', 'technician-diagnosis', 'cleaning'].includes(d.status)).length,
          completed: clientDevices.filter(d => d.status === 'completed').length,
          orders: clientOrders.length
        };
      case 'enterprise':
        const enterpriseDevices = devices.filter(d => d.clientId === currentUser.id);
        const enterpriseOrders = orders.filter(o => o.clientId === currentUser.id);
        return {
          total: enterpriseDevices.length,
          pending: enterpriseDevices.filter(d => d.status === 'pending').length,
          inProgress: enterpriseDevices.filter(d => ['qc', 'technician-diagnosis', 'cleaning'].includes(d.status)).length,
          completed: enterpriseDevices.filter(d => d.status === 'completed').length,
          orders: enterpriseOrders.length
        };
      case 'admin':
        return {
          total: devices.length,
          pending: devices.filter(d => d.status === 'pending').length,
          inProgress: devices.filter(d => ['qc', 'technician-diagnosis', 'cleaning'].includes(d.status)).length,
          completed: devices.filter(d => d.status === 'completed').length,
          users: users.length,
          technicians: technicians.length,
          orders: orders.length
        };
      default:
        return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }
  };

  const stats = getStatsForRole();

  const getRecentActivity = () => {
    if (currentUser?.role === 'admin') {
      return devices
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    } else {
      return devices
        .filter(d => d.clientId === currentUser?.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    }
  };

  const recentDevices = getRecentActivity();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'cleaning': return 'text-blue-600 dark:text-blue-400';
      case 'technician-diagnosis': return 'text-yellow-600 dark:text-yellow-400';
      case 'qc': return 'text-purple-600 dark:text-purple-400';
      case 'pending': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getQuickActions = () => {
    switch (currentUser?.role) {
      case 'client':
        return [
          { label: 'Place New Order', action: () => onNavigate('place-order'), color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Track Orders', action: () => onNavigate('order-tracking'), color: 'bg-blue-600 hover:bg-blue-700' }
        ];
      case 'enterprise':
        return [
          { label: 'Bulk Order', action: () => onNavigate('bulk-order'), color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Manage Devices', action: () => onNavigate('device-management'), color: 'bg-blue-600 hover:bg-blue-700' }
        ];
      case 'admin':
        return [
          { label: 'Manage Users', action: () => onNavigate('user-management'), color: 'bg-green-600 hover:bg-green-700' },
          { label: 'View Analytics', action: () => onNavigate('analytics'), color: 'bg-blue-600 hover:bg-blue-700' }
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {currentUser?.name}!
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {currentUser?.role === 'client' && 'Track your device repairs and place new orders'}
            {currentUser?.role === 'enterprise' && 'Manage your bulk device orders and track progress'}
            {currentUser?.role === 'admin' && 'Oversee all operations and manage the system'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:shadow-xl'
          }`}>
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Total Devices
                </p>
                <p className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:shadow-xl'
          }`}>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  In Progress
                </p>
                <p className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:shadow-xl'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Pending
                </p>
                <p className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:shadow-xl'
          }`}>
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Completed
                </p>
                <p className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl p-6 border mb-8 ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`px-6 py-3 text-white rounded-lg transition-colors duration-200 ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl p-6 border ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Activity
            </h2>
          </div>

          {recentDevices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className={`h-12 w-12 mx-auto mb-4 ${
                settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium mb-2 ${
                settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No devices yet
              </p>
              <p className={`mb-4 ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {currentUser?.role === 'client' && 'Place your first order to get started'}
                {currentUser?.role === 'enterprise' && 'Submit your first bulk order'}
                {currentUser?.role === 'admin' && 'No devices in the system yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDevices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                    settings.theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-750'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {device.brand} {device.model}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      IMEI: {device.imei} • Issue: {device.reportedIssue}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium capitalize ${getStatusColor(device.status)}`}>
                      {device.status.replace('-', ' ')}
                    </span>
                    <span className={`text-xs ${
                      settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(device.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}