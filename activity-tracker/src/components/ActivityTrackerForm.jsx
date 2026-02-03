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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const erpProjects = ['SIDEMONT', 'ERP2', 'ERP3', 'ERP4', 'ERP6', 'CVSS'];
  const categories = ['INCIDENT', 'CHANGE', 'IFOR', 'INFORMATION', 'REPORTS'];
  const statuses = ['COMPLETED', 'IN-PROGRESS', 'WAITING CUSTOMER', 'WAITING VENDOR', 'RESOLVED'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      ['incidentNumber', 'description', 'processor'].includes(name) &&
      value.includes(',')
    ) {
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
        setErrors({ ...errors, actionsTaken: 'Commas are not allowed.' });
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

  const validateForm = () => {
    if (
      !formData.erpProject ||
      !formData.category ||
      !formData.incidentNumber ||
      !formData.processor ||
      !formData.deadline ||
      !formData.status
    ) {
      alert('Please fill all required fields');
      return false;
    }
    return true;
  };

  // ✅ BEST PRACTICE SUBMIT (CALL collect.sh)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/collect.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          INCIDENT_NUMBER: formData.incidentNumber,
          DESCRIPTION: formData.description,
          PROCESSOR: formData.processor,
          ERP_PROJECT: formData.erpProject,
          CATEGORY: formData.category,
          STATUS: formData.status,
          DEADLINE: formData.deadline,
          ACTIONS: formData.actionsTaken.join(' | ')
        })
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      alert('Activity successfully submitted');
      handleReset();
    } catch (err) {
      console.error(err);
      alert('Error submitting activity');
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-white">Activity Tracker</h1>
            <p className="text-blue-100">TWIN BC TEAM Management System</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ERP */}
            <div>
              <label className="font-semibold">ERP Project *</label>
              <select name="erpProject" value={formData.erpProject} onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3">
                <option value="">Select</option>
                {erpProjects.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold">Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3">
                <option value="">Select</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Incident */}
            <div>
              <label className="font-semibold">Incident Number *</label>
              <input name="incidentNumber" value={formData.incidentNumber}
                onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3" />
            </div>

            {/* Processor */}
            <div>
              <label className="font-semibold">Processor *</label>
              <input name="processor" value={formData.processor}
                onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3" />
            </div>

            {/* Deadline */}
            <div>
              <label className="font-semibold">Deadline *</label>
              <input type="date" name="deadline" value={formData.deadline}
                onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3" />
            </div>

            {/* Status */}
            <div>
              <label className="font-semibold">Status *</label>
              <select name="status" value={formData.status}
                onChange={handleInputChange}
                className="w-full border-2 rounded px-4 py-3">
                <option value="">Select</option>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="font-semibold">Description *</label>
            <textarea rows={4} name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border-2 rounded px-4 py-3" />
          </div>

          {/* Actions */}
          <div className="mt-6">
            <label className="font-semibold">Actions Taken *</label>
            <input value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              onKeyDown={handleActionKeyPress}
              placeholder="Press Enter to add"
              className="w-full border-2 rounded px-4 py-3" />

            {formData.actionsTaken.map((a, i) => (
              <div key={i} className="flex justify-between bg-blue-50 mt-2 px-4 py-2 rounded">
                <span>{a}</span>
                <button onClick={() => removeAction(i)} className="text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-semibold text-white
                ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSubmitting ? 'Submitting…' : 'Submit Activity'}
            </button>

            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 py-3 rounded-lg font-semibold">
              Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}