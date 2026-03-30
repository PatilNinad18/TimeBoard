import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const DEFAULT_STATS = {
  productiveTime: { label: "Total Productive Time", value: "35h 15m", trend: "up", delta: "+12%" },
  distractingTime: { label: "Total Distracting Time", value: "12h 05m", trend: "down", delta: "-8%" },
  idleTime: { label: "Total Idle Time", value: "4h 30m", trend: "neutral", delta: "0%" },
  focusScore: { label: "Focus Score %", value: "75%", trend: "up", scoreRaw: 75 },
};

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={14} className="trend up" />;
  if (trend === "down") return <TrendingDown size={14} className="trend down" />;
  return <Minus size={14} className="trend neutral" />;
};

const ScoreBar = ({ value }) => (
  <div className="score-bar-wrap">
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{ width: `${value}%` }} />
      <div className="score-bar-thumb" style={{ left: `${value}%` }} />
    </div>
    <div className="score-bar-labels">
      <span>0</span>
      <span>50</span>
      <span>100</span>
    </div>
  </div>
);

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
            {key === "focusScore" && <ScoreBar value={s.scoreRaw} />}
          </div>
        );
      })}
    </div>
  );
}
