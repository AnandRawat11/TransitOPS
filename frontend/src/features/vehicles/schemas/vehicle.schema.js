import { z } from 'zod';

const VEHICLE_STATUS = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'RETIRED'];
const VEHICLE_TYPES = ['TRUCK', 'VAN', 'BUS', 'CAR', 'MOTORCYCLE', 'TRAILER'];
const FUEL_TYPES = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID'];

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, 'Registration number must be at least 3 characters')
    .max(20, 'Registration number must not exceed 20 characters')
    .toUpperCase(),
  vehicleName: z.string().min(2, 'Name must be at least 2 characters'),
  vehicleType: z.enum(VEHICLE_TYPES, {
    errorMap: () => ({ message: 'Please select a valid vehicle type' }),
  }),
  manufacturer: z.string().min(2, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Invalid future year'),
  maxLoad: z.number().positive('Max load must be positive').optional().or(z.literal('')),
  fuelType: z.enum(FUEL_TYPES, {
    errorMap: () => ({ message: 'Please select a valid fuel type' }),
  }),
  odometer: z.number().min(0, 'Odometer cannot be negative').default(0),
  acquisitionCost: z.number().min(0).optional().or(z.literal('')),
  currentStatus: z.enum(VEHICLE_STATUS).default('AVAILABLE'),
  region: z.string().max(100).optional().or(z.literal('')),
  chassisNumber: z.string().max(50).optional().or(z.literal('')),
  insuranceExpiry: z.string().optional().or(z.literal('')),
  fitnessExpiry: z.string().optional().or(z.literal('')),
  pollutionExpiry: z.string().optional().or(z.literal('')),
});

export const updateVehicleStatusSchema = z.object({
  status: z.enum(VEHICLE_STATUS),
});
