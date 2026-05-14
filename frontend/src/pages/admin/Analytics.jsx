import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tooltipStyle = {
  background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12,
};

const AdminAnalytics = () => {
  const [series, setSeries] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    adminApi.timeseries(14).then((r) => setSeries(r.data)).catch(() => {});
    adminApi.funnel().then((r) => setFunnel(r.data)).catch(() => {});
    adminApi.sources().then((r) => setSources(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6" data-testid="admin-analytics-page">
      <div>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Analytics</div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Performance &amp; conversions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="admin-analytics-charts">
        <ChartCard title="Audits over time (14d)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="audits" stroke="#00D4FF" strokeWidth={2} fill="url(#cyanFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hot leads / day">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="hot" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Conversion funnel">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnel}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="step" stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#00D4FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Booking sources">
          {sources.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sources}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="source" stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(192,192,200,0.55)" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[#C0C0C8]/55 text-sm">No bookings yet.</div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
    <h3 className="text-white font-bold mb-4">{title}</h3>
    {children}
  </div>
);

export default AdminAnalytics;
