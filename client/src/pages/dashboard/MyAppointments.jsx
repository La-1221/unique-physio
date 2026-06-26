import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarPlus, CalendarClock, XCircle } from 'lucide-react';
import api from '../../utils/api';

const statusStyle = {
  pending: 'bg-warn/15 text-warn',
  confirmed: 'bg-teal/15 text-teal',
  cancelled: 'bg-danger/15 text-danger',
  completed: 'bg-white/10 text-dim',
};

const getMinDateTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Reschedule modal state
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/appointments/mine')
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setActionLoading(id);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) { setDateError('Select a new date and time'); return; }
    const picked = new Date(newDate);
    if (picked.getDay() === 0) { setDateError('The clinic is closed on Sunday. Please choose another day.'); return; }
    const hour = picked.getHours();
    if (hour < 8 || hour >= 19) { setDateError('Appointments can only be booked between 8:00 AM and 7:00 PM.'); return; }
    setDateError('');
    setActionLoading(rescheduleId);
    try {
      await api.patch(`/appointments/${rescheduleId}/reschedule`, { date: picked.toISOString() });
      setRescheduleId(null);
      setNewDate('');
      load();
    } catch (err) {
      setDateError(err.response?.data?.message || 'Could not reschedule');
    } finally {
      setActionLoading(null);
    }
  };

  const canModify = (a) => ['pending', 'confirmed'].includes(a.status);

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
            <div key={a._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {new Date(a.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                    {a.reasonNote && <p className="text-dim text-sm mt-0.5">{a.reasonNote}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyle[a.status]}`}>
                  {a.status}
                </span>
              </div>

              {canModify(a) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => { setRescheduleId(a._id); setNewDate(''); setDateError(''); }}
                    disabled={actionLoading === a._id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-teal hover:border-teal/40 disabled:opacity-50 transition-colors"
                  >
                    <CalendarClock size={13} /> Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(a._id)}
                    disabled={actionLoading === a._id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-danger hover:border-danger/40 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card p-7 w-full max-w-md">
            <h2 className="font-display font-bold text-lg mb-5">Reschedule Appointment</h2>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="label">New Date & Time</label>
                <input
                  type="datetime-local"
                  value={newDate}
                  min={getMinDateTime()}
                  onChange={(e) => { setNewDate(e.target.value); setDateError(''); }}
                  className={`input-field ${dateError ? 'has-error' : ''}`}
                />
                {dateError && <p className="field-error">{dateError}</p>}
                <p className="text-xs text-dim mt-1.5">Mon–Sat, 8:00 AM – 7:00 PM only</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === rescheduleId}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {actionLoading === rescheduleId ? 'Saving…' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
