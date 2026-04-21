import React from "react";

const DEFAULT_TREND = {
  labels:         [],
  focusScore:     [],
  productiveTime: [],
};

function LinePath({ points, color, fill = false }) {
  if (!points || points.length < 2) return null;

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const fillPath = fill
    ? `${d} L ${points[points.length-1].x.toFixed(1)} ${points[points.length-1].baseY.toFixed(1)} L ${points[0].x.toFixed(1)} ${points[0].baseY.toFixed(1)} Z`
    : null;

  return (
    <g>
      {fill && <path d={fillPath} fill={color} fillOpacity="0.10" />}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={color} stroke="var(--surface)" strokeWidth="1.5" />
      ))}
    </g>
  );
}

function toPoints(values, W, H, padX, padY) {
  if (!values || values.length === 0) return [];

  const max = Math.max(...values);
  // If all values are 0, render flat line at bottom
  const effectiveMax = max === 0 ? 1 : max * 1.2;
  const baseY = H - padY;

  return values.map((v, i) => {
    const x = values.length === 1
      ? W / 2
      : padX + (i / (values.length - 1)) * (W - padX * 2);
    const y = H - padY - (v / effectiveMax) * (H - padY * 2);
    return { x, y, baseY };
  });
}

export default function FocusTrendChart({ data = DEFAULT_TREND }) {
  const W    = 280;
  const H    = 130;
  const padX = 28;
  const padY = 12;

  const hasData =
    data.labels?.length > 0 &&
    data.focusScore?.length > 0 &&
    (data.focusScore.some(v => v > 0) || data.productiveTime.some(v => v > 0));

  const focusPts = hasData ? toPoints(data.focusScore,     W, H, padX, padY) : [];
  const prodPts  = hasData ? toPoints(data.productiveTime, W, H, padX, padY) : [];

  // Y axis: 0, 25, 50, 75, 100 for focus score
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="analytics-card focus-trend">
      <div className="card-header">
        <div className="header-left">
          <h3 className="section-num">5.</h3>
          <h3 className="section-title">Daily Trends</h3>
        </div>
      </div>

      <div className="trend-legend">
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#888" }} />
          Focus Score
        </span>
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#F5C518" }} />
          Productive Time
        </span>
      </div>

      <div className="chart-wrap">
        {!hasData ? (
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            height:         120,
            color:          "var(--text-tertiary)",
            fontSize:       13,
            textAlign:      "center",
          }}>
            No trend data yet — check back after a day of tracking
          </div>
        ) : (
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            overflow="visible"
          >
            {/* Y axis grid lines */}
            {yTicks.map(t => {
              const y = H - padY - (t / 100) * (H - padY * 2);
              return (
                <g key={t}>
                  <line
                    x1={padX} y1={y.toFixed(1)}
                    x2={W - 5} y2={y.toFixed(1)}
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padX - 4}
                    y={(y + 4).toFixed(1)}
                    fill="var(--text-tertiary)"
                    fontSize="7"
                    textAnchor="end"
                  >
                    {t}
                  </text>
                </g>
              );
            })}

            {/* Lines */}
            <LinePath points={prodPts}  color="#F5C518" fill />
            <LinePath points={focusPts} color="#888888" />

            {/* X axis labels */}
            {(data.labels || []).map((l, i) => {
              const x = data.labels.length === 1
                ? W / 2
                : padX + (i / (data.labels.length - 1)) * (W - padX * 2);
              return (
                <text
                  key={i}
                  x={x.toFixed(1)}
                  y={(H + 2).toFixed(1)}
                  fill="var(--text-tertiary)"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {l}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}