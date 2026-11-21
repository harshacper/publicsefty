import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { CitizenRegister } from './pages/CitizenRegister';
import { CitizenLogin } from './pages/CitizenLogin';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RegisterComplaint } from './pages/RegisterComplaint';
import { NearestStationFinder } from './pages/NearestStationFinder';
import { TrackComplaint } from './pages/TrackComplaint';
import { MyComplaints } from './pages/MyComplaints';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { UserProfile } from './pages/UserProfile';
import { ContactHelp } from './pages/ContactHelp';
import { EmergencyInfo } from './pages/EmergencyInfo';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintManagement } from './pages/AdminComplaintManagement';
import { AdminPoliceStationManagement } from './pages/AdminPoliceStationManagement';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminReportsAnalytics } from './pages/AdminReportsAnalytics';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <EmergencyBanner />
          <Navbar />

          <div className="flex-1">
            <Routes>
              {/* Public Portal Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/register" element={<CitizenRegister />} />
              <Route path="/login" element={<CitizenLogin />} />
              <Route path="/stations" element={<NearestStationFinder />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/track/:trackingId" element={<TrackComplaint />} />
              <Route path="/contact" element={<ContactHelp />} />
              <Route path="/emergency" element={<EmergencyInfo />} />

              {/* Citizen Protected Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin', 'police_officer']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaint/register"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin', 'police_officer']}>
                    <RegisterComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/complaints"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin', 'police_officer']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaint/:trackingId"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin', 'police_officer']}>
                    <ComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin', 'police_officer']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Portal Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'police_officer']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'police_officer']}>
                    <AdminComplaintManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPoliceStationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'police_officer']}>
                    <AdminReportsAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
