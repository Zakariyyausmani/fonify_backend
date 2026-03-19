const fs = require('fs');

async function testApi() {
  const baseURL = 'http://localhost:5000/api';

  try {
    console.log('--- Registering a Test User ---');
    const email = `testuser_${Date.now()}@example.com`;
    let res = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Setup User',
        email: email,
        password: 'password123',
        phone: '1234567890'
      })
    });

    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const token = data.token;
    console.log('[OK] Registered, User ID:', data._id);

    // Create Listing
    console.log('\n--- Creating Listing ---');
    res = await fetch(`${baseURL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        brand: 'Apple',
        model: 'iPhone 13',
        condition: 'Used',
        price: 50000,
        description: 'Test description',
        location: 'Test Location',
        imei: "123456789012345",
        specifications: {
          storage: '128GB',
          ram: '4GB',
          battery: '90%'
        }
      })
    });

    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('[OK] Listing Created:', data._id);

    // Test Admin routes (We'd need admin role for full test but we can see what error we get)
    console.log('\n--- Testing Admin Route ---');
    res = await fetch(`${baseURL}/admin/listings/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log('[Admin Response]', res.status, data);

  } catch (error) {
    console.error('[ERROR]', error.message);
  }
}

testApi();
