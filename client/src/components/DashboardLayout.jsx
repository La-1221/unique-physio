import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarClock, UserCog, BarChart3,
  LogOut, Menu, X, Stethoscope, ClipboardList, CalendarPlus,
} from 'lucide-react';
import Logo from '../components/Logo';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  admin: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/patients', label: 'Patients', icon: Users },
    { to: '/dashboard/today', label: "Today's Outpatients", icon: ClipboardList },
    { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/dashboard/users', label: 'Manage Users', icon: UserCog },
  ],
  receptionist: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/patients', label: 'Patients', icon: Users },
    { to: '/dashboard/today', label: "Today's Outpatients", icon: ClipboardList },
    { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarClock },
  ],
  patient: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/my-appointments', label: 'My Appointments', icon: CalendarClock },
    { to: '/appointment', label: 'Book Appointment', icon: CalendarPlus },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = navByRole[user?.role] || navByRole.patient;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-surface/50">
        <div className="px-6 py-6 border-b border-white/5">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal/15 text-teal' : 'text-dim hover:bg-white/5 hover:text-ink'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-5 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-teal/15 flex items-center justify-center text-teal font-semibold text-sm flex-shrink-0">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.fullName}</p>
              <p className="text-xs text-dim capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dim hover:bg-danger/10 hover:text-danger transition-colors w-full">
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-surface h-full flex flex-col animate-floatUp">
            <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setSidebarOpen(false)}><X size={22} /></button>
            </div>
            <nav className="flex-1 px-3 py-5 space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-teal/15 text-teal' : 'text-dim hover:bg-white/5 hover:text-ink'
                    }`
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-5 border-t border-white/5">
              <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dim hover:bg-danger/10 hover:text-danger transition-colors w-full">
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-5 lg:px-8 bg-bg/80 backdrop-blur-md sticky top-0 z-30">
          <button className="lg:hidden text-ink" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-dim text-sm">
            <Stethoscope size={16} className="text-teal" />
            <span>Unique Physiotherapy Speciality Clinic</span>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
