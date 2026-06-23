import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import ReceptionistOverview from './ReceptionistOverview';
import PatientOverview from './PatientOverview';

const DashboardOverview = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminOverview />;
  if (user?.role === 'receptionist') return <ReceptionistOverview />;
  return <PatientOverview />;
};

export default DashboardOverview;
