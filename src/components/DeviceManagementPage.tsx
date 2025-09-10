import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DeviceManagementPageProps {
  onNavigate: (page: string) => void;
}

export function DeviceManagementPage({ onNavigate }: DeviceManagementPageProps) {
  const { state, dispatch } = useApp();
  const { devices, settings, currentUser } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');

  const enterpriseDevices = devices.filter(d => d.clientId === currentUser?.id);
  
  const filteredDevices = enterpriseDevices.filter(device => {
    const matchesSearch = device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.imei.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesBrand = filterBrand === 'all' || device.brand === filterBrand;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const uniqueBrands = [...new Set(enterpriseDevices.map(d => d.brand))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'qc': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'technician-diagnosis': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'cleaning': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const exportDevices = () => {
    const csvContent = [
      'Brand,Model,IMEI,Issue,Status,Created Date,Last Updated',
      ...filteredDevices.map(device => 
        `"${device.brand}","${device.model}","${device.imei}","${device.reportedIssue}","${device.status}","${new Date(device.createdAt).toLocaleDateString()}","${new Date(device.updatedAt).toLocaleDateString()}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Device Management
            </h1>
            <p className={`text-lg ${
              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Track and manage all your devices in one place
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={exportDevices}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => onNavigate('bulk-order')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Add Devices
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', count: enterpriseDevices.length, color: 'text-blue-600' },
            { label: 'Pending', count: enterpriseDevices.filter(d => d.status === 'pending').length, color: 'text-gray-600' },
            { label: 'In QC', count: enterpriseDevices.filter(d => d.status === 'qc').length, color: 'text-yellow-600' },
            { label: 'With Technician', count: enterpriseDevices.filter(d => d.status === 'technician-diagnosis').length, color: 'text-blue-600' },
            { label: 'Completed', count: enterpriseDevices.filter(d => d.status === 'completed').length, color: 'text-green-600' }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand, model, or IMEI..."
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
              <option value="qc">Quality Check</option>
              <option value="technician-diagnosis">Technician</option>
              <option value="cleaning">Cleaning</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {filteredDevices.length} of {enterpriseDevices.length} devices
              </span>
            </div>
          </div>
        </div>

        {/* Devices Table */}
        {filteredDevices.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`text-6xl mb-4 ${
              settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              📱
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No devices found
            </h3>
            <p className={`mb-6 ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {enterpriseDevices.length === 0 
                ? 'Upload your first batch of devices to get started'
                : 'No devices match your current filters'
              }
            </p>
            {enterpriseDevices.length === 0 && (
              <button
                onClick={() => onNavigate('bulk-order')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Upload Devices
              </button>
            )}
          </div>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  settings.theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Device</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>IMEI</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Issue</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Status</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Created</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device, index) => (
                    <tr key={device.id} className={`border-t ${
                      settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <td className={`py-4 px-4 ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div>
                          <div className="font-medium">{device.brand} {device.model}</div>
                        </div>
                      </td>
                      <td className={`py-4 px-4 font-mono text-sm ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {device.imei}
                      </td>
                      <td className={`py-4 px-4 ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="max-w-xs truncate" title={device.reportedIssue}>
                          {device.reportedIssue}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                          {device.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-sm ${
                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}