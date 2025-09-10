import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Technician } from '../types';

interface TechnicianManagementPageProps {
  onNavigate: (page: string) => void;
}

export function TechnicianManagementPage({ onNavigate }: TechnicianManagementPageProps) {
  const { state, dispatch } = useApp();
  const { technicians, devices, settings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [showTechModal, setShowTechModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [techForm, setTechForm] = useState({
    name: '',
    email: '',
    specialization: ''
  });

  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTechnician = () => {
    setEditingTech(null);
    setTechForm({
      name: '',
      email: '',
      specialization: ''
    });
    setShowTechModal(true);
  };

  const handleEditTechnician = (tech: Technician) => {
    setEditingTech(tech);
    setTechForm({
      name: tech.name,
      email: tech.email,
      specialization: tech.specialization
    });
    setShowTechModal(true);
  };

  const handleSaveTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!techForm.name.trim() || !techForm.email.trim() || !techForm.specialization.trim()) return;

    if (editingTech) {
      const updatedTech: Technician = {
        ...editingTech,
        name: techForm.name.trim(),
        email: techForm.email.trim(),
        specialization: techForm.specialization.trim()
      };
      
      dispatch({ type: 'UPDATE_TECHNICIAN', payload: updatedTech });
    } else {
      const newTech: Technician = {
        id: Date.now().toString(),
        name: techForm.name.trim(),
        email: techForm.email.trim(),
        specialization: techForm.specialization.trim(),
        assignedDevices: [],
        completedDevices: 0,
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_TECHNICIAN', payload: newTech });
    }

    setShowTechModal(false);
    setEditingTech(null);
  };

  const handleDeleteTechnician = (techId: string) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      dispatch({ type: 'DELETE_TECHNICIAN', payload: techId });
    }
  };

  const getTechnicianStats = (techId: string) => {
    const assignedCount = devices.filter(d => d.technicianId === techId).length;
    const completedCount = devices.filter(d => d.technicianId === techId && d.status === 'completed').length;
    return { assignedCount, completedCount };
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
              Technician Management
            </h1>
            <p className={`text-lg ${
              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage technicians and their workload
            </p>
          </div>
          <button
            onClick={handleCreateTechnician}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Technician
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Technicians', count: technicians.length, color: 'text-blue-600' },
            { label: 'Active Assignments', count: devices.filter(d => d.technicianId).length, color: 'text-yellow-600' },
            { label: 'Completed Today', count: devices.filter(d => d.status === 'completed' && new Date(d.updatedAt).toDateString() === new Date().toDateString()).length, color: 'text-green-600' },
            { label: 'Average Load', count: Math.round(devices.filter(d => d.technicianId).length / Math.max(technicians.length, 1)), color: 'text-purple-600' }
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
              placeholder="Search technicians..."
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

        {/* Technicians Grid */}
        {filteredTechnicians.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Wrench className={`h-16 w-16 mx-auto mb-4 ${
              settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No technicians found
            </h3>
            <p className={`mb-6 ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {technicians.length === 0 
                ? 'Add your first technician to get started'
                : 'No technicians match your search criteria'
              }
            </p>
            {technicians.length === 0 && (
              <button
                onClick={handleCreateTechnician}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Add First Technician
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((technician) => {
              const stats = getTechnicianStats(technician.id);
              
              return (
                <div
                  key={technician.id}
                  className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                    settings.theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                      : 'bg-white border-gray-200 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-600 text-white text-lg flex items-center justify-center mr-3">
                        {technician.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {technician.name}
                        </h3>
                        <p className={`text-sm ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {technician.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTechnician(technician)}
                        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                        title="Edit Technician"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTechnician(technician.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                        title="Delete Technician"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg mb-4 ${
                    settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Wrench className="h-4 w-4 text-green-600 mr-2" />
                      <span className={`font-medium ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Specialization
                      </span>
                    </div>
                    <p className={`text-sm ${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {technician.specialization}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        stats.assignedCount > 0 ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {stats.assignedCount}
                      </div>
                      <div className={`text-xs ${
                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Assigned
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        stats.completedCount > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {stats.completedCount}
                      </div>
                      <div className={`text-xs ${
                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Completed
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 pt-4 border-t ${
                    settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <p className={`text-xs ${
                      settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Joined {new Date(technician.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Technician Modal */}
        {showTechModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md rounded-xl p-6 ${
              settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {editingTech ? 'Edit Technician' : 'Add New Technician'}
              </h2>

              <form onSubmit={handleSaveTechnician} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={techForm.name}
                    onChange={(e) => setTechForm({...techForm, name: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={techForm.email}
                    onChange={(e) => setTechForm({...techForm, email: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={techForm.specialization}
                    onChange={(e) => setTechForm({...techForm, specialization: e.target.value})}
                    placeholder="e.g., Screen Repair, Battery Replacement"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTechModal(false)}
                    className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    {editingTech ? 'Update Technician' : 'Add Technician'}
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