import { z } from 'zod';

export const fuelTypes = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID'];

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  tripId: z.string().optional(),
  fuelStation: z.string().min(2, 'Fuel station name is required'),
  fuelType: z.enum(fuelTypes, {
    errorMap: () => ({ message: 'Please select a valid fuel type' })
  }),
  quantity: z.number().positive('Quantity must be greater than zero'),
  pricePerUnit: z.number().min(0, 'Price cannot be negative'),
  totalCost: z.number().min(0, 'Total cost cannot be negative'),
  odometerReading: z.number().min(0, 'Odometer cannot be negative'),
  paymentMethod: z.string().optional(),
  invoiceNumber: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  filledAt: z.string().optional(), // date-time string
});

export const updateFuelLogSchema = createFuelLogSchema.partial();
