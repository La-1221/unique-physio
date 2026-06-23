import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from '../utils/clinicInfo';

const navLinks = [
  { to: '/', en: 'Home', am: 'ዋና ገጽ' },
  { to: '/services', en: 'Services', am: 'አገልግሎቶቻችን' },
  { to: '/about', en: 'About', am: 'ስለ እኛ' },
  { to: '/contact', en: 'Contact', am: 'ያግኙን' },
];

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-bg/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size="md" />
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-teal ${isActive ? 'text-teal' : 'text-ink/85'}`
                }
              >
                {link.en} <span className="amharic text-dim/70 text-xs">/ {link.am}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a href={CLINIC_PHONE_TEL} className="btn-secondary !px-4 !py-2.5 text-sm">
            <Phone size={15} /> {CLINIC_PHONE_DISPLAY}
          </a>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary !px-5 !py-2.5 text-sm">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary !px-5 !py-2.5 text-sm">
              Login
            </button>
          )}
        </div>

        <button className="lg:hidden text-ink p-2" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-surface border-t border-white/5 px-5 py-6 animate-floatUp">
          <ul className="flex flex-col gap-4 mb-6">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `block text-base font-medium ${isActive ? 'text-teal' : 'text-ink'}`}
                >
                  {link.en} <span className="amharic text-dim text-sm">/ {link.am}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            <a href={CLINIC_PHONE_TEL} className="btn-secondary w-full">
              <Phone size={15} /> {CLINIC_PHONE_DISPLAY}
            </a>
            {user ? (
              <button onClick={() => { setOpen(false); navigate('/dashboard'); }} className="btn-primary w-full">
                Dashboard
              </button>
            ) : (
              <button onClick={() => { setOpen(false); navigate('/login'); }} className="btn-primary w-full">
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
