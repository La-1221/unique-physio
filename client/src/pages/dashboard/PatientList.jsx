import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(() => {
    setLoading(true);
    api.get('/patients').then(({ data }) => setPatients(data.patients)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!query.trim()) {
      loadAll();
      return;
    }
    const timeout = setTimeout(() => {
      setLoading(true);
      api.get(`/patients/search?q=${encodeURIComponent(query)}`)
        .then(({ data }) => setPatients(data.patients))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, loadAll]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display font-bold text-2xl">Patients</h1>
          <p className="text-dim text-sm mt-1">Search by name, card number, or phone</p>
        </div>
        <Link to="/dashboard/patients/new" className="btn-primary !px-4 !py-2.5 text-sm">
          <UserPlus size={16} /> Register Patient
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, card no (UNPT0001), or phone…"
          className="input-field pl-11"
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-7 h-7 border-2 border-teal/30 border-t-teal rounded-full animate-spin" /></div>
        ) : patients.length === 0 ? (
          <p className="text-dim text-center py-12">No patients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-dim text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium">Card No</th>
                  <th className="text-left px-5 py-3.5 font-medium">Name</th>
                  <th className="text-left px-5 py-3.5 font-medium">Phone</th>
                  <th className="text-left px-5 py-3.5 font-medium">Diagnosis</th>
                  <th className="text-left px-5 py-3.5 font-medium">Sessions Left</th>
                  <th className="text-left px-5 py-3.5 font-medium">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-teal">{p.cardNo}</td>
                    <td className="px-5 py-3.5 font-medium">{p.fullName}</td>
                    <td className="px-5 py-3.5 text-dim">{p.phone}</td>
                    <td className="px-5 py-3.5 text-dim truncate max-w-[200px]">{p.diagnosis}</td>
                    <td className="px-5 py-3.5">{p.sessionsRemaining} / {p.totalSessions}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'active' ? 'bg-teal/10 text-teal' : 'bg-white/10 text-dim'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/dashboard/patients/${p._id}`} className="text-dim hover:text-teal">
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
