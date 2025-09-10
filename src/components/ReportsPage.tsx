import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { state } = useApp();
  const { devices, reports, settings, currentUser } = state;
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html'>('pdf');
  const [filterStatus, setFilterStatus] = useState('all');

  const getCompletedDevices = () => {
    if (currentUser?.role === 'admin') {
      return devices.filter(d => d.status === 'completed');
    } else {
      return devices.filter(d => d.clientId === currentUser?.id && d.status === 'completed');
    }
  };

  const completedDevices = getCompletedDevices();
  
  const filteredDevices = filterStatus === 'all' 
    ? completedDevices 
    : completedDevices.filter(d => d.status === filterStatus);

  const generateReport = (device: any) => {
    const report = {
      id: Date.now().toString(),
      deviceId: device.id,
      orderId: device.orderId || 'N/A',
      summary: `Refurbishment completed for ${device.brand} ${device.model}`,
      workDone: [
        'Initial quality assessment',
        'Diagnostic testing',
        'Component repair/replacement',
        'Final cleaning and inspection',
        'Quality assurance testing'
      ],
      partsReplaced: ['Screen protector', 'Battery (if applicable)'],
      finalStatus: 'Fully refurbished and tested',
      technicianNotes: device.notes.join('. ') || 'Device successfully refurbished to factory standards.',
      createdAt: new Date().toISOString()
    };

    return report;
  };

  const downloadReport = (device: any, format: 'pdf' | 'html') => {
    const report = generateReport(device);
    
    if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MoboCheck Refurbishment Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            ul { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MoboCheck Refurbishment Report</h1>
            <p>Report ID: ${report.id}</p>
            <p>Generated: ${new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Device Information</h2>
            <p><span class="label">Brand:</span> ${device.brand}</p>
            <p><span class="label">Model:</span> ${device.model}</p>
            <p><span class="label">IMEI:</span> ${device.imei}</p>
            <p><span class="label">Original Issue:</span> ${device.reportedIssue}</p>
          </div>
          
          <div class="section">
            <h2>Work Summary</h2>
            <p>${report.summary}</p>
          </div>
          
          <div class="section">
            <h2>Work Performed</h2>
            <ul>
              ${report.workDone.map(work => `<li>${work}</li>`).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Parts Replaced</h2>
            <ul>
              ${report.partsReplaced.map(part => `<li>${part}</li>`).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Technician Notes</h2>
            <p>${report.technicianNotes}</p>
          </div>
          
          <div class="section">
            <h2>Final Status</h2>
            <p><span class="label">Status:</span> ${report.finalStatus}</p>
            <p><span class="label">Completion Date:</span> ${new Date(device.updatedAt).toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoboCheck_Report_${device.brand}_${device.model}_${device.imei}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we'll create a simple text version (in a real app, you'd use a PDF library)
      const textContent = `
MOBOCHECK REFURBISHMENT REPORT
==============================

Report ID: ${report.id}
Generated: ${new Date(report.createdAt).toLocaleDateString()}

DEVICE INFORMATION
------------------
Brand: ${device.brand}
Model: ${device.model}
IMEI: ${device.imei}
Original Issue: ${device.reportedIssue}

WORK SUMMARY
------------
${report.summary}

WORK PERFORMED
--------------
${report.workDone.map(work => `• ${work}`).join('\n')}

PARTS REPLACED
--------------
${report.partsReplaced.map(part => `• ${part}`).join('\n')}

TECHNICIAN NOTES
----------------
${report.technicianNotes}

FINAL STATUS
------------
Status: ${report.finalStatus}
Completion Date: ${new Date(device.updatedAt).toLocaleDateString()}
      `;
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoboCheck_Report_${device.brand}_${device.model}_${device.imei}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadBulkReports = () => {
    if (currentUser?.role === 'enterprise' || currentUser?.role === 'admin') {
      // Create CSV for bulk download
      const csvContent = [
        'Device Brand,Device Model,IMEI,Original Issue,Status,Completion Date,Technician Notes',
        ...filteredDevices.map(device => 
          `"${device.brand}","${device.model}","${device.imei}","${device.reportedIssue}","${device.status}","${new Date(device.updatedAt).toLocaleDateString()}","${device.notes.join('; ')}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoboCheck_Bulk_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
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
            Reports
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            View and download refurbishment reports
          </p>
        </div>

        {/* Controls */}
        <div className={`rounded-xl p-6 border mb-8 ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Download Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'html')}
                  className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="pdf">Text File</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Completed</option>
                  <option value="completed">Completed Only</option>
                </select>
              </div>
            </div>

            {(currentUser?.role === 'enterprise' || currentUser?.role === 'admin') && filteredDevices.length > 0 && (
              <button
                onClick={downloadBulkReports}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Bulk CSV
              </button>
            )}
          </div>
        </div>

        {/* Reports List */}
        {filteredDevices.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <FileText className={`h-16 w-16 mx-auto mb-4 ${
              settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No completed reports
            </h3>
            <p className={`mb-6 ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Reports will appear here once your devices are completed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                  settings.theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <h3 className={`text-lg font-semibold ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {device.brand} {device.model} Report
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        COMPLETED
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
                          <span className="font-medium">Original Issue:</span> {device.reportedIssue}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span className="font-medium">Completed:</span> {new Date(device.updatedAt).toLocaleDateString()}
                        </p>
                        {device.estimate && (
                          <p className={`text-sm ${
                            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="font-medium">Cost:</span> ${device.estimate}
                          </p>
                        )}
                      </div>
                    </div>

                    {device.notes.length > 0 && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <h4 className={`text-sm font-medium mb-2 ${
                          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Work Summary:
                        </h4>
                        <p className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {device.notes.join('. ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => downloadReport(device, selectedFormat)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download {selectedFormat.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}