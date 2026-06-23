const Logo = ({ size = 'md', showTagline = false }) => {
  const sizes = {
    sm: { mark: 28, title: 'text-sm', tagline: 'text-[9px]' },
    md: { mark: 36, title: 'text-lg', tagline: 'text-[10px]' },
    lg: { mark: 52, title: 'text-2xl', tagline: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={s.mark} height={s.mark} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 38C12 30 18 34 22 28C25 23 20 19 24 14" stroke="#14C792" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="10" r="3.2" fill="#5EEFC3" />
        <circle cx="33" cy="14" r="2.4" fill="#14C792" />
        <circle cx="36.5" cy="19" r="1.8" fill="#0B6E52" />
        <path d="M22 28C26 24 30 26 33 22C35.5 18.8 34 15 37 12" stroke="#0B6E52" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </svg>
      <div className="leading-tight">
        <p className={`font-display font-bold tracking-tight text-ink ${s.title}`}>
          UNIQUE <span className="text-teal">PHYSIOTHERAPY</span>
        </p>
        <p className={`uppercase tracking-[0.2em] text-dim ${s.tagline} -mt-0.5`}>Speciality Clinic</p>
        {showTagline && <p className="text-dim/70 text-xs mt-1 italic">Restoring Movement, Restoring Life</p>}
      </div>
    </div>
  );
};

export default Logo;
