const checkApi = async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver@transitops.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(loginData.message || 'Login failed');
    }
    
    const token = loginData.data.token;
    const user = loginData.data.user;
    console.log('Logged in user:', user);

    const headers = { 'Authorization': `Bearer ${token}` };

    const driversRes = await fetch('http://localhost:5000/api/v1/drivers', { headers });
    const driversData = await driversRes.json();
    const drivers = driversData.data;
    const profile = drivers.find(d => d.email === user.email);
    console.log('Driver Profile:', profile);

    const tripsRes = await fetch('http://localhost:5000/api/v1/trips', { headers });
    const tripsData = await tripsRes.json();
    const trips = tripsData.data;
    console.log('Trips count:', trips.length);
    if (trips.length > 0) {
      console.log('First Trip driverId:', trips[0].driverId);
      console.log('Comparison test:');
      const profileId = profile?._id || profile?.id;
      console.log('profileId:', profileId);
      const myTrips = trips.filter(t => {
        const dId = t.driverId?._id || t.driverId?.id || t.driverId;
        console.log(`Trip driverId:`, dId, `Matches profileId?`, dId === profileId);
        return dId === profileId;
      });
      console.log('Filtered Trips count:', myTrips.length);
    }
  } catch (error) {
    console.error('API Check Error:', error.message);
  }
};

checkApi();
