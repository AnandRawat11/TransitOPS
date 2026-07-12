const mongoose = require('mongoose');
const Driver = require('./models/Driver');

console.log('--- Testing Driver Model Validations ---\n');

// 1. Test missing required fields
const emptyDriver = new Driver({});
const error = emptyDriver.validateSync();
console.log('1. Testing empty driver (should fail required validations):');
if (error) {
  console.log('Validation Errors:');
  Object.keys(error.errors).forEach((key) => {
    console.log(`- ${key}: ${error.errors[key].message}`);
  });
} else {
  console.log('Passed!\n');
}
console.log('\n----------------------------------------\n');

// 2. Test valid driver
const validDriver = new Driver({
  name: 'John Doe',
  employeeId: 'EMP12345',
  phone: '555-0100',
  licenseNumber: 'DL987654321',
  licenseCategory: 'Heavy',
  licenseExpiryDate: new Date('2030-12-31'),
});
const validError = validDriver.validateSync();
console.log('2. Testing valid driver with all required fields:');
if (validError) {
  console.log('Errors:', validError);
} else {
  console.log('Passed! No validation errors.');
  console.log('Driver Object created:', validDriver.toObject());
}
console.log('\n----------------------------------------\n');

// 3. Test invalid enums
const invalidEnumDriver = new Driver({
  name: 'Jane Smith',
  employeeId: 'EMP12346',
  phone: '555-0101',
  licenseNumber: 'DL987654322',
  licenseCategory: 'Spaceship', // Invalid enum
  licenseExpiryDate: new Date('2030-12-31'),
  safetyScore: 150, // Exceeds max 100
  status: 'Flying', // Invalid enum
});
const invalidEnumError = invalidEnumDriver.validateSync();
console.log('3. Testing invalid enums and limits (licenseCategory, safetyScore, status):');
if (invalidEnumError) {
  console.log('Validation Errors:');
  Object.keys(invalidEnumError.errors).forEach((key) => {
    console.log(`- ${key}: ${invalidEnumError.errors[key].message}`);
  });
}
console.log('\nDone testing!');
