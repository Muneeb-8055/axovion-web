import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { adminApi } from '../../lib/api';

/* ---- Design tokens (inline to avoid raw hex in JSX) ---- */
const T = {
  surface:   'var(--ax-surface)',
  surface2:  'var(--ax-surface-2)',
  border:    'var(--ax-border)',
  heading:   'var(--ax-heading)',
  text:      'var(--ax-text)',
  muted:     'var(--ax-muted)',
  muted2:    'var(--ax-muted-2)',
  accent:    'var(--ax-accent)',
  success:   'var(--ax-success)',
  error:     'var(--ax-error)',
  warn:      'var(--ax-warn)',
  info:      'var(--ax-info)',
  panel:     'var(--ax-radius-panel)',
  control:   'var(--ax-radius-control)',
};

/* ---- Shared Recharts style ---- */
const gridStroke  = 'rgba(255,255,255,0.05)';
const axisStyle   = { fontSize: 10, fill: 'rgba(192,192,200,0.55)', fontFamily: 'JetBrains Mono, monospace' };
const tooltipStyle = {
  background: 'var(--ax-surface)',
  border: '1px solid var(--ax-border-strong)',
  borderRadius: 10,
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--ax-heading)',
};

/* ---- Skeleton ---- */
const Skel = ({ style }) => (
  <div
    aria-hidden="true"
    style={{
      background: T.surface2,
      borderRadius: 6,
      animation: 'ax-pulse 1.4s ease-in-out infinite',
      ...style,
    }}
  />
);

