import { Link } from 'react-router-dom';
import { CalendarPlus, CalendarClock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientOverview = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">Welcome, {user?.fullName?.split(' ')[0]}</h1>
      <p className="text-dim text-sm mb-7">Manage your appointments at Unique Physiotherapy Speciality Clinic</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link to="/appointment" className="card p-7 hover:border-teal/40 hover:-translate-y-1 transition-all">
          <CalendarPlus size={26} className="text-teal mb-4" />
          <p className="font-semibold text-lg">Book an Appointment</p>
          <p className="text-dim text-sm mt-1.5">Schedule your next visit. The clinic is closed Sundays for new bookings.</p>
        </Link>
        <Link to="/dashboard/my-appointments" className="card p-7 hover:border-teal/40 hover:-translate-y-1 transition-all">
          <CalendarClock size={26} className="text-teal mb-4" />
          <p className="font-semibold text-lg">My Appointments</p>
          <p className="text-dim text-sm mt-1.5">View the status of your upcoming and past appointments.</p>
        </Link>
      </div>
    </div>
  );
};

export default PatientOverview;
