const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { ROLES, VEHICLE_STATUS, VEHICLE_TYPES, FUEL_TYPES } = require('../utils/constants');

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const users = [
  {
    name: 'System Admin',
    email: 'admin@transitops.com',
    password: 'password123',
    role: ROLES.ADMIN,
  },
  {
    name: 'Fleet Manager',
    email: 'manager@transitops.com',
    password: 'password123',
    role: ROLES.FLEET_MANAGER,
  },
  {
    name: 'Driver User',
    email: 'driver@transitops.com',
    password: 'password123',
    role: ROLES.DRIVER,
  },
  {
    name: 'Safety Officer',
    email: 'safety@transitops.com',
    password: 'password123',
    role: ROLES.SAFETY_OFFICER,
  },
  {
    name: 'Financial Analyst',
    email: 'finance@transitops.com',
    password: 'password123',
    role: ROLES.FINANCIAL_ANALYST,
  },
];

const vehicles = [
  {
    registrationNumber: 'REG-001',
    vehicleName: 'Volvo FH16',
    vehicleType: VEHICLE_TYPES.TRUCK,
    manufacturer: 'Volvo',
    model: 'FH16',
    year: 2023,
    fuelType: FUEL_TYPES.DIESEL,
    maxLoad: 25000,
    odometer: 15000,
    acquisitionCost: 120000,
    currentStatus: VEHICLE_STATUS.AVAILABLE,
    region: 'North',
    chassisNumber: 'CH-VOLVO-001',
    insuranceExpiry: new Date('2025-12-31'),
  },
  {
    registrationNumber: 'REG-002',
    vehicleName: 'Scania R500',
    vehicleType: VEHICLE_TYPES.TRUCK,
    manufacturer: 'Scania',
    model: 'R500',
    year: 2022,
    fuelType: FUEL_TYPES.DIESEL,
    maxLoad: 24000,
    odometer: 45000,
    acquisitionCost: 115000,
    currentStatus: VEHICLE_STATUS.ON_TRIP,
    region: 'East',
    chassisNumber: 'CH-SCAN-002',
    insuranceExpiry: new Date('2025-10-15'),
  },
  {
    registrationNumber: 'REG-003',
    vehicleName: 'Ford Transit',
    vehicleType: VEHICLE_TYPES.VAN,
    manufacturer: 'Ford',
    model: 'Transit 350',
    year: 2024,
    fuelType: FUEL_TYPES.HYBRID,
    maxLoad: 3500,
    odometer: 8000,
    acquisitionCost: 45000,
    currentStatus: VEHICLE_STATUS.MAINTENANCE,
    region: 'West',
    chassisNumber: 'CH-FORD-003',
    insuranceExpiry: new Date('2026-01-20'),
  },
];

