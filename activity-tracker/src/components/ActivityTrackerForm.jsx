import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ActivityTrackerForm() {
  const [formData, setFormData] = useState({
    incidentNumber: '',
    description: '',
    assignee: '',
    deadline: '',
    actionsTaken: []
  });

  const [actionInput, setActionInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'incidentNumber' || name === 'description' || name === 'assignee') && value.includes(',')) {
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

  // ✅ SEND TO collect.sh (CGI)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerMessage('');

    try {
      const body = new URLSearchParams({
        INCIDENT_NUMBER: formData.incidentNumber,
        INCIDENT_TEXT: formData.description,
        ASSIGNEE: formData.assignee,
        DEADLINE: formData.deadline,
        ACTIONS: formData.actionsTaken.join(' | ')
      });

      const response = await fetch('/cgi-bin/collect.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error('Server error while submitting form');
      }

      setServerMessage(text);
      handleReset();
    } catch (err) {
      console.error(err);
      alert('❌ Error submitting form to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      incidentNumber: '',
      description: '',
      assignee: '',
      deadline: '',
      actionsTaken: []
    });
    setActionInput('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-1">Activity Tracker</h1>
            <p className="text-blue-100">TWIN BC TEAM Management System</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">

          {/* Incident Number */}
          <div>
            <label className="block font-semibold mb-2">Incident Number *</label>
            <input
              type="text"
              name="incidentNumber"
              value={formData.incidentNumber}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3"
            />
            {errors.incidentNumber && (
              <p className="text-red-600 text-sm flex gap-2 mt-1">
                <AlertCircle size={16} /> {errors.incidentNumber}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block font-semibold mb-2">Assignee *</label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block font-semibold mb-2">Deadline *</label>
            <input
              type="text"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3"
            />
          </div>

          {/* Actions */}
          <div>
            <label className="block font-semibold mb-2">Actions *</label>
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              onKeyDown={handleActionKeyPress}
              placeholder="Type action and press Enter"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3"
            />

            {formData.actionsTaken.map((a, i) => (
              <div key={i} className="flex justify-between items-center mt-2 bg-blue-50 px-4 py-2 rounded">
                <span>{a}</span>
                <button onClick={() => removeAction(i)} className="text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-semibold text-white ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 py-3 rounded-lg font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Server Response */}
          {serverMessage && (
            <div
              className="mt-6 p-4 border rounded bg-green-50 text-green-800"
              dangerouslySetInnerHTML={{ __html: serverMessage }}
            />
          )}

        </div>
      </div>
    </div>
  );
}
