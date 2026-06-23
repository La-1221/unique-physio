import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, UserPlus, CalendarClock, Search } from 'lucide-react';
import api from '../../utils/api';

const ReceptionistOverview = () => {
  const [todayCount, setTodayCount] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState(null);

  useEffect(() => {
    api.get('/sessions/today').then(({ data }) => setTodayCount(data.count)).catch(() => {});
    api.get('/appointments?status=pending').then(({ data }) => setPendingAppointments(data.count)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">Front Desk</h1>
      <p className="text-dim text-sm mb-7">Manage patients, today's check-ins, and appointment requests</p>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-dim text-sm mb-1">Expected outpatients today</p>
            <p className="font-display font-bold text-3xl">{todayCount ?? '—'}</p>
          </div>
          <ClipboardList size={28} className="text-teal" />
        </div>
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-dim text-sm mb-1">Pending appointment requests</p>
            <p className="font-display font-bold text-3xl">{pendingAppointments ?? '—'}</p>
          </div>
          <CalendarClock size={28} className="text-teal" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Link to="/dashboard/patients/new" className="card p-6 hover:border-teal/40 hover:-translate-y-1 transition-all">
          <UserPlus size={22} className="text-teal mb-3" />
          <p className="font-semibold">Register Patient</p>
          <p className="text-dim text-sm mt-1">New intake form with package details</p>
        </Link>
        <Link to="/dashboard/patients" className="card p-6 hover:border-teal/40 hover:-translate-y-1 transition-all">
          <Search size={22} className="text-teal mb-3" />
          <p className="font-semibold">Search Patients</p>
          <p className="text-dim text-sm mt-1">By name, card number, or phone</p>
        </Link>
        <Link to="/dashboard/today" className="card p-6 hover:border-teal/40 hover:-translate-y-1 transition-all">
          <ClipboardList size={22} className="text-teal mb-3" />
          <p className="font-semibold">Today's Outpatients</p>
          <p className="text-dim text-sm mt-1">Check in arriving patients</p>
        </Link>
      </div>
    </div>
  );
};

export default ReceptionistOverview;
