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
