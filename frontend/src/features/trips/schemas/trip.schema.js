import { z } from 'zod';

const TRIP_STATUS = ['PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TRIP_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const tripSchema = z.object({
  vehicleId: z.string().optional().or(z.literal('')),
  driverId: z.string().optional().or(z.literal('')),
  startLocation: z.string().min(2, 'Start location is required').max(200),
  destination: z.string().min(2, 'Destination is required').max(200),
  route: z.string().optional().or(z.literal('')),
  plannedDistance: z.coerce.number().positive('Distance must be positive'),
  plannedStartTime: z.string().min(1, 'Planned start time is required'),
  plannedEndTime: z.string().min(1, 'Planned end time is required'),
  cargoType: z.string().min(2, 'Cargo type is required').max(100),
  cargoWeight: z.coerce.number().positive('Cargo weight must be positive'),
  priority: z.enum(TRIP_PRIORITY).default('MEDIUM'),
  estimatedFuel: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
}).refine((data) => {
  const start = new Date(data.plannedStartTime);
  const end = new Date(data.plannedEndTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["plannedEndTime"],
});

export const updateTripStatusSchema = z.object({
  status: z.enum(TRIP_STATUS),
  notes: z.string().optional().or(z.literal('')),
});
