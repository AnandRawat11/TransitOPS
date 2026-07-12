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
    case 'REPORTED': return 'bg-gray-100 text-gray-800';
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
    case 'CANCELLED': return 'bg-rose-100 text-rose-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW': return 'text-gray-500';
    case 'MEDIUM': return 'text-blue-500';
    case 'HIGH': return 'text-amber-500';
    case 'CRITICAL': return 'text-rose-600 font-bold animate-pulse';
    default: return 'text-gray-500';
  }
};

const MaintenanceListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useMaintenanceList({ page, limit: 10, search });

  const jobs = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Maintenance Directory</h1>
          <p className="text-gray-500 mt-1">Manage active and historical repair logs.</p>
        </div>
        <Link to="/maintenance/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Log Maintenance
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search Job ID or Title..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {jobs.length} of {pagination.total} records
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
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
                <TableRow key={i}>
                  <TableCell colSpan={8} className="h-16 text-center">
                    <div className="animate-pulse bg-gray-100 h-4 w-full rounded"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Wrench className="h-8 w-8 text-gray-300 mb-2" />
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
                  className="group hover:bg-gray-50/50"
                >
                  <TableCell className="font-medium text-gray-900">{job.maintenanceNumber}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{job.title}</TableCell>
                  <TableCell>
                    {job.vehicleId ? (
                      <div className="text-sm">
                        <div className="font-medium">{job.vehicleId.registrationNumber}</div>
                        <div className="text-gray-500 text-xs">{job.vehicleId.vehicleName}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{job.maintenanceType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {job.assignedTechnician ? (
                      <div className="text-sm font-medium">{job.assignedTechnician.name}</div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-8">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === pagination.pages || pagination.pages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceListPage;
