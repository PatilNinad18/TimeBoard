import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#a28fd0",
  "#b0b0b0",
];

const RADIAN = Math.PI / 180;
const PAD_ANGLE = 1;
const TOP_APPS_COUNT = 5;
const PCT_CHARS = 4; // room reserved for " 61%"

function groupSmallSlices(items) {
  const sorted = [...items].sort((a, b) => b.minutes - a.minutes);

  if (sorted.length <= TOP_APPS_COUNT) return sorted;

  const top = sorted.slice(0, TOP_APPS_COUNT);
  const rest = sorted.slice(TOP_APPS_COUNT);

  const otherMinutes = rest.reduce((sum, item) => sum + item.minutes, 0);

  return [
    ...top,
    {
      app: "Other",
      name: "Other",
      minutes: otherMinutes,
      isOther: true,
      apps: rest,
    },
  ].sort((a, b) => b.minutes - a.minutes);
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, Math.max(1, max - 1)) + "…" : text;
}

/**
 * Splits an app name into lines that fit `maxChars`, e.g.
 * "Visual Studio Code" -> ["Visual Studio", "Code"].
 * The last line keeps room for the percentage. If that is impossible the
 * percentage goes on its own line (pctOwnLine = true).
 */
function wrapLabel(name, maxChars) {
  const words = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => truncate(w, maxChars));

  const greedy = (limit) => {
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= limit) cur += " " + w;
      else {
        lines.push(cur);
        cur = w;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  };

  let lines = greedy(maxChars);

  // last line must leave room for the percentage
  if (lines[lines.length - 1].length > maxChars - PCT_CHARS) {
    const retry = greedy(maxChars - PCT_CHARS);
    if (retry[retry.length - 1].length <= maxChars - PCT_CHARS && retry.length <= 3) {
      lines = retry;
    }
  }

  // cap at 3 lines
  if (lines.length > 3) {
    lines = [lines[0], lines[1], truncate(lines.slice(2).join(" "), maxChars)];
  }

  const pctOwnLine = lines[lines.length - 1].length > maxChars - PCT_CHARS;
  return { lines, pctOwnLine };
}

/**
 * Computes, for every slice: the wrapped label lines and a vertical offset
 * (from the chart center) so labels on the same side never overlap.
 */
function computeLabelLayout({
  chartData,
  outerRadius,
  chartHeight,
  maxChars,
  lineHeight,
  gap,
}) {
  const total = chartData.reduce((s, d) => s + d.minutes, 0);
  const n = chartData.length;
  const usable = 360 - (n > 1 ? n * PAD_ANGLE : 0);

  let cursor = 0;
  const items = chartData.map((d, i) => {
    const sweep = (d.minutes / total) * usable;
    const mid = cursor + sweep / 2;
    cursor += sweep + (n > 1 ? PAD_ANGLE : 0);

    const { lines, pctOwnLine } = wrapLabel(d.app ?? d.name ?? "", maxChars);
    const rows = lines.length + (pctOwnLine ? 1 : 0);
    const height = rows * lineHeight;
    const limit = chartHeight / 2 - height / 2 - 6;
    // same sign convention as the slice position: y = cy + r * sin(-angle)
    const ideal = (outerRadius + 16) * Math.sin(-RADIAN * mid);

    return {
      i,
      lines,
      pctOwnLine,
      height,
      limit,
      side: Math.cos(-RADIAN * mid) >= 0 ? 1 : -1,
      dy: Math.max(-limit, Math.min(limit, ideal)),
    };
  });

  [1, -1].forEach((side) => {
    const group = items.filter((it) => it.side === side).sort((a, b) => a.dy - b.dy);

    for (let k = 1; k < group.length; k++) {
      const minDist = (group[k - 1].height + group[k].height) / 2 + gap;
      if (group[k].dy - group[k - 1].dy < minDist) {
        group[k].dy = group[k - 1].dy + minDist;
      }
    }
    for (let k = group.length - 1; k >= 0; k--) {
      let maxAllowed = group[k].limit;
      if (k < group.length - 1) {
        const minDist = (group[k].height + group[k + 1].height) / 2 + gap;
        maxAllowed = Math.min(maxAllowed, group[k + 1].dy - minDist);
      }
      if (group[k].dy > maxAllowed) group[k].dy = maxAllowed;
    }
  });

  const result = {};
  items.forEach((it) => {
    result[it.i] = it;
  });
  return result;
}

