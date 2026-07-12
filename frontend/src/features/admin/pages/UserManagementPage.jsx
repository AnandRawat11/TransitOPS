import React, { useState } from 'react';
import { useAdminUsers, useUpdateUserRole, useToggleUserStatus } from '../hooks/useAdmin';
import { Search, ShieldAlert, UserCheck, UserX } from 'lucide-react';

const UserManagementPage = () => {
  const [search, setSearch] = useState('');
  const { data: usersData, isLoading } = useAdminUsers(search);
  const users = usersData?.data || [];
  
  const roleMutation = useUpdateUserRole();
  const statusMutation = useToggleUserStatus();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-600">Enterprise Administration Panel</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <select 
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ id: user._id, role: e.target.value })}
                      disabled={roleMutation.isPending}
                      className="bg-slate-100 border-none text-xs font-semibold px-2 py-1 rounded text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="FLEET_MANAGER">FLEET_MANAGER</option>
                      <option value="DRIVER">DRIVER</option>
                      <option value="FINANCIAL_ANALYST">FINANCIAL_ANALYST</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => statusMutation.mutate(user._id)}
                      disabled={statusMutation.isPending}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        user.isActive 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {user.isActive ? <><UserX size={14}/> Deactivate</> : <><UserCheck size={14}/> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && users.length === 0 && (
          <div className="p-8 text-center text-slate-500">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
