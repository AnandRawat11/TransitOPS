import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Truck, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const statusColors = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800',
  RETIRED: 'bg-slate-100 text-slate-800',
};

const VehicleListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Use debounced search in a real app, but direct for now
  const { data, isLoading } = useVehicles({ page, limit: 10, search });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vehicle Directory</h1>
          <p className="text-slate-500">Manage your entire fleet and view status.</p>
        </div>
        <Button asChild>
          <Link to="/vehicles/new">
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search registration, name, model..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to page 1 on search
                }}
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Vehicle Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Make & Model</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 p-0 border-0">
                    <TableSkeleton rows={5} columns={6} />
                  </TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0 border-0">
                    <EmptyState 
                      icon={Car} 
                      title="No Vehicles Found" 
                      message="You don't have any vehicles matching this criteria."
                      action={<Button asChild><Link to="/app/vehicles/new"><Plus className="w-4 h-4 mr-2"/> Add Vehicle</Link></Button>}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                    <TableCell>{vehicle.vehicleName}</TableCell>
                    <TableCell>{vehicle.vehicleType}</TableCell>
                    <TableCell>{vehicle.manufacturer} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.odometer.toLocaleString()} km</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[vehicle.currentStatus]} border-none hover:bg-opacity-80`}>
                        {vehicle.currentStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-slate-500">
                Showing page {data.pagination.page} of {data.pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleListPage;
