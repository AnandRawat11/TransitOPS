const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const check = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/transitops';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  const users = await User.find();
  console.log('--- USERS ---');
  users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`));

  const drivers = await Driver.find().populate('assignedVehicle');
  console.log('--- DRIVERS ---');
  drivers.forEach(d => console.log(`Name: ${d.name}, Email: ${d.email}, Status: ${d.status}, Assigned Vehicle: ${d.assignedVehicle?.registrationNumber || 'None'}, ID: ${d._id}`));

  const trips = await Trip.find().populate('driverId');
  console.log('--- TRIPS ---');
  trips.forEach(t => console.log(`Trip#: ${t.tripNumber}, Driver: ${t.driverId?.name || t.driverId}, Status: ${t.tripStatus}, ID: ${t._id}`));

  await mongoose.disconnect();
};

check().catch(console.error);
