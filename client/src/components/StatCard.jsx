const StatCard = ({ label, value, sublabel, icon: Icon, accent = 'teal' }) => {
  const accents = {
    teal: 'bg-teal/10 text-teal',
    warn: 'bg-warn/10 text-warn',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-dim text-sm font-medium">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accents[accent]}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <p className="font-display font-bold text-3xl text-ink">{value}</p>
      {sublabel && <p className="text-dim text-xs mt-1.5">{sublabel}</p>}
    </div>
  );
};

export default StatCard;
