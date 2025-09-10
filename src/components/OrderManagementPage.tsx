import React, { useState } from 'react';
import { Package, Search, Eye, Edit, UserCheck, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OrderManagementPageProps {
  onNavigate: (page: string) => void;
}

export function OrderManagementPage({ onNavigate }: OrderManagementPageProps) {
  const { state, dispatch } = useApp();
  const { orders, devices, users, technicians, settings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const client = users.find(u => u.id === order.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getOrderDevices = (orderId: string) => {
    return devices.filter(d => d.clientId === orders.find(o => o.id === orderId)?.clientId);
  };

  const assignTechnician = (deviceId: string, technicianId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      const updatedDevice = {
        ...device,
        technicianId,
        status: 'technician-diagnosis' as const,
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'UPDATE_DEVICE', payload: updatedDevice });

      // Update technician's assigned devices
      const technician = technicians.find(t => t.id === technicianId);
      if (technician) {
        const updatedTechnician = {
          ...technician,
          assignedDevices: [...technician.assignedDevices, deviceId]
        };
        dispatch({ type: 'UPDATE_TECHNICIAN', payload: updatedTechnician });
      }
    }
  };

  const updateDeviceStatus = (deviceId: string, newStatus: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      const updatedDevice = {
        ...device,
        status: newStatus as any,
        updatedAt: new Date().toISOString(),
        completedAt: newStatus === 'completed' ? new Date().toISOString() : device.completedAt
      };
      dispatch({ type: 'UPDATE_DEVICE', payload: updatedDevice });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'qc': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'technician-diagnosis': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'cleaning': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
            Order Management
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Monitor and manage all orders across the system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', count: orders.length, color: 'text-blue-600' },
            { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'text-gray-600' },
            { label: 'In Progress', count: orders.filter(o => o.status === 'in-progress').length, color: 'text-yellow-600' },
            { label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: 'text-green-600' }
          ].map((stat, index) => (
            <div key={index} className={`rounded-xl p-4 border ${
              settings.theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.count}
              </div>
              <div className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`rounded-xl p-6 border mb-8 ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex items-center">
              <span className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Package className={`h-16 w-16 mx-auto mb-4 ${
              settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No orders found
            </h3>
            <p className={`${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No orders match your current filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const client = users.find(u => u.id === order.clientId);
              const orderDevices = getOrderDevices(order.id);
              const isExpanded = selectedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-xl p-6 border transition-all duration-200 ${
                    settings.theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <h3 className={`text-lg font-semibold ${
                          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Order #{order.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Client:</span> {client?.name}
                          </p>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Type:</span> {client?.role === 'enterprise' ? 'Enterprise' : 'Individual'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Total Devices:</span> {order.totalDevices}
                          </p>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Completed:</span> {order.completedDevices}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Updated:</span> {new Date(order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                      className={`ml-4 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        settings.theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isExpanded ? 'Hide Devices' : 'View Devices'}
                    </button>
                  </div>

                  {/* Device Details */}
                  {isExpanded && (
                    <div className={`border-t pt-6 ${
                      settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <h4 className={`text-lg font-semibold mb-4 ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Devices in this Order
                      </h4>
                      <div className="space-y-3">
                        {orderDevices.map((device) => {
                          const assignedTechnician = technicians.find(t => t.id === device.technicianId);
                          
                          return (
                            <div
                              key={device.id}
                              className={`p-4 rounded-lg border ${
                                settings.theme === 'dark' ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h5 className={`font-medium ${
                                      settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {device.brand} {device.model}
                                    </h5>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                                      {device.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className={`text-sm ${
                                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        <span className="font-medium">IMEI:</span> {device.imei}
                                      </p>
                                      <p className={`text-sm ${
                                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        <span className="font-medium">Issue:</span> {device.reportedIssue}
                                      </p>
                                    </div>
                                    <div>
                                      {assignedTechnician && (
                                        <p className={`text-sm ${
                                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                          <span className="font-medium">Technician:</span> {assignedTechnician.name}
                                        </p>
                                      )}
                                      {device.estimate && (
                                        <p className={`text-sm ${
                                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                          <span className="font-medium">Estimate:</span> ${device.estimate}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  {!device.technicianId && device.status === 'qc' && (
                                    <select
                                      onChange={(e) => assignTechnician(device.id, e.target.value)}
                                      className={`px-3 py-1 rounded-md border text-sm ${
                                        settings.theme === 'dark'
                                          ? 'bg-gray-700 border-gray-600 text-white'
                                          : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    >
                                      <option value="">Assign Technician</option>
                                      {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                                      ))}
                                    </select>
                                  )}
                                  
                                  <select
                                    value={device.status}
                                    onChange={(e) => updateDeviceStatus(device.id, e.target.value)}
                                    className={`px-3 py-1 rounded-md border text-sm ${
                                      settings.theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="qc">Quality Check</option>
                                    <option value="technician-diagnosis">Technician</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}