import { z } from 'zod';

const MAINTENANCE_STATUS = ['REPORTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const MAINTENANCE_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const MAINTENANCE_TYPE = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION'];

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  assignedTechnician: z.string().optional().or(z.literal('')),
  maintenanceType: z.enum(MAINTENANCE_TYPE, { required_error: 'Type is required' }),
  priority: z.enum(MAINTENANCE_PRIORITY).default('MEDIUM'),
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(5, 'Description is required'),
  issueCategory: z.string().optional().or(z.literal('')),
  scheduledDate: z.string().optional().or(z.literal('')),
  estimatedCost: z.coerce.number().min(0, 'Cost cannot be negative').optional().or(z.literal('')),
  estimatedDuration: z.coerce.number().min(0, 'Duration cannot be negative').optional().or(z.literal('')),
  odometerReading: z.coerce.number().min(0).optional().or(z.literal('')),
  workshopName: z.string().optional().or(z.literal('')),
  serviceCenter: z.string().optional().or(z.literal('')),
});

export const updateMaintenanceStatusSchema = z.object({
  status: z.enum(MAINTENANCE_STATUS),
  notes: z.string().optional().or(z.literal('')),
});
