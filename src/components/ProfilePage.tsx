import React, { useState } from 'react';
import { User, Camera, Save, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { state, dispatch } = useApp();
  const { currentUser, settings } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch({ 
      type: 'UPDATE_USER', 
      payload: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        avatar: formData.avatar
      }
    });

    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      avatar: currentUser?.avatar || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Profile
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className={`lg:col-span-1 rounded-xl p-6 border ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-green-600 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">
                      {currentUser ? getInitials(currentUser.name) : 'U'}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-200">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              )}

              <h2 className={`text-xl font-semibold mt-4 ${
                settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {currentUser?.name}
              </h2>
              <p className={`${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className={`lg:col-span-2 rounded-xl p-6 border ${
            settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${
                settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Account Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      settings.theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      isEditing
                        ? settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        : settings.theme === 'dark'
                        ? 'bg-gray-750 border-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      isEditing
                        ? settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        : settings.theme === 'dark'
                        ? 'bg-gray-750 border-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Member Since
                </label>
                <input
                  type="text"
                  value={currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : ''}
                  disabled
                  className={`w-full px-3 py-2 rounded-lg border cursor-not-allowed ${
                    settings.theme === 'dark'
                      ? 'bg-gray-750 border-gray-600 text-gray-300'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className={`mt-8 rounded-xl p-6 border ${
          settings.theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Account Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                settings.theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {state.tasks.length}
              </div>
              <div className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Tasks
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                settings.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {state.tasks.filter(task => task.status === 'completed').length}
              </div>
              <div className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Completed Tasks
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                settings.theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {Math.round((state.tasks.filter(task => task.status === 'completed').length / Math.max(state.tasks.length, 1)) * 100)}%
              </div>
              <div className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Completion Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}