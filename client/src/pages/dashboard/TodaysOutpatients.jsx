import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Phone, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const statusBadge = {
  scheduled: { bg: 'bg-white/10', text: 'text-dim', label: 'Scheduled' },
  attended: { bg: 'bg-teal/15', text: 'text-teal', label: 'Attended' },
  missed: { bg: 'bg-danger/15', text: 'text-danger', label: 'Missed' },
};

const TodaysOutpatients = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/sessions/today').then(({ data }) => setSessions(data.sessions)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/sessions/${id}/check-in`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkMissed = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/sessions/${id}/mark-missed`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark as missed');
    } finally {
      setActionLoading(null);
    }
  };

  const attendedCount = sessions.filter((s) => s.status === 'attended').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display font-bold text-2xl">Today's Expected Outpatients</h1>
          <p className="text-dim text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}{attendedCount} of {sessions.length} checked in
          </p>
        </div>
      </div>

      {loading ? (
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-dim">No outpatients scheduled for today.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => {
            const badge = statusBadge[s.status];
            const patient = s.patient;
            return (
              <div key={s._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-teal text-xs mb-0.5">{patient?.cardNo}</p>
                    <p className="font-semibold">{patient?.fullName}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-dim mb-4">
                  <p className="flex items-center gap-2"><Phone size={13} /> {patient?.phone}</p>
                  <p className="truncate">{patient?.diagnosis}</p>
                  <p>{patient?.sessionsRemaining} of {patient?.totalSessions} sessions remaining</p>
                </div>
                {s.status === 'scheduled' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckIn(s._id)}
                      disabled={actionLoading === s._id}
                      className="flex-1 text-sm font-semibold px-3 py-2 rounded-full bg-teal text-bg hover:bg-teal-light disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Check In
                    </button>
                    <button
                      onClick={() => handleMarkMissed(s._id)}
                      disabled={actionLoading === s._id}
                      className="px-3 py-2 rounded-full border border-white/15 text-dim hover:text-danger hover:border-danger/40 disabled:opacity-50"
                      title="Mark Missed"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                ) : (
                  <Link to={`/dashboard/patients/${patient?._id}`} className="text-xs text-teal hover:text-teal-light flex items-center gap-1">
                    View patient <ExternalLink size={11} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysOutpatients;
