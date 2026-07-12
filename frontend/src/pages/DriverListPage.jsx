import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';
import DriverFormModal from '../components/DriverFormModal';

const DriverListPage = ({ isEmbedded = false }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/drivers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreateOrUpdate = async (driverData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingDriver ? `/api/drivers/${editingDriver._id}` : '/api/drivers';
      const method = editingDriver ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(driverData)
      });
      const data = await response.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchDrivers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('An error occurred while saving the driver.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete driver');
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Expired</span>;
    } else if (diffDays <= 30) {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Expiring Soon</span>;
    }
    return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Valid</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Available': 'bg-green-500/20 text-green-400 border-green-500/30',
      'On Trip': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Off Duty': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'Suspended': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return <span className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status]}`}>{status}</span>;
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    const matchesCategory = categoryFilter ? d.licenseCategory === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className={`space-y-6 ${isEmbedded ? '' : 'pt-0'}`}>
      {/* Header and Search/Add aligned */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Drivers</h2>
          <span className="text-sm text-slate-400 font-medium">Manage driver profiles and compliance</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by name or license number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button className="flex items-center px-4 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition text-sm">
            <Filter size={16} className="mr-2" /> Filters
          </button>
          <button 
            onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} className="mr-2" /> Add Driver
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">License Number</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Safety Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Loading drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">No drivers found.</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-medium text-slate-200">{driver.name}</td>
                    <td className="px-6 py-4">{driver.licenseNumber}</td>
                    <td className="px-6 py-4">{driver.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                        {getExpiryBadge(driver.licenseExpiryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${driver.safetyScore >= 90 ? 'bg-green-500' : driver.safetyScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${driver.safetyScore}%` }}
                          />
                        </div>
                        <span className="text-sm">{driver.safetyScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(driver.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }} className="text-slate-400 hover:text-blue-400 p-2">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(driver._id)} className="text-slate-400 hover:text-red-400 p-2 ml-2">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
          <span>Showing 1 to 5 of 18 drivers</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300">4</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300">{'>'}</button>
          </div>
        </div>
      </div>

      <DriverFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        initialData={editingDriver}
      />
    </div>
  );
};

export default DriverListPage;
