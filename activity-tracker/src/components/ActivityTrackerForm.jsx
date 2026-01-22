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
      (name === 'incidentNumber' ||
        name === 'description' ||
        name === 'processor') &&
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
        setErrors({
          ...errors,
          actionsTaken: 'Commas are not allowed. Press Enter to add each action.'
        });
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

  // 🔴 UPDATED: SEND DATA TO JENKINS
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://<JENKINS_HOST>:8080/job/Incident_Collect/buildWithParameters',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            token: 'incident-trigger',

            INCIDENT_NUMBER: formData.incidentNumber,
            DESCRIPTION: formData.description,
            PROCESSOR: formData.processor,
            ERP_PROJECT: formData.erpProject,
            CATEGORY: formData.category,
            STATUS: formData.status,
            DEADLINE: formData.deadline,
            ACTIONS: formData.actionsTaken.join(' | ')
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger Jenkins job');
      }

      alert('Incident successfully submitted to Jenkins');
      handleReset();
    } catch (error) {
      console.error(error);
      alert('Error submitting incident to Jenkins');
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Activity Tracker</h1>
            <p className="text-blue-100">TWIN BC TEAM Management System</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* FORM CONTENT UNCHANGED */}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg
                ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'}
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Activity'}
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