/* ---- Chart card: four-state wrapper ---- */
function ChartCard({ title, loading, error, empty, children }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.panel,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          color: T.heading,
          fontSize: 13,
          fontWeight: 600,
          margin: '0 0 14px 0',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>

      {loading ? (
        <Skel style={{ height: 240, borderRadius: 8 }} />
      ) : error ? (
        <div
          role="alert"
          style={{
            height: 240,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: T.error,
          }}
        >
          <AlertCircle strokeWidth={1.5} style={{ width: 22, height: 22 }} />
          <p style={{ color: T.text, fontSize: 12, margin: 0, textAlign: 'center' }}>
            Could not load data. Check your connection.
          </p>
        </div>
      ) : empty ? (
        <div
          style={{
            height: 240,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <BarChart2 strokeWidth={1.5} style={{ width: 24, height: 24, color: T.muted2 }} />
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>No data yet.</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ---- Retry button ---- */
function RetryButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        border: `1px solid ${T.border}`,
        borderRadius: T.control,
        background: 'transparent',
        color: T.text,
        fontSize: 13,
        cursor: 'pointer',
        minHeight: 44,
        marginTop: 12,
      }}
    >
      <RefreshCw strokeWidth={1.5} style={{ width: 13, height: 13 }} /> Retry
    </button>
  );
}

/* ---- Tooltip formatter: adds labels so non-color encoding works ---- */
function makeFormatter(label) {
  return (value) => [value, label];
}

/* ---- Main analytics page ---- */
const AdminAnalytics = () => {
  const [series,  setSeries]  = useState([]);
  const [funnel,  setFunnel]  = useState([]);
  const [sources, setSources] = useState([]);
  const [loadSeries,  setLoadSeries]  = useState(true);
  const [loadFunnel,  setLoadFunnel]  = useState(true);
  const [loadSources, setLoadSources] = useState(true);
  const [errSeries,   setErrSeries]   = useState(false);
  const [errFunnel,   setErrFunnel]   = useState(false);
  const [errSources,  setErrSources]  = useState(false);

  const loadSer = () => {
    setErrSeries(false);
    setLoadSeries(true);
    adminApi.timeseries(14)
      .then((r) => setSeries(r.data))
      .catch(() => setErrSeries(true))
      .finally(() => setLoadSeries(false));
  };
  const loadFun = () => {
    setErrFunnel(false);
    setLoadFunnel(true);
    adminApi.funnel()
      .then((r) => setFunnel(r.data))
      .catch(() => setErrFunnel(true))
      .finally(() => setLoadFunnel(false));
  };
  const loadSrc = () => {
    setErrSources(false);
    setLoadSources(true);
    adminApi.sources()
      .then((r) => setSources(r.data))
      .catch(() => setErrSources(true))
      .finally(() => setLoadSources(false));
  };

  useEffect(() => { loadSer(); loadFun(); loadSrc(); }, []);

  return (
    <div data-testid="admin-analytics-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes ax-pulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Page heading */}
      <div>
        <div
          className="ax-mono-label"
          style={{ color: T.accent, marginBottom: 4 }}
        >
          Analytics
        </div>
        <h1
          style={{
            color: T.heading,
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            textWrap: 'balance',
          }}
        >
          Performance and conversions
        </h1>
      </div>

      {/* Row 1: timeseries charts */}
      <div
        data-testid="admin-analytics-charts"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
        }}
        className="lg:grid-cols-2"
      >
        {/* Audits over time */}
        <ChartCard
          title="Audits (14 days)"
          loading={loadSeries}
          error={errSeries}
          empty={!loadSeries && !errSeries && series.length === 0}
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={series} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-audits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--ax-accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--ax-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={axisStyle} tickLine={false} />
              <YAxis stroke="transparent" tick={axisStyle} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={makeFormatter('Audits')}
                labelStyle={{ color: T.muted, marginBottom: 4 }}
                cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <Area
                type="monotone"
                dataKey="audits"
                stroke="var(--ax-accent)"
                strokeWidth={1.5}
                fill="url(#grad-audits)"
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--ax-accent)', strokeWidth: 1.5, fill: 'var(--ax-bg)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {errSeries && <RetryButton onClick={loadSer} />}
        </ChartCard>

        {/* Hot leads per day */}
        <ChartCard
          title="Hot leads per day"
          loading={loadSeries}
          error={errSeries}
          empty={!loadSeries && !errSeries && series.length === 0}
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={series} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={axisStyle} tickLine={false} />
              <YAxis stroke="transparent" tick={axisStyle} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={makeFormatter('Hot leads')}
                labelStyle={{ color: T.muted, marginBottom: 4 }}
                cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <Line
                type="monotone"
                dataKey="hot"
                stroke="var(--ax-error)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--ax-error)', strokeWidth: 1.5, fill: 'var(--ax-bg)' }}
              />
            </LineChart>
          </ResponsiveContainer>
          {errSeries && <RetryButton onClick={loadSer} />}
        </ChartCard>
      </div>

      {/* Row 2: funnel + sources */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
        }}
        className="lg:grid-cols-2"
      >
        {/* Conversion funnel */}
        <ChartCard
          title="Conversion funnel"
          loading={loadFunnel}
          error={errFunnel}
          empty={!loadFunnel && !errFunnel && funnel.length === 0}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnel} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="step" stroke="transparent" tick={axisStyle} tickLine={false} />
              <YAxis stroke="transparent" tick={axisStyle} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={makeFormatter('Count')}
                labelStyle={{ color: T.muted, marginBottom: 4 }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" fill="var(--ax-accent)" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: 'var(--ax-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {errFunnel && <RetryButton onClick={loadFun} />}
        </ChartCard>

        {/* Booking sources */}
        <ChartCard
          title="Booking sources"
          loading={loadSources}
          error={errSources}
          empty={!loadSources && !errSources && sources.length === 0}
        >
          {!loadSources && !errSources && sources.length > 0 && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sources} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="source" stroke="transparent" tick={axisStyle} tickLine={false} />
                <YAxis stroke="transparent" tick={axisStyle} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={makeFormatter('Bookings')}
                  labelStyle={{ color: T.muted, marginBottom: 4 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" fill="var(--ax-info)" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: 'var(--ax-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {errSources && <RetryButton onClick={loadSrc} />}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;
