import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const roles = ['admin', 'receptionist', 'patient'];
const roleStyle = {
  admin: 'bg-danger/15 text-danger',
  receptionist: 'bg-teal/15 text-teal',
  patient: 'bg-white/10 text-dim',
};

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = query ? `?search=${encodeURIComponent(query)}` : '';
    api.get(`/users${q}`).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update role');
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: !isActive });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">Manage Users</h1>
      <p className="text-dim text-sm mb-7">Promote staff to receptionist/admin, or deactivate accounts</p>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, or phone…" className="input-field pl-11" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-7 h-7 border-2 border-teal/30 border-t-teal rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-dim text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium">Name</th>
                  <th className="text-left px-5 py-3.5 font-medium">Email / Phone</th>
                  <th className="text-left px-5 py-3.5 font-medium">Role</th>
                  <th className="text-left px-5 py-3.5 font-medium">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{u.fullName} {u.id === currentUser.id && <span className="text-xs text-dim">(you)</span>}</td>
                    <td className="px-5 py-3.5 text-dim">
                      <p>{u.email}</p>
                      <p className="text-xs">{u.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.id === currentUser.id}
                        className={`text-xs px-2.5 py-1.5 rounded-full capitalize border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${roleStyle[u.role]}`}
                      >
                        {roles.map((r) => <option key={r} value={r} className="bg-surface text-ink">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${u.isActive ? 'bg-teal/10 text-teal' : 'bg-danger/10 text-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => toggleStatus(u.id, u.isActive)}
                          className="text-xs font-medium text-dim hover:text-teal inline-flex items-center gap-1"
                        >
                          {u.isActive ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 text-dim text-xs mt-5">
        <ShieldCheck size={15} className="text-teal flex-shrink-0 mt-0.5" />
        <p>The first account ever registered on the system automatically became admin. Only admins can promote other users.</p>
      </div>
    </div>
  );
};

export default ManageUsers;
