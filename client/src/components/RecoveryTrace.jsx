// The hero's signature element: a single continuous line that starts
// jagged and erratic (representing pain / restricted movement) and
// resolves into a smooth, confident arc (representing recovery). It draws
// itself in on load via stroke-dasharray animation. This is literal to
// the brand promise "Restoring Movement, Restoring Life" rather than a
// generic decorative squiggle.

const RecoveryTrace = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 800 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 150 L40 145 L60 165 L80 130 L100 175 L120 120 L140 160 L160 110
           Q220 60 280 100 Q340 140 400 90 Q480 30 560 70 Q650 115 800 60"
        stroke="url(#traceGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1400"
        strokeDashoffset="1400"
        className="animate-pulseLine"
      />
      <defs>
        <linearGradient id="traceGradient" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E5484D" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#E5A93D" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#14C792" />
          <stop offset="100%" stopColor="#5EEFC3" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default RecoveryTrace;
