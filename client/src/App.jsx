import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import AppointmentBooking from './pages/AppointmentBooking';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import DashboardOverview from './pages/dashboard/DashboardOverview';
import Analytics from './pages/dashboard/Analytics';
import PatientList from './pages/dashboard/PatientList';
import PatientRegisterForm from './pages/dashboard/PatientRegisterForm';
import PatientDetail from './pages/dashboard/PatientDetail';
import TodaysOutpatients from './pages/dashboard/TodaysOutpatients';
import AppointmentsManage from './pages/dashboard/AppointmentsManage';
import ManageUsers from './pages/dashboard/ManageUsers';
import MyAppointments from './pages/dashboard/MyAppointments';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/appointment" element={<AppointmentBooking />} />
          </Route>

          {/* Auth (no navbar/footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard - any authenticated role */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/my-appointments" element={<MyAppointments />} />

              {/* Admin + Receptionist only */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
                <Route path="/dashboard/patients" element={<PatientList />} />
                <Route path="/dashboard/patients/new" element={<PatientRegisterForm />} />
                <Route path="/dashboard/patients/:id" element={<PatientDetail />} />
                <Route path="/dashboard/today" element={<TodaysOutpatients />} />
                <Route path="/dashboard/appointments" element={<AppointmentsManage />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/dashboard/analytics" element={<Analytics />} />
                <Route path="/dashboard/users" element={<ManageUsers />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
