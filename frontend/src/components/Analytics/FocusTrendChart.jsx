import React from "react";

const DEFAULT_TREND = {
  labels: [],
  focusScore: [],
  productiveTime: [],
};

function LinePath({ points, color, fill = false, width = 200, height = 100 }) {
  if (points.length < 2) return null;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const fillPath = fill
    ? `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : null;

  return (
    <g>
      {fill && (
        <path d={fillPath} fill={color} fillOpacity="0.12" />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="var(--surface)" strokeWidth="1.5" />
      ))}
    </g>
  );
}

function toPoints(values, w, h, padX = 20, padY = 10) {
  const max = Math.max(...values) * 1.15;
  return values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (w - padX * 2),
    y: h - padY - ((v / max) * (h - padY * 2)),
  }));
}

export default function FocusTrendChart({ data = DEFAULT_TREND }) {
  const W = 260;
  const H = 120;

  const hasData = data.labels.length > 0 && data.focusScore.length > 0;

  const focusPts = hasData ? toPoints(data.focusScore, W, H) : [];
  const prodPts = hasData ? toPoints(data.productiveTime, W, H) : [];

  const yMax = hasData ? Math.ceil(Math.max(...data.focusScore) * 1.15) : 1;
  const yTicks = Array.from({ length: yMax + 1 }, (_, i) => i);

  return (
    <div className="analytics-card focus-trend">
      <div className="card-header">
        <div className="header-left">
          <h3 className="section-title">Daily Trends</h3>
        </div>
       
      </div>

      <div className="trend-legend">
        <span className="legend-item"><span className="legend-line" style={{ background: "#888" }} /> Focus Score per Day</span>
        <span className="legend-item"><span className="legend-line" style={{ background: "#F5C518" }} /> Productive Time per Day</span>
      </div>

      <div className="chart-wrap">
        {!hasData ? (
          <p style={{ color: "var(--text-secondary, #888)", fontSize: 13, textAlign: "center", padding: "2rem 0" }}>
            No trend data yet — check back after a day of tracking
          </p>
        ) : (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* grid lines */}
          {yTicks.map((t) => {
            const y = H - 10 - (t / (yMax * 1.15)) * (H - 20);
            return (
              <g key={t}>
                <line x1={20} y1={y} x2={W - 5} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <text x={14} y={y + 4} fill="var(--text-secondary)" fontSize="8" textAnchor="end">{t}</text>
              </g>
            );
          })}

          <LinePath points={prodPts} color="#F5C518" fill width={W} height={H} />
          <LinePath points={focusPts} color="#888" fill={false} width={W} height={H} />

          {/* x labels */}
          {data.labels.map((l, i) => {
            const x = 20 + (i / (data.labels.length - 1)) * (W - 40);
            return (
              <text key={i} x={x} y={H - 1} fill="var(--text-secondary)" fontSize="8" textAnchor="middle">{l}</text>
            );
          })}
        </svg>
        )}
      </div>
    </div>
  );
}
