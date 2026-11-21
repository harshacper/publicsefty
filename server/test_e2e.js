import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E SYSTEM TESTS');
  console.log('========================================================\n');

  console.log('Waiting for backend server to become ready on http://localhost:5000...');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const h = await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
      if (h.data.status === 'ONLINE') {
        ready = true;
        console.log(`Backend server ready! Mode: ${h.data.database}\n`);
        break;
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!ready) {
    console.error('❌ Server failed to respond to health check within 20 seconds.');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  };

  let citizenToken = '';
  let adminToken = '';
  let testTrackingId = '';
  let testComplaintId = '';
  let selectedStationId = '';

  // 1. Health check
  await test('Server Health Check', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'ONLINE') throw new Error('Health check failed');
  });

  // 2. Citizen Registration
  const testEmail = `citizen_test_${Date.now()}@example.com`;
  await test('Citizen Registration API', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Vikramaditya Rao',
      email: testEmail,
      phone: '9876543210',
      password: 'password123',
      confirmPassword: 'password123',
      address: '7th Main Road, Malleshwaram',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560003',
    });
    if (!res.data.token || !res.data.user) throw new Error('Token or user missing');
    citizenToken = res.data.token;
  });

  // 3. Citizen Login
  await test('Citizen Login API', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'password123',
    });
    if (!res.data.token) throw new Error('Citizen login token missing');
    citizenToken = res.data.token;
  });

  // 4. Admin Login with harsha / harsha@123
  await test('Admin Authentication API (harsha / harsha@123)', async () => {
    const res = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'harsha',
      password: 'harsha@123',
    });
    if (!res.data.token || res.data.admin?.role !== 'admin') {
      throw new Error('Admin login failed or role mismatch');
    }
    adminToken = res.data.token;
  });

  // 5. Nearest Police Stations Calculation
  await test('Nearest Police Station Discovery & Distance Calculation', async () => {
    const res = await axios.post(`${BASE_URL}/locations/nearest-stations`, {
      latitude: 12.9772,
      longitude: 77.5936,
      includeOsm: false,
    });
    if (!res.data.stations || res.data.stations.length === 0) {
      throw new Error('No nearby stations calculated');
    }
    if (res.data.stations[0].distance === undefined) {
      throw new Error('Distance in kilometers missing');
    }
    selectedStationId = res.data.stations[0]._id;
  });

  // 6. Register New Complaint
  await test('Citizen Complaint Registration (Section A-F)', async () => {
    const res = await axios.post(
      `${BASE_URL}/complaints`,
      {
        fullName: 'Vikramaditya Rao',
        age: 32,
        gender: 'Male',
        phone: '9876543210',
        email: testEmail,
        address: '7th Main Road, Malleshwaram',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560003',
        complaintTitle: 'Laptop theft from parked car outside coffee shop',
        category: 'Theft',
        description: 'Car window was smashed and a grey Dell XPS 15 laptop bag was taken from the back seat between 4:00 PM and 4:30 PM.',
        incidentDate: '2026-11-18',
        incidentTime: '16:15',
        incidentLocation: '8th Cross, Sampige Road, Malleshwaram, Bengaluru',
        incidentLatitude: 12.9982,
        incidentLongitude: 77.5707,
        selectedPoliceStationId: selectedStationId,
        suspectInfo: 'Motorcyclist in red helmet seen speeding away',
        witnessInfo: 'Cafe Barista: Mr. Anand',
      },
      {
        headers: { Authorization: `Bearer ${citizenToken}` },
      }
    );

    if (!res.data.trackingId || !res.data.complaint) {
      throw new Error('Tracking ID not returned');
    }
    testTrackingId = res.data.trackingId;
    testComplaintId = res.data.complaint._id;
  });

  // 7. Track Complaint
  await test(`Track Complaint by Unique ID (${testTrackingId})`, async () => {
    const res = await axios.get(`${BASE_URL}/complaints/${testTrackingId}`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (res.data.complaint.trackingId !== testTrackingId) {
      throw new Error('Returned complaint does not match tracking ID');
    }
    if (res.data.complaint.currentStatus !== 'Submitted') {
      throw new Error('Initial status is not Submitted');
    }
    if (!res.data.trackingHistory || res.data.trackingHistory.length === 0) {
      throw new Error('Tracking history missing');
    }
  });

  // 8. Admin Dashboard Data
  await test('Admin Dashboard Metrics & Statistics', async () => {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.data.metrics.totalComplaints < 1) {
      throw new Error('Dashboard total complaints is zero');
    }
    if (!res.data.charts?.categoryCounts) {
      throw new Error('Dashboard category counts missing');
    }
  });

  // 9. Admin Update Complaint Status
  await test('Admin Status Update to "Under Verification" & Audit Log', async () => {
    const res = await axios.patch(
      `${BASE_URL}/admin/complaints/${testComplaintId}/status`,
      {
        newStatus: 'Under Verification',
        remarks: 'Preliminary review initiated by Station Officer. Verifying CCTV feeds.',
        isInternal: false,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    if (res.data.complaint.currentStatus !== 'Under Verification') {
      throw new Error('Status was not updated');
    }
  });

  // 10. Citizen Notification Verification
  await test('Citizen Real-Time Status Notification Generation', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (!res.data.notifications || res.data.notifications.length === 0) {
      throw new Error('Citizen notification was not generated upon status update');
    }
  });

  // 11. Security Check: Unauthorized Citizen access to Admin routes
  await test('Security: Citizen blocked from Administrative Routes (403)', async () => {
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      throw new Error('Citizen was incorrectly allowed access to admin route');
    } catch (err) {
      if (err.response?.status !== 403) {
        throw new Error(`Expected status 403 Forbidden, got: ${err.response?.status}`);
      }
    }
  });

  // 12. Admin CSV Export
  await test('Admin Complaint Report CSV Export', async () => {
    const res = await axios.get(`${BASE_URL}/admin/reports/export-csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data.includes('Complaint ID') || !res.data.includes(testTrackingId)) {
      throw new Error('CSV content did not contain headers or tracking ID');
    }
  });

  console.log('\n========================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
