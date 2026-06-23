import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarPlus } from 'lucide-react';
import api from '../../utils/api';

const statusStyle = {
  pending: 'bg-warn/15 text-warn',
  confirmed: 'bg-teal/15 text-teal',
  cancelled: 'bg-danger/15 text-danger',
  completed: 'bg-white/10 text-dim',
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/mine').then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <h1 className="font-display font-bold text-2xl">My Appointments</h1>
        <Link to="/appointment" className="btn-primary !px-4 !py-2.5 text-sm">
          <CalendarPlus size={16} /> Book New
        </Link>
      </div>

      {loading ? (
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-dim mb-4">You haven't booked any appointments yet.</p>
          <Link to="/appointment" className="btn-primary inline-flex">Book Your First Appointment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-teal" />
                <div>
                  <p className="font-medium">{new Date(a.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  {a.reasonNote && <p className="text-dim text-sm mt-0.5">{a.reasonNote}</p>}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyle[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
