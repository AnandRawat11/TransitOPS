import React, { useState } from 'react';
import { useMaintenanceList } from '../hooks/useMaintenance';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'REPORTED': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    case 'SCHEDULED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW': return 'text-slate-400';
    case 'MEDIUM': return 'text-blue-400';
    case 'HIGH': return 'text-amber-400';
    case 'CRITICAL': return 'text-rose-400 font-bold animate-pulse';
    default: return 'text-slate-400';
  }
};

const MaintenanceListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useMaintenanceList({ page, limit: 10, search });

  const jobs = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="p-1 space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Maintenance Directory</h1>
          <p className="text-slate-400 mt-1">Manage active and historical repair logs.</p>
        </div>
        <Link to="/maintenance/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 border-none">
            <Plus className="h-4 w-4 mr-2" />
            Log Maintenance
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search Job ID or Title..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-400">
          Showing {jobs.length} of {pagination.total} records
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/20 rounded-xl border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/60 border-b border-slate-800">
            <TableRow className="border-b border-slate-800 hover:bg-transparent">
              <TableHead>Job ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-b border-slate-800/50">
                  <TableCell colSpan={8} className="h-16 text-center">
                    <div className="animate-pulse bg-slate-800 h-4 w-full rounded"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Wrench className="h-8 w-8 text-slate-600 mb-2" />
                    No maintenance records found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job, i) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors"
                >
                  <TableCell className="font-medium text-white">{job.maintenanceNumber}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{job.title}</TableCell>
                  <TableCell>
                    {job.vehicleId ? (
                      <div className="text-sm">
                        <div className="font-medium text-white">{job.vehicleId.registrationNumber}</div>
                        <div className="text-slate-400 text-xs">{job.vehicleId.vehicleName}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">{job.maintenanceType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {job.assignedTechnician ? (
                      <div className="text-sm font-medium text-white">{job.assignedTechnician.name}</div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-8 border-slate-700 hover:bg-slate-800 text-slate-200">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/20">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === pagination.pages || pagination.pages === 0}
            onClick={() => setPage(p => p + 1)}
            className="border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceListPage;
