import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ActivityTrackerForm() {
  const [formData, setFormData] = useState({
    erpProject: '',
    category: '',
    incidentNumber: '',
    description: '',
    actionsTaken: [],
    processor: '',
    deadline: '',
    status: ''
  });

  const [actionInput, setActionInput] = useState('');
  const [errors, setErrors] = useState({});

  const erpProjects = ['SIDEMONT', 'ERP2', 'ERP3', 'ERP4', 'ERP6', 'CVSS'];
  const categories = ['INCIDENT', 'CHANGE', 'IFOR', 'INFORMATION', 'REPORTS'];
  const statuses = ['COMPLETED', 'IN-PROGRESS', 'WAITING CUSTOMER', 'WAITING VENDOR', 'RESOLVED'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent commas in text inputs
    if ((name === 'incidentNumber' || name === 'description' || name === 'processor') && value.includes(',')) {
      setErrors({ ...errors, [name]: 'Commas are not allowed. Use new lines instead.' });
      return;
    }
    
    setErrors({ ...errors, [name]: '' });
    setFormData({ ...formData, [name]: value });
  };

  const handleActionKeyPress = (e) => {
    if (e.key === 'Enter' && actionInput.trim()) {
      e.preventDefault();
      if (actionInput.includes(',')) {
        setErrors({ ...errors, actionsTaken: 'Commas are not allowed. Press Enter to add each action.' });
        return;
      }
      setFormData({
        ...formData,
        actionsTaken: [...formData.actionsTaken, actionInput.trim()]
      });
      setActionInput('');
      setErrors({ ...errors, actionsTaken: '' });
    }
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actionsTaken: formData.actionsTaken.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
  };

  const handleReset = () => {
    setFormData({
      erpProject: '',
      category: '',
      incidentNumber: '',
      description: '',
      actionsTaken: [],
      processor: '',
      deadline: '',
      status: ''
    });
    setActionInput('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Activity Tracker</h1>
                <p className="text-blue-100">TWIN BC TEAM Management System</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-white font-semibold text-lg">TEAMWORK</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ERP Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ERP Project <span className="text-red-500">*</span>
              </label>
              <select
                name="erpProject"
                value={formData.erpProject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select a project...</option>
                {erpProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category/Activity <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Incident Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Incident/Change Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="incidentNumber"
                  value={formData.incidentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., INC001234"
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
                {formData.incidentNumber && (
                  <button
                    onClick={() => setFormData({ ...formData, incidentNumber: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {errors.incidentNumber && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.incidentNumber}</span>
                </div>
              )}
            </div>

            {/* Processor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Processor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="processor"
                  value={formData.processor}
                  onChange={handleInputChange}
                  placeholder="Enter processor name"
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
                {formData.processor && (
                  <button
                    onClick={() => setFormData({ ...formData, processor: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {errors.processor && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.processor}</span>
                </div>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current/Final Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select status...</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brief Description of Activity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a detailed description..."
                rows="4"
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                required
              />
              {formData.description && (
                <button
                  onClick={() => setFormData({ ...formData, description: '' })}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {errors.description && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.description}</span>
              </div>
            )}
          </div>

          {/* Actions Taken */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Actions Taken <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={actionInput}
                onChange={(e) => {
                  if (e.target.value.includes(',')) {
                    setErrors({ ...errors, actionsTaken: 'Commas are not allowed. Press Enter to add each action.' });
                  } else {
                    setErrors({ ...errors, actionsTaken: '' });
                    setActionInput(e.target.value);
                  }
                }}
                onKeyPress={handleActionKeyPress}
                placeholder="Type an action and press Enter to add..."
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              {actionInput && (
                <button
                  onClick={() => {
                    setActionInput('');
                    setErrors({ ...errors, actionsTaken: '' });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {errors.actionsTaken && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.actionsTaken}</span>
              </div>
            )}
            
            {formData.actionsTaken.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.actionsTaken.map((action, index) => (
                  <div key={index} className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="flex-1 text-gray-700">{index + 1}. {action}</span>
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
            >
              Submit Activity
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}