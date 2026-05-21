import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const DEFAULT_STATS = {
  productiveTime: { label: "Total Productive Time", value: "0h 0m", trend: "neutral", delta: "0%" },
  distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "0%" },
  idleTime: { label: "Total Idle Time", value: "0h 0m", trend: "neutral", delta: "0%" },
  focusScore: { label: "Focus Score %", value: "0%", trend: "neutral", scoreRaw: 0 },
};

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={14} className="trend up" />;
  if (trend === "down") return <TrendingDown size={14} className="trend down" />;
  return <Minus size={14} className="trend neutral" />;
};

// Note: the detailed score ring is shown in the Dashboard's `FocusCard`.
// Keep summary cards compact — no small score bar here.

export default function SummaryCards({ stats = DEFAULT_STATS }) {
  const cards = [
    { key: "productiveTime", color: "productive" },
    { key: "distractingTime", color: "distracting" },
    { key: "idleTime", color: "idle" },
    { key: "focusScore", color: "focus" },
  ];

  return (
    <div className="summary-cards">
      {cards.map(({ key, color }, i) => {
        const s = stats[key];
        return (
          <div key={key} className={`summary-card card-${color}`} style={{ animationDelay: `${i * 80}ms` }}>
            <p className="card-label">{s.label}</p>
            <div className="card-value-row">
              <span className="card-value">{s.value}</span>
              {s.trend && <TrendIcon trend={s.trend} />}
            </div>
            {s.delta && <span className="card-delta">{s.delta}</span>}
          </div>
        );
      })}
    </div>
  );
}
