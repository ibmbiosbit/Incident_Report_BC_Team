import React, { useState } from 'react';
import logo from '../assets/logo.jpeg';
import { AlertCircle, X, Plus, ChevronDown } from 'lucide-react';


const FIELD_STYLE = `
  w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-800
  focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500
  placeholder-gray-400 transition-all duration-150
`;

const LABEL_STYLE = `block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5`;

const noComma = (value) => !value.includes(',');

export default function ActivityTrackerForm() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    incidentNumber: '',
    description: '',
    assignee: '',
    deadline: '',
    startDate: '',
    actionsTaken: [],
    priority: '',
    status: '',
  });

  const [actionInput, setActionInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['projectTitle', 'incidentNumber', 'description', 'assignee'].includes(name) && value.includes(',')) {
      setErrors((prev) => ({ ...prev, [name]: 'Commas are not allowed in this field.' }));
      return;
    }
    if (name === 'description' && value.length > 45) {
      setErrors((prev) => ({ ...prev, description: 'Maximum 45 characters allowed.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActionKeyPress = (e) => {
    if (e.key === 'Enter' && actionInput.trim()) {
      e.preventDefault();
      if (actionInput.includes(',')) {
        setErrors((prev) => ({ ...prev, actionsTaken: 'Commas are not allowed. Press Enter to add each action.' }));
        return;
      }
      if (actionInput.trim().length > 45) {
        setErrors((prev) => ({ ...prev, actionsTaken: 'Maximum 45 characters per action.' }));
        return;
      }
      setFormData((prev) => ({ ...prev, actionsTaken: [...prev.actionsTaken, actionInput.trim()] }));
      setActionInput('');
      setErrors((prev) => ({ ...prev, actionsTaken: '' }));
    }
  };

  const addAction = () => {
    if (!actionInput.trim()) return;
    if (actionInput.includes(',')) {
      setErrors((prev) => ({ ...prev, actionsTaken: 'Commas are not allowed.' }));
      return;
    }
    if (actionInput.trim().length > 45) {
      setErrors((prev) => ({ ...prev, actionsTaken: 'Maximum 45 characters per action.' }));
      return;
    }
    setFormData((prev) => ({ ...prev, actionsTaken: [...prev.actionsTaken, actionInput.trim()] }));
    setActionInput('');
    setErrors((prev) => ({ ...prev, actionsTaken: '' }));
  };

  const removeAction = (index) => {
    setFormData((prev) => ({ ...prev, actionsTaken: prev.actionsTaken.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Required';
    if (!formData.incidentNumber.trim()) newErrors.incidentNumber = 'Required';
    if (!formData.description.trim()) newErrors.description = 'Required';
    if (!formData.assignee.trim()) newErrors.assignee = 'Required';
    if (!formData.deadline) newErrors.deadline = 'Required';
    if (!formData.priority) newErrors.priority = 'Required';
    if (!formData.status) newErrors.status = 'Required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    try {
      const body = new URLSearchParams({
        PROJECT_TITLE: formData.projectTitle,
        INCIDENT_NUMBER: formData.incidentNumber,
        INCIDENT_TEXT: formData.description,
        ASSIGNEE: formData.assignee,
        START_DATE: formData.startDate,
        DEADLINE: formData.deadline,
        PRIORITY: formData.priority,
        STATUS: formData.status,
        ACTIONS: formData.actionsTaken.join(' | '),
      });

      const response = await fetch('/cgi-bin/collect.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const text = await response.text();
      if (!response.ok) throw new Error('Server error while submitting form');
      setServerMessage(text);
    } catch (err) {
      console.error(err);
      alert('Error submitting form to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      projectTitle: '',
      incidentNumber: '',
      description: '',
      assignee: '',
      deadline: '',
      startDate: '',
      actionsTaken: [],
      priority: '',
      status: '',
    });
    setActionInput('');
    setErrors({});
    setServerMessage('');
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle size={12} /> {errors[name]}
      </p>
    ) : null;

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4"
    >
      {/* Load DM Sans */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <img
              src={logo}
              alt="Teamwork Logo"
              style={{ height: '40px', objectFit: 'contain' }}
            />
          </div>
          <h1
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: '-0.02em' }}
            className="text-3xl text-slate-900"
          >
            Activity Tracker
          </h1>
          <p className="text-sm text-gray-400 mt-1">Incident management &amp; task coordination</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Section: Project Info */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5">Project Details</p>

            {/* Project Title */}
            <div className="mb-5">
              <label className={LABEL_STYLE}>Project Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                placeholder="e.g. Network Infrastructure Upgrade"
                className={`${FIELD_STYLE} ${errors.projectTitle ? 'border-red-300' : ''}`}
              />
              <FieldError name="projectTitle" />
            </div>

            {/* Incident Number + Priority */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={LABEL_STYLE}>Incident/Change Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="incidentNumber"
                  value={formData.incidentNumber}
                  onChange={handleInputChange}
                  placeholder="INC-00001 or CHG-00001"
                  className={`${FIELD_STYLE} ${errors.incidentNumber ? 'border-red-300' : ''}`}
                />
                <FieldError name="incidentNumber" />
              </div>
              <div>
                <label className={LABEL_STYLE}>Priority <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`${FIELD_STYLE} appearance-none pr-8 ${errors.priority ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <FieldError name="priority" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={LABEL_STYLE}>Status <span className="text-red-400">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setFormData((p) => ({ ...p, status: s })); setErrors((p) => ({ ...p, status: '' })); }}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-all duration-150 ${
                      formData.status === s
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <FieldError name="status" />
            </div>
          </div>

          {/* Section: Description & People */}
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5">Incident Details</p>

            {/* Description */}
            <div className="mb-5">
              <label className={LABEL_STYLE}>Description <span className="text-red-400">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                maxLength={45}
                placeholder="Describe the incident or task in detail..."
                className={`${FIELD_STYLE} resize-none leading-relaxed ${errors.description ? 'border-red-300' : ''}`}
              />
              <div className="flex justify-between items-center mt-1">
                <FieldError name="description" />
                <span className={`text-xs ml-auto ${formData.description.length >= 45 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formData.description.length}/45
                </span>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className={LABEL_STYLE}>Assignee <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                placeholder="Full name"
                className={`${FIELD_STYLE} ${errors.assignee ? 'border-red-300' : ''}`}
              />
              <FieldError name="assignee" />
            </div>
          </div>

          {/* Section: Dates */}
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5">Timeline</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`${FIELD_STYLE} cursor-pointer`}
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Deadline <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className={`${FIELD_STYLE} cursor-pointer ${errors.deadline ? 'border-red-300' : ''}`}
                />
                <FieldError name="deadline" />
              </div>
            </div>
          </div>

          {/* Section: Actions */}
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5">Actions Taken</p>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  onKeyDown={handleActionKeyPress}
                  maxLength={45}
                  placeholder="Describe an action and press Enter or +"
                  className={`${FIELD_STYLE} w-full pr-12`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${actionInput.length >= 45 ? 'text-red-400' : 'text-gray-400'}`}>
                  {actionInput.length}/45
                </span>
              </div>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-2.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors duration-150 flex items-center"
              >
                <Plus size={16} />
              </button>
            </div>
            <FieldError name="actionsTaken" />

            {formData.actionsTaken.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {formData.actionsTaken.map((a, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-md"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-400 w-5">{String(i + 1).padStart(2, '0')}</span>
                      {a}
                    </span>
                    <button onClick={() => removeAction(i)} className="text-gray-300 hover:text-red-400 transition-colors ml-3 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-8 py-6 bg-gray-50 flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:border-gray-400 hover:text-gray-700 transition-all duration-150"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Entry'}
            </button>
          </div>
        </div>

        {/* Server Response */}
        {serverMessage && (
          <div
            className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800"
            dangerouslySetInnerHTML={{ __html: serverMessage }}
          />
        )}

        <p className="text-center text-xs text-gray-300 mt-6">Activity Management System</p>
      </div>
    </div>
  );
}