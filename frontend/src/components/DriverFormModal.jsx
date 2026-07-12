import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DriverFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseCategory: 'Medium',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    safetyScore: 100,
    region: '',
    status: 'Available',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        licenseIssueDate: initialData.licenseIssueDate ? initialData.licenseIssueDate.split('T')[0] : '',
        licenseExpiryDate: initialData.licenseExpiryDate ? initialData.licenseExpiryDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        employeeId: '',
        phone: '',
        email: '',
        licenseNumber: '',
        licenseCategory: 'Medium',
        licenseIssueDate: '',
        licenseExpiryDate: '',
        safetyScore: 100,
        region: '',
        status: 'Available',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white">{initialData ? 'Edit Driver' : 'Add New Driver'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID *</label>
              <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Number *</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Category</label>
              <select name="licenseCategory" value={formData.licenseCategory} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Issue Date</label>
              <input type="date" name="licenseIssueDate" value={formData.licenseIssueDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Expiry Date *</label>
              <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Safety Score</label>
              <input type="number" min="0" max="100" name="safetyScore" value={formData.safetyScore} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            {initialData && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverFormModal;
