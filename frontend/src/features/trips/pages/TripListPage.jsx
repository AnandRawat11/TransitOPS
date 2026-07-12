import React, { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin, Navigation, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'PLANNED': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    case 'ASSIGNED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
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
    case 'URGENT': return 'text-rose-400 font-bold';
    default: return 'text-slate-400';
  }
};

const TripListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  // Basic debouncing would be added here in production
  const { data, isLoading } = useTrips({ page, limit: 10, search });

  const trips = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="p-1 space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Trip Directory</h1>
          <p className="text-slate-400 mt-1">Manage, monitor, and assign trips.</p>
        </div>
        <Link to="/trips/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 border-none">
            <Plus className="h-4 w-4 mr-2" />
            Create Trip
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search trip number..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-400">
          Showing {trips.length} of {pagination.total} trips
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/20 rounded-xl border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/60 border-b border-slate-800">
            <TableRow className="border-b border-slate-800 hover:bg-transparent">
              <TableHead>Trip Number</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Planned Start</TableHead>
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
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  No trips found. Create a new trip to get started.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip, i) => (
                <motion.tr
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors"
                >
                  <TableCell className="font-medium text-white">{trip.tripNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center text-slate-400 gap-1"><MapPin className="h-3 w-3"/> {trip.startLocation}</div>
                      <div className="flex items-center text-slate-200 gap-1 mt-1"><Navigation className="h-3 w-3"/> {trip.destination}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(trip.tripStatus)}>
                      {trip.tripStatus.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${getPriorityColor(trip.priority)}`}>
                      {trip.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {trip.vehicleId ? (
                      <div className="text-sm">
                        <div className="font-medium text-white">{trip.vehicleId.registrationNumber}</div>
                        <div className="text-slate-400 text-xs">{trip.vehicleId.vehicleName}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {trip.driverId ? (
                      <div className="text-sm font-medium text-white">{trip.driverId.name}</div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {new Date(trip.plannedStartTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-8 border-slate-700 hover:bg-slate-800 text-slate-200">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
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

export default TripListPage;
