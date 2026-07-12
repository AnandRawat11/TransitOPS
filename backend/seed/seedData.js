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
  {
    name: 'John Doe',
    licenseNumber: 'LIC-1001',
    licenseCategory: 'Class A',
    licenseExpiryDate: new Date('2028-12-31'),
    contactNumber: '+15550101',
    safetyScore: 98,
    status: 'Available', // Note: Driver model not updated in Phase 1
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

    await User.insertMany(hashedUsers);
    console.log(`Successfully seeded ${hashedUsers.length} Users.`);

    await Vehicle.insertMany(vehicles);
    console.log(`Successfully seeded ${vehicles.length} Vehicles.`);

    await Driver.insertMany(drivers);
    console.log(`Successfully seeded ${drivers.length} Drivers.`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
