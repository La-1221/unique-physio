import { useState, useEffect, useCallback } from 'react';
import { Phone, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];
const statusStyle = {
  pending: 'bg-warn/15 text-warn',
  confirmed: 'bg-teal/15 text-teal',
  cancelled: 'bg-danger/15 text-danger',
  completed: 'bg-white/10 text-dim',
};

const AppointmentsManage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    api.get(`/appointments${q}`).then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display font-bold text-2xl">Appointments</h1>
          <p className="text-dim text-sm mt-1">Review and manage booking requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 rounded-full border ${!filter ? 'border-teal text-teal bg-teal/10' : 'border-white/10 text-dim'}`}>All</button>
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full border capitalize ${filter === s ? 'border-teal text-teal bg-teal/10' : 'border-white/10 text-dim'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-dim">No appointments found.</p></div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{a.fullName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyle[a.status]}`}>{a.status}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(a.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> {a.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={12} /> {a.email}</span>
                </div>
                {a.reasonNote && <p className="text-dim text-xs mt-1.5 italic">"{a.reasonNote}"</p>}
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(a._id, 'confirmed')} className="text-xs font-semibold px-3 py-2 rounded-full bg-teal text-bg hover:bg-teal-light flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Confirm
                  </button>
                  <button onClick={() => updateStatus(a._id, 'cancelled')} className="text-xs font-semibold px-3 py-2 rounded-full border border-white/15 text-dim hover:text-danger hover:border-danger/40 flex items-center gap-1.5">
                    <XCircle size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsManage;
