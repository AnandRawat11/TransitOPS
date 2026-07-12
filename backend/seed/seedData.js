const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

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
  // 3 valid available drivers
  {
    name: 'Alice Driver', employeeId: 'EMP-001', phone: '555-0101', licenseNumber: 'LIC-001',
    licenseCategory: 'Heavy', licenseExpiryDate: new Date('2028-12-31'), safetyScore: 100, status: 'Available'
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
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/transitops';
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
        const salt = await bcrypt.genSalt(10);
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