const drivers = [
  // 3 valid available drivers
  {
    name: 'Alice Driver', employeeId: 'EMP-001', phone: '555-0101', licenseNumber: 'LIC-001',
    licenseCategory: 'Heavy', licenseExpiryDate: new Date('2028-12-31'), safetyScore: 100, status: 'Available'
    name: 'John Doe',
    licenseNumber: 'LIC-1001',
    licenseCategory: 'Class A',
    licenseExpiryDate: new Date('2028-12-31'),
    contactNumber: '+15550101',
    safetyScore: 98,
    status: 'Available', // Note: Driver model not updated in Phase 1
  },
  {
    name: 'Bob Driver', employeeId: 'EMP-002', phone: '555-0102', licenseNumber: 'LIC-002',
    licenseCategory: 'Medium', licenseExpiryDate: new Date('2029-05-15'), safetyScore: 95, status: 'Available'
  },
  {
    name: 'Charlie Driver', employeeId: 'EMP-003', phone: '555-0103', licenseNumber: 'LIC-003',
    licenseCategory: 'Commercial', licenseExpiryDate: new Date('2027-11-20'), safetyScore: 98, status: 'Available'
  },
  // 2 expiring drivers (within 30 days) - Setting to 15 days from now
  {
    name: 'Dave Expiring', employeeId: 'EMP-004', phone: '555-0104', licenseNumber: 'LIC-004',
    licenseCategory: 'Light', licenseExpiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), safetyScore: 90, status: 'Available'
  },
  {
    name: 'Eve Expiring', employeeId: 'EMP-005', phone: '555-0105', licenseNumber: 'LIC-005',
    licenseCategory: 'Medium', licenseExpiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), safetyScore: 92, status: 'Off Duty'
  },
  // 2 expired drivers
  {
    name: 'Frank Expired', employeeId: 'EMP-006', phone: '555-0106', licenseNumber: 'LIC-006',
    licenseCategory: 'Heavy', licenseExpiryDate: new Date('2023-01-01'), safetyScore: 85, status: 'Available'
  },
  {
    name: 'Grace Expired', employeeId: 'EMP-007', phone: '555-0107', licenseNumber: 'LIC-007',
    licenseCategory: 'Commercial', licenseExpiryDate: new Date('2024-05-15'), safetyScore: 88, status: 'Off Duty'
  },
  // 2 on trip drivers
  {
    name: 'Hank OnTrip', employeeId: 'EMP-008', phone: '555-0108', licenseNumber: 'LIC-008',
    licenseCategory: 'Heavy', licenseExpiryDate: new Date('2030-01-01'), safetyScore: 100, status: 'On Trip'
  },
  {
    name: 'Ivy OnTrip', employeeId: 'EMP-009', phone: '555-0109', licenseNumber: 'LIC-009',
    licenseCategory: 'Commercial', licenseExpiryDate: new Date('2029-01-01'), safetyScore: 99, status: 'On Trip'
  },
  // 1 suspended driver
  {
    name: 'Jack Suspended', employeeId: 'EMP-010', phone: '555-0110', licenseNumber: 'LIC-010',
    licenseCategory: 'Medium', licenseExpiryDate: new Date('2028-01-01'), safetyScore: 40, status: 'Suspended'
  }
];

const seedDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/transitops';
      
    console.log(`Connecting to database for seeding at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to database.');

    // Clear existing data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await FuelLog.deleteMany();
    await MaintenanceLog.deleteMany();
    await Expense.deleteMany();
    console.log('Cleared existing database entries.');

    // Hash user passwords and insert
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(12); // Match model 12 rounds
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const insertedUsers = await User.insertMany(hashedUsers);
    console.log(`Successfully seeded ${insertedUsers.length} Users.`);

    const insertedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Successfully seeded ${insertedVehicles.length} Vehicles.`);

    const insertedDrivers = await Driver.insertMany(drivers);
    console.log(`Successfully seeded ${insertedDrivers.length} Drivers.`);

    // Seed Trips
    const trips = [
      {
        source: 'Chicago',
        destination: 'Detroit',
        vehicle: insertedVehicles[0]._id,
        driver: insertedDrivers[0]._id,
        cargoWeight: 18000,
        plannedDistance: 280,
        actualDistance: 285,
        fuelConsumed: 95,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-01T08:00:00Z'),
        completedAt: new Date('2026-07-01T14:30:00Z'),
        revenue: 1200,
      },
      {
        source: 'New York',
        destination: 'Boston',
        vehicle: insertedVehicles[0]._id,
        driver: insertedDrivers[0]._id,
        cargoWeight: 12000,
        plannedDistance: 215,
        actualDistance: 220,
        fuelConsumed: 70,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-03T07:00:00Z'),
        completedAt: new Date('2026-07-03T12:00:00Z'),
        revenue: 950,
      },
      {
        source: 'Dallas',
        destination: 'Houston',
        vehicle: insertedVehicles[1]._id,
        driver: insertedDrivers[1]._id,
        cargoWeight: 22000,
        plannedDistance: 240,
        actualDistance: 245,
        fuelConsumed: 80,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-05T09:00:00Z'),
        completedAt: new Date('2026-07-05T14:00:00Z'),
        revenue: 1100,
      },
      {
        source: 'Los Angeles',
        destination: 'San Francisco',
        vehicle: insertedVehicles[1]._id,
        driver: insertedDrivers[1]._id,
        cargoWeight: 20000,
        plannedDistance: 380,
        actualDistance: 0,
        status: 'Dispatched',
        dispatchedAt: new Date('2026-07-10T06:00:00Z'),
        revenue: 1600,
      },
    ];

    const insertedTrips = await Trip.insertMany(trips);
    console.log(`Successfully seeded ${insertedTrips.length} Trips.`);

    // Seed Fuel Logs
    const fuelLogs = [
      {
        vehicle: insertedVehicles[0]._id,
        trip: insertedTrips[0]._id,
        liters: 95,
        cost: 142.5,
        date: new Date('2026-07-01T15:00:00Z'),
      },
      {
        vehicle: insertedVehicles[0]._id,
        trip: insertedTrips[1]._id,
        liters: 70,
        cost: 105.0,
        date: new Date('2026-07-03T13:00:00Z'),
      },
      {
        vehicle: insertedVehicles[1]._id,
        trip: insertedTrips[2]._id,
        liters: 80,
        cost: 120.0,
        date: new Date('2026-07-05T15:00:00Z'),
      },
      {
        vehicle: insertedVehicles[2]._id,
        liters: 45,
        cost: 67.5,
        date: new Date('2026-07-08T10:00:00Z'),
      },
    ];

    await FuelLog.insertMany(fuelLogs);
    console.log(`Successfully seeded ${fuelLogs.length} Fuel Logs.`);

    // Seed Maintenance Logs
    const maintenanceLogs = [
      {
        vehicle: insertedVehicles[0]._id,
        type: 'Oil Change',
        status: 'Closed',
        priority: 'Medium',
        cost: 150,
        date: new Date('2026-06-15T08:00:00Z'),
      },
      {
        vehicle: insertedVehicles[0]._id,
        type: 'Brake Replacement',
        status: 'Closed',
        priority: 'High',
        cost: 650,
        date: new Date('2026-06-28T09:00:00Z'),
      },
      {
        vehicle: insertedVehicles[1]._id,
        type: 'Tire Rotation',
        status: 'Closed',
        priority: 'Low',
        cost: 200,
        date: new Date('2026-07-02T10:00:00Z'),
      },
      {
        vehicle: insertedVehicles[2]._id,
        type: 'Engine Diagnostics',
        status: 'Active',
        priority: 'High',
        cost: 300,
        date: new Date('2026-07-11T11:00:00Z'),
      },
    ];

    await MaintenanceLog.insertMany(maintenanceLogs);
    console.log(`Successfully seeded ${maintenanceLogs.length} Maintenance Logs.`);

    // Seed Expenses
    const expenses = [
      {
        vehicle: insertedVehicles[0]._id,
        type: 'Toll',
        amount: 45.0,
        date: new Date('2026-07-01T10:00:00Z'),
        notes: 'I-94 Interstate Toll',
      },
      {
        vehicle: insertedVehicles[1]._id,
        type: 'Toll',
        amount: 35.0,
        date: new Date('2026-07-05T11:00:00Z'),
        notes: 'Texas State Highway Toll',
      },
      {
        vehicle: insertedVehicles[2]._id,
        type: 'Permit',
        amount: 150.0,
        date: new Date('2026-07-09T09:00:00Z'),
        notes: 'Annual City Permit fee',
      },
      {
        vehicle: insertedVehicles[0]._id,
        type: 'Misc',
        amount: 85.0,
        date: new Date('2026-07-02T16:00:00Z'),
        notes: 'Truck wash and cleaning supplies',
      },
    ];

    await Expense.insertMany(expenses);
    console.log(`Successfully seeded ${expenses.length} Expenses.`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
