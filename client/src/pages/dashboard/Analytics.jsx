import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';
import { formatETB } from '../../utils/validation';

const COLORS = ['#14C792', '#5EEFC3', '#0B6E52', '#E5A93D'];

const ChartCard = ({ title, sublabel, children, height = 320 }) => (
  <div className="card p-6">
    <p className="font-display font-semibold text-lg mb-0.5">{title}</p>
    {sublabel && <p className="text-dim text-xs mb-5">{sublabel}</p>}
    <div style={{ width: '100%', height }}>{children}</div>
  </div>
);

const tooltipStyle = {
  contentStyle: { background: '#0E1C17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 },
  labelStyle: { color: '#F2F6F4' },
};

const Analytics = () => {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [serviceMix, setServiceMix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/daily?days=30'),
      api.get('/analytics/monthly?months=12'),
      api.get('/analytics/service-mix'),
    ])
      .then(([d, m, s]) => {
        setDaily(d.data.series);
        setMonthly(m.data.series);
        setServiceMix(s.data.breakdown);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">Analytics</h1>
      <p className="text-dim text-sm mb-7">Income and patient trends, calculated from the Ethiopian clinic day (2:00 AM cutoff)</p>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Daily Income" sublabel="Last 30 days">
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#9FB3AC', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#9FB3AC', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v) => formatETB(v)} />
              <Line type="monotone" dataKey="income" stroke="#14C792" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Patients Per Day" sublabel="Last 30 days">
          <ResponsiveContainer>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#9FB3AC', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#9FB3AC', fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="newPatients" fill="#5EEFC3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Monthly Income" sublabel="Last 12 months">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9FB3AC', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#9FB3AC', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v) => formatETB(v)} />
              <Bar dataKey="income" fill="#14C792" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Mix" sublabel="All-time income by service type">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={serviceMix} dataKey="total" nameKey="service" cx="50%" cy="50%" outerRadius={100} label={(d) => d.service}>
                {serviceMix.map((entry, i) => (
                  <Cell key={entry.service} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => formatETB(v)} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9FB3AC' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
