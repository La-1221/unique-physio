import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, User, Stethoscope, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { formatETB } from '../../utils/validation';

const statusStyles = {
  scheduled: { bg: 'bg-white/10', text: 'text-dim', Icon: Clock },
  attended: { bg: 'bg-teal/15', text: 'text-teal', Icon: CheckCircle2 },
  missed: { bg: 'bg-danger/15', text: 'text-danger', Icon: XCircle },
};

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/patients/${id}`)
      .then(({ data }) => { setPatient(data.patient); setSessions(data.sessions); })
      .catch((err) => setError(err.response?.data?.message || 'Could not load patient'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async (sessionId) => {
    setActionLoading(sessionId);
    try {
      await api.post(`/sessions/${sessionId}/check-in`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkMissed = async (sessionId) => {
    setActionLoading(sessionId);
    try {
      await api.post(`/sessions/${sessionId}/mark-missed`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark as missed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />;
  if (error) return <p className="text-danger">{error}</p>;
  if (!patient) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard/patients" className="inline-flex items-center gap-1.5 text-dim hover:text-teal text-sm mb-6">
        <ArrowLeft size={16} /> Back to patients
      </Link>

      <div className="card p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-teal text-sm mb-1">{patient.cardNo}</p>
            <h1 className="font-display font-bold text-2xl">{patient.fullName}</h1>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full ${patient.status === 'active' ? 'bg-teal/10 text-teal' : 'bg-white/10 text-dim'}`}>
            {patient.status}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2.5 text-dim"><Phone size={15} className="text-teal" /> {patient.phone}</div>
          <div className="flex items-center gap-2.5 text-dim"><User size={15} className="text-teal" /> {patient.sex}, {patient.age} years</div>
          <div className="flex items-center gap-2.5 text-dim"><Stethoscope size={15} className="text-teal" /> {patient.physiotherapist}</div>
          <div className="flex items-center gap-2.5 text-dim"><MapPin size={15} className="text-teal" /> {patient.address}</div>
          <div className="flex items-center gap-2.5 text-dim sm:col-span-2"><Calendar size={15} className="text-teal" /> Diagnosis: {patient.diagnosis}</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div>
            <p className="text-dim text-xs mb-1">Sessions Remaining</p>
            <p className="font-display font-bold text-xl">{patient.sessionsRemaining} / {patient.totalSessions}</p>
          </div>
          <div>
            <p className="text-dim text-xs mb-1">Paid For</p>
            <p className="font-display font-bold text-xl capitalize">{patient.payFor}</p>
          </div>
          <div>
            <p className="text-dim text-xs mb-1">Amount</p>
            <p className="font-display font-bold text-xl">{formatETB(patient.amount)}</p>
          </div>
        </div>
      </div>

      <div className="card p-7">
        <p className="font-semibold mb-5">Session Calendar</p>
        <div className="space-y-2">
          {sessions.map((s) => {
            const style = statusStyles[s.status];
            return (
              <div key={s._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface2 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                    <style.Icon size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(s.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {s.isMakeupSession && <span className="ml-2 text-xs text-warn">Makeup</span>}
                    </p>
                    <p className={`text-xs capitalize ${style.text}`}>{s.status}</p>
                  </div>
                </div>
                {s.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckIn(s._id)}
                      disabled={actionLoading === s._id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal text-bg hover:bg-teal-light disabled:opacity-50"
                    >
                      Check In
                    </button>
                    <button
                      onClick={() => handleMarkMissed(s._id)}
                      disabled={actionLoading === s._id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-danger hover:border-danger/40 disabled:opacity-50"
                    >
                      Mark Missed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
