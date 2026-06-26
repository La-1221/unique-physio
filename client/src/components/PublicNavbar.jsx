import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from '../utils/clinicInfo';

const navLinks = [
  { id: 'home', en: 'Home', am: 'ዋና ገጽ' },
  { id: 'services', en: 'Services', am: 'አገልግሎቶቻችን' },
  { id: 'about', en: 'About', am: 'ስለ እኛ' },
  { id: 'contact', en: 'Contact', am: 'ያግኙን' },
];

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean);
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top <= 100) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-bg/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-20">
        <button onClick={() => scrollTo('home')}>
          <Logo size="md" />
        </button>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className={`text-sm font-medium transition-colors hover:text-teal ${activeSection === link.id && location.pathname === '/' ? 'text-teal' : 'text-ink/85'}`}
              >
                {link.en} <span className="amharic text-dim/70 text-xs">/ {link.am}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a href={CLINIC_PHONE_TEL} className="btn-secondary !px-4 !py-2.5 text-sm">
            <Phone size={15} /> {CLINIC_PHONE_DISPLAY}
          </a>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary !px-5 !py-2.5 text-sm">Dashboard</button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary !px-5 !py-2.5 text-sm">Login</button>
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
              <li key={link.id}>
                <button onClick={() => scrollTo(link.id)} className="block text-base font-medium text-ink hover:text-teal w-full text-left">
                  {link.en} <span className="amharic text-dim text-sm">/ {link.am}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            <a href={CLINIC_PHONE_TEL} className="btn-secondary w-full"><Phone size={15} /> {CLINIC_PHONE_DISPLAY}</a>
            {user ? (
              <button onClick={() => { setOpen(false); navigate('/dashboard'); }} className="btn-primary w-full">Dashboard</button>
            ) : (
              <button onClick={() => { setOpen(false); navigate('/login'); }} className="btn-primary w-full">Login</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
