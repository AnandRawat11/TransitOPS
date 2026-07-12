import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMaintenance } from '../hooks/useMaintenance';
import { maintenanceSchema } from '../schemas/maintenance.schema';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Wrench, Loader2 } from 'lucide-react';
import api from '@/api/axios';

const CreateMaintenancePage = () => {
  const navigate = useNavigate();
  const createMaintenance = useCreateMaintenance();
  
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      priority: 'MEDIUM',
      maintenanceType: 'PREVENTIVE',
    }
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [vehRes, techRes] = await Promise.all([
          api.get('/vehicles?limit=100&status=AVAILABLE'),
          // Fetch users who are TECHNICIAN or FLEET_MANAGER
          api.get('/drivers') // Repurposing temporarily or if there's a user endpoint. Assuming backend allows fetching users. We'll use dummy logic or fetch active users. 
          // Ideally we'd have a /users endpoint. Let's fetch vehicles first.
        ]);
        setVehicles(vehRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const onSubmit = (data) => {
    // Clean up empty strings to undefined to satisfy backend
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v])
    );

    createMaintenance.mutate(cleanData, {
      onSuccess: () => {
        navigate('/maintenance/list');
      },
      onError: (err) => {
        console.error('Failed to create maintenance:', err);
      }
    });
  };

  return (
    <div className="p-1 max-w-4xl mx-auto space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Log Maintenance</h1>
        <p className="text-slate-400 mt-1">Schedule or report a new vehicle repair job.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-blue-400" />
            Maintenance Details
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            
            {createMaintenance.isError && (
              <div className="bg-rose-950/20 border border-rose-900/50 text-rose-400 p-4 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{createMaintenance.error?.response?.data?.message || 'Failed to log maintenance.'}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle *</Label>
                <Select onValueChange={(val) => setValue('vehicleId', val)}>
                  <SelectTrigger className={errors.vehicleId ? 'border-rose-500 bg-slate-900' : 'bg-slate-900 border-slate-700'}>
                    <SelectValue placeholder={isLoadingMetadata ? "Loading..." : "Select a vehicle"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id} className="hover:bg-slate-800 focus:bg-slate-800">{v.registrationNumber} - {v.vehicleName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && <p className="text-sm text-rose-500">{errors.vehicleId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                <Select defaultValue="PREVENTIVE" onValueChange={(val) => setValue('maintenanceType', val)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="PREVENTIVE" className="hover:bg-slate-800 focus:bg-slate-800">Preventive (Routine)</SelectItem>
                    <SelectItem value="CORRECTIVE" className="hover:bg-slate-800 focus:bg-slate-800">Corrective (Repair)</SelectItem>
                    <SelectItem value="EMERGENCY" className="hover:bg-slate-800 focus:bg-slate-800">Emergency (Breakdown)</SelectItem>
                    <SelectItem value="INSPECTION" className="hover:bg-slate-800 focus:bg-slate-800">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Engine Oil Change & Filter Replacement" 
                  {...register('title')} 
                  className={errors.title ? 'border-rose-500 bg-slate-900' : 'bg-slate-900 border-slate-700'}
                />
                {errors.title && <p className="text-sm text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea 
                  id="description" 
                  rows={4}
                  placeholder="Describe the issue or required service..." 
                  {...register('description')} 
                  className={errors.description ? 'border-rose-500 bg-slate-900' : 'bg-slate-900 border-slate-700'}
                />
                {errors.description && <p className="text-sm text-rose-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="MEDIUM" onValueChange={(val) => setValue('priority', val)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="LOW" className="hover:bg-slate-800 focus:bg-slate-800">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="hover:bg-slate-800 focus:bg-slate-800">Medium</SelectItem>
                    <SelectItem value="HIGH" className="hover:bg-slate-800 focus:bg-slate-800">High</SelectItem>
                    <SelectItem value="CRITICAL" className="hover:bg-slate-800 focus:bg-slate-800">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
                <Input 
                  id="scheduledDate" 
                  type="date"
                  {...register('scheduledDate')} 
                  className="bg-slate-900 border-slate-700"
                />
                <p className="text-xs text-slate-400">Leaving this blank creates a 'REPORTED' job instead of 'SCHEDULED'.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                <Input 
                  id="estimatedCost" 
                  type="number"
                  placeholder="0.00"
                  {...register('estimatedCost')} 
                  className={errors.estimatedCost ? 'border-rose-500 bg-slate-900' : 'bg-slate-900 border-slate-700'}
                />
                {errors.estimatedCost && <p className="text-sm text-rose-500">{errors.estimatedCost.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCenter">Service Center / Workshop</Label>
                <Input 
                  id="serviceCenter" 
                  placeholder="e.g. Main Depot Garage"
                  {...register('serviceCenter')} 
                  className="bg-slate-900 border-slate-700"
                />
              </div>

            </div>
          </CardContent>
          <CardFooter className="bg-slate-950/20 flex justify-end space-x-4 border-t border-slate-800 py-4">
            <Button type="button" variant="outline" onClick={() => navigate('/maintenance/list')} className="border-slate-700 hover:bg-slate-800 text-slate-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white border-none" disabled={createMaintenance.isPending}>
              {createMaintenance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createMaintenance.isPending ? 'Logging Job...' : 'Log Maintenance'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateMaintenancePage;
