const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

dotenv.config();

const users = [
  {
    name: 'Fleet Manager',
    email: 'manager@transitops.com',
    password: 'password123',
    role: 'FleetManager',
  },
  {
    name: 'Driver User',
    email: 'driver@transitops.com',
    password: 'password123',
    role: 'Driver',
  },
  {
    name: 'Safety Officer',
    email: 'safety@transitops.com',
    password: 'password123',
    role: 'SafetyOfficer',
  },
  {
    name: 'Financial Analyst',
    email: 'finance@transitops.com',
    password: 'password123',
    role: 'FinancialAnalyst',
  },
];

const vehicles = [
  {
    registrationNumber: 'REG-001',
    name: 'Volvo FH16',
    type: 'Heavy Duty Truck',
    maxLoadCapacity: 25000,
    odometer: 15000,
    acquisitionCost: 120000,
    status: 'Available',
    region: 'North',
  },
  {
    registrationNumber: 'REG-002',
    name: 'Scania R500',
    type: 'Heavy Duty Truck',
    maxLoadCapacity: 24000,
    odometer: 45000,
    acquisitionCost: 115000,
    status: 'On Trip',
    region: 'East',
  },
  {
    registrationNumber: 'REG-003',
    name: 'Ford Transit',
    type: 'Cargo Van',
    maxLoadCapacity: 3500,
    odometer: 8000,
    acquisitionCost: 45000,
    status: 'In Shop',
    region: 'West',
  },
];

const drivers = [
  {
    name: 'John Doe',
    licenseNumber: 'LIC-1001',
    licenseCategory: 'Class A',
    licenseExpiryDate: new Date('2028-12-31'),
    contactNumber: '+15550101',
    safetyScore: 98,
    status: 'Available',
  },
  {
    name: 'Jane Smith',
    licenseNumber: 'LIC-1002',
    licenseCategory: 'Class A',
    licenseExpiryDate: new Date('2027-06-30'),
    contactNumber: '+15550102',
    safetyScore: 95,
    status: 'On Trip',
  },
  {
    name: 'Bob Johnson',
    licenseNumber: 'LIC-1003',
    licenseCategory: 'Class B',
    licenseExpiryDate: new Date('2026-05-15'),
    contactNumber: '+15550103',
    safetyScore: 88,
    status: 'Off Duty',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/transitops';
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
        const salt = await bcrypt.genSalt(10);
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
