/**
 * qa_tests_finance.js - Independent test script for Fuel & Expense Logic
 * Run via: node qa_tests_finance.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const fuelService = require('./services/fuel.service');
const maintenanceService = require('./services/maintenance.service');

dotenv.config({ path: './.env' });

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transitops');
    console.log('✅ Connected to MongoDB');

    // Setup: Get an Admin/Fleet Manager to act as creator
    const creator = await User.findOne({ role: 'FLEET_MANAGER' });
    if (!creator) throw new Error('No Fleet Manager found for test setup');

    // Setup: Get a Vehicle
    const vehicle = await Vehicle.findOne({ isActive: true });
    if (!vehicle) throw new Error('No active vehicle found for test setup');
    const initialOdometer = vehicle.odometer || 0;

    console.log(`\n--- Test 1: Fuel Log Creation & Auto-Expense Spawning ---`);
    const fuelData = {
      vehicleId: vehicle._id,
      driverId: creator._id, // Just using creator for ease
      fuelStation: 'QA Shell Station',
      fuelType: 'DIESEL',
      quantity: 50,
      pricePerUnit: 2.5,
      totalCost: 125,
      odometerReading: initialOdometer + 150,
      paymentMethod: 'Corporate Card',
    };

    const fuelLog = await fuelService.createFuelLog(fuelData, creator._id);
    console.log('✅ Fuel Log created:', fuelLog.fuelLogNumber);

    // Verify Vehicle odometer updated
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    if (updatedVehicle.odometer !== initialOdometer + 150) {
      throw new Error('Vehicle odometer was not updated by Fuel Log');
    }
    console.log('✅ Vehicle odometer successfully updated to', updatedVehicle.odometer);

    // Verify Expense was spawned
    const fuelExpense = await Expense.findOne({ expenseCategory: 'FUEL', amount: 125 }).sort({ createdAt: -1 });
    if (!fuelExpense || fuelExpense.approvalStatus !== 'PENDING') {
      throw new Error('Fuel Expense was not properly auto-spawned');
    }
    console.log('✅ Fuel Expense auto-spawned successfully:', fuelExpense.expenseNumber, 'with status', fuelExpense.approvalStatus);

    console.log(`\n--- Test 2: Maintenance Completion & Auto-Expense Spawning ---`);
    // Create a mock maintenance job
    const mntData = {
      vehicleId: vehicle._id,
      title: 'QA Brake Pad Replacement',
      description: 'Routine test maintenance',
      priority: 'MEDIUM',
      maintenanceType: 'PREVENTIVE',
      assignedTechnician: creator._id, // using creator for ease
    };
    let mnt = await maintenanceService.createMaintenance(mntData, creator._id);
    console.log('✅ Maintenance Job created:', mnt.maintenanceNumber);

    // Transition to IN_PROGRESS
    mnt = await maintenanceService.updateMaintenanceStatus(mnt._id, 'IN_PROGRESS', 'Starting work', creator._id);
    
    // Add cost and COMPLETE
    mnt = await maintenanceService.updateMaintenance(mnt._id, { actualCost: 350 }, creator._id);
    mnt = await maintenanceService.updateMaintenanceStatus(mnt._id, 'COMPLETED', 'Finished work', creator._id);
    console.log('✅ Maintenance Job completed with actual cost 350');

    // Verify Expense was spawned
    const mntExpense = await Expense.findOne({ maintenanceId: mnt._id });
    if (!mntExpense || mntExpense.expenseCategory !== 'MAINTENANCE' || mntExpense.amount !== 350 || mntExpense.approvalStatus !== 'PENDING') {
      throw new Error('Maintenance Expense was not properly auto-spawned');
    }
    console.log('✅ Maintenance Expense auto-spawned successfully:', mntExpense.expenseNumber, 'with status', mntExpense.approvalStatus);

    console.log('\n🎉 All backend finance/fuel logic tests passed!');

  } catch (error) {
    console.error('\n❌ QA Test Failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

runTests();
