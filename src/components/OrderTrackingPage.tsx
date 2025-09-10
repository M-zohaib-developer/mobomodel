import React, { useState } from 'react';
import { Search, Eye, Clock, CheckCircle, AlertCircle, Wrench, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OrderTrackingPageProps {
  onNavigate: (page: string) => void;
}

export function OrderTrackingPage({ onNavigate }: OrderTrackingPageProps) {
  const { state } = useApp();
  const { devices, settings, currentUser } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const clientDevices = devices.filter(d => d.clientId === currentUser?.id);
  
  const filteredDevices = clientDevices.filter(device => 
    device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.imei.includes(searchTerm)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      case 'qc': return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'technician-diagnosis': return <Wrench className="h-5 w-5 text-blue-600" />;
      case 'cleaning': return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'qc': return 40;
      case 'technician-diagnosis': return 60;
      case 'cleaning': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { id: 'pending', label: 'Pending', description: 'Order received and queued' },
      { id: 'qc', label: 'Quality Check', description: 'Initial assessment and diagnosis' },
      { id: 'technician-diagnosis', label: 'Technician Work', description: 'Professional repair and refurbishment' },
      { id: 'cleaning', label: 'Final Cleaning', description: 'Device cleaning and final inspection' },
      { id: 'completed', label: 'Completed', description: 'Device ready for pickup/delivery' }
    ];

    const currentIndex = steps.findIndex(step => step.id === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
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
            Order Tracking
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Track the progress of your device repairs
          </p>
        </div>

        {/* Search */}
        <div className={`rounded-xl p-6 border mb-8 ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
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
        </div>

        {/* Devices List */}
        {filteredDevices.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Clock className={`h-16 w-16 mx-auto mb-4 ${
              settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No orders found
            </h3>
            <p className={`mb-6 ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {clientDevices.length === 0 
                ? 'You haven\'t placed any orders yet'
                : 'No orders match your search criteria'
              }
            </p>
            {clientDevices.length === 0 && (
              <button
                onClick={() => onNavigate('place-order')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Place Your First Order
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className={`rounded-xl p-6 border transition-all duration-200 ${
                  settings.theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(device.status)}
                      <h3 className={`text-lg font-semibold ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {device.brand} {device.model}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)}`}>
                        {device.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                        <p className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span className="font-medium">Created:</span> {new Date(device.createdAt).toLocaleDateString()}
                        </p>
                        <p className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span className="font-medium">Last Updated:</span> {new Date(device.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${
                          settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Progress
                        </span>
                        <span className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {getProgressPercentage(device.status)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(device.status)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Estimate */}
                    {device.estimate && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <p className={`text-sm font-medium ${
                          settings.theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                          Estimated Cost: ${device.estimate}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {device.notes.length > 0 && (
                      <div className={`p-3 rounded-lg ${
                        settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <h4 className={`text-sm font-medium mb-2 ${
                          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Technician Notes:
                        </h4>
                        <div className="space-y-1">
                          {device.notes.map((note, index) => (
                            <p key={index} className={`text-sm ${
                              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              • {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedDevice(selectedDevice === device.id ? null : device.id)}
                    className={`ml-4 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedDevice === device.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Detailed Status Steps */}
                {selectedDevice === device.id && (
                  <div className={`border-t pt-6 ${
                    settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Detailed Progress
                    </h4>
                    <div className="space-y-4">
                      {getStatusSteps(device.status).map((step, index) => (
                        <div key={step.id} className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                            step.isCompleted 
                              ? 'bg-green-600 text-white' 
                              : step.isCurrent
                              ? 'bg-blue-600 text-white'
                              : settings.theme === 'dark'
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              step.isCompleted || step.isCurrent
                                ? settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                                : settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </h5>
                            <p className={`text-sm ${
                              step.isCompleted || step.isCurrent
                                ? settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                : settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}