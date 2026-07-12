import { z } from 'zod';

export const expenseCategories = [
  'FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'INSURANCE', 
  'TAX', 'DRIVER_ALLOWANCE', 'MISCELLANEOUS'
];

export const approvalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

export const createExpenseSchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  maintenanceId: z.string().optional(),
  expenseCategory: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().optional(),
  expenseDate: z.string().optional(),
  remarks: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const updateApprovalSchema = z.object({
  approvalStatus: z.enum(approvalStatuses),
  remarks: z.string().optional(),
});