const ProductivityChart = ({ data, lastUpdated }) => {
  const [compact, setCompact] = useState(false);
  const [chartWidth, setChartWidth] = useState(560);
  const chartBoxRef = useRef(null);

  useEffect(() => {
    const updateCompact = () => setCompact(window.innerWidth <= 640);

    updateCompact();

    window.addEventListener("resize", updateCompact);

    return () => window.removeEventListener("resize", updateCompact);
  }, []);

  // Track the real width of the chart area so labels wrap to the space available
  useEffect(() => {
    const el = chartBoxRef.current;
    if (!el) return undefined;

    const update = () => setChartWidth(el.clientWidth || 560);
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const validData = (data || []).filter(
    (item) =>
      item &&
      (item.app || item.name) &&
      item.minutes != null &&
      !isNaN(item.minutes) &&
      item.minutes > 0
  );

  const chartData = groupSmallSlices(validData);
  const totalMinutes = chartData.reduce((s, i) => s + i.minutes, 0);

  const chartHeight = compact ? 280 : 340;
  const innerRadius = compact ? 34 : 62;
  const outerRadius = compact ? 52 : 100;
  const fontSize = compact ? 10 : 12;
  const lineHeight = fontSize + 3;
  const labelGapX = compact ? 18 : 26; // distance from ring to label anchor

  // Horizontal room between the ring's label anchor and the chart edge
  const availWidth = chartWidth / 2 - (outerRadius + labelGapX + 4) - 6;
  const maxChars = Math.max(7, Math.floor(availWidth / (fontSize * 0.62)));

  const layout = useMemo(
    () =>
      chartData.length
        ? computeLabelLayout({
            chartData,
            outerRadius,
            chartHeight,
            maxChars,
            lineHeight,
            gap: 4,
          })
        : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      JSON.stringify(chartData.map((d) => [d.app, d.minutes])),
      compact,
      maxChars,
    ]
  );

  // App name (wrapped) + percent next to each slice, joined by a leader line.
  const renderOutsideLabel = (props) => {
    const { cx, cy, midAngle, percent, index } = props;
    const item = chartData[index];
    const info = layout[index];
    if (!item || !info) return null;

    const color = item.isOther
      ? COLORS[COLORS.length - 1]
      : COLORS[index % COLORS.length];

    const cos = Math.cos(-RADIAN * midAngle);
    const sin = Math.sin(-RADIAN * midAngle);
    const side = cos >= 0 ? 1 : -1;

    const p1 = { x: cx + (outerRadius + 2) * cos, y: cy + (outerRadius + 2) * sin };
    const p2 = { x: cx + (outerRadius + 12) * cos, y: cy + (outerRadius + 12) * sin };
    const labelY = cy + info.dy;
    const p3 = { x: cx + side * (outerRadius + labelGapX), y: labelY };

    const pct = `${Math.round(percent * 100)}%`;
    const { lines, pctOwnLine, height } = info;
    const firstY = labelY - height / 2 + lineHeight / 2;
    const textX = p3.x + side * 4;

    return (
      <g style={{ pointerEvents: "none" }}>
        <polyline
          points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
        />
        <circle cx={p1.x} cy={p1.y} r={2} fill={color} />
        <text
          textAnchor={side === 1 ? "start" : "end"}
          dominantBaseline="central"
          fontSize={fontSize}
          fill="#374151"
        >
          {lines.map((line, li) => {
            const isLast = li === lines.length - 1;
            return (
              <tspan
                key={li}
                x={textX}
                y={firstY + li * lineHeight}
                fontWeight={600}
              >
                {line}
                {isLast && !pctOwnLine && (
                  <tspan dx={4} fill="#6b7280" fontWeight={400}>
                    {pct}
                  </tspan>
                )}
              </tspan>
            );
          })}
          {pctOwnLine && (
            <tspan
              x={textX}
              y={firstY + lines.length * lineHeight}
              fill="#6b7280"
            >
              {pct}
            </tspan>
          )}
        </text>
      </g>
    );
  };

  return (
    <div className="chart-card" style={{ maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: 0 }}>Time By Application</h3>

        {lastUpdated && (
          <span style={{ color: "#888", fontSize: 14 }}>
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      {validData.length === 0 ? (
        <div>No app usage data yet</div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: compact ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 16,
            overflow: "hidden",
          }}
        >
          {/* PIE CHART */}
          <div
            ref={chartBoxRef}
            style={{
              flex: 1,
              height: chartHeight,
              width: "100%",
              minWidth: 0,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={PAD_ANGLE}
                  dataKey="minutes"
                  nameKey="app"
                  label={renderOutsideLabel}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.app}
                      fill={
                        entry.isOther
                          ? COLORS[COLORS.length - 1]
                          : COLORS[i % COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, _n, { payload }) =>
                    payload.isOther
                      ? [
                          `${value} min (${payload.apps.length} apps)`,
                          "Other",
                        ]
                      : [`${value} min`, payload.app]
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CUSTOM LEGEND (full names + minutes) */}
          <div
            style={{
              width: compact ? "100%" : 260,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flexShrink: 0,
              paddingRight: 8,
              boxSizing: "border-box",
            }}
          >
            {chartData.map((item, index) => {
              const color = item.isOther
                ? COLORS[COLORS.length - 1]
                : COLORS[index % COLORS.length];
              const pct = totalMinutes
                ? Math.round((item.minutes / totalMinutes) * 100)
                : 0;

              return (
                <div
                  key={item.app}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      marginRight: 8,
                      marginTop: 4,
                      backgroundColor: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color,
                      fontSize: 13,
                      fontWeight: 500,
                      minWidth: 0,
                      flex: 1,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                    title={`${item.app}: ${item.minutes} min (${pct}%)`}
                  >
                    {item.app}: {item.minutes} min ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;