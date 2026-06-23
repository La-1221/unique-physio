import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, CalendarClock, Activity, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/StatCard';
import { formatETB } from '../../utils/validation';

const AdminOverview = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/summary')
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard summary'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-bold text-2xl">Admin Overview</h1>
          <p className="text-dim text-sm mt-1">Clinic performance at a glance, Ethiopian business day (2:00 AM cutoff)</p>
        </div>
        <Link to="/dashboard/analytics" className="btn-secondary !px-4 !py-2.5 text-sm">
          Full Analytics <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Today's Income" value={formatETB(summary.today.income)} sublabel={`${summary.today.newPatients} new patients today`} icon={DollarSign} />
        <StatCard label="This Month" value={formatETB(summary.month.income)} sublabel={`${summary.month.newPatients} new patients`} icon={DollarSign} accent="teal" />
        <StatCard label="This Year" value={formatETB(summary.year.income)} sublabel={`${summary.year.newPatients} new patients`} icon={DollarSign} accent="teal" />
        <StatCard label="Active Patients" value={summary.totalActivePatients} sublabel="Currently on a package" icon={Users} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-dim text-sm mb-1">Sessions scheduled today</p>
            <p className="font-display font-bold text-2xl">{summary.today.sessionsToday}</p>
          </div>
          <Link to="/dashboard/today" className="btn-secondary !px-4 !py-2 text-sm">
            <Activity size={15} /> View list
          </Link>
        </div>
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-dim text-sm mb-1">Pending appointment requests</p>
            <p className="font-display font-bold text-2xl">{summary.pendingAppointments}</p>
          </div>
          <Link to="/dashboard/appointments" className="btn-secondary !px-4 !py-2 text-sm">
            <CalendarClock size={15} /> Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
