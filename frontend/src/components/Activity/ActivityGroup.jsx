import React from "react";
import { Clock } from "lucide-react";
import ActivityItem from "./ActivityItem";

export default function ActivityGroup({ group, showIdleDetails = false }) {
  const { timeLabel, items, totalMinutes } = group;

  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;
  const totalStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Get the time range of actual activities in this group
  const firstItemTime = items[0]?.exactTime || '';
  const lastItemTime = items[items.length - 1]?.exactTime || '';
  const timeRange = firstItemTime && lastItemTime && firstItemTime !== lastItemTime 
    ? `${firstItemTime} - ${lastItemTime}` 
    : timeLabel;

  return (
    <div className="activity-group">
      {/* Group header */}
      <div className="group-header">
        <div className="group-header-left">
          <Clock size={13} className="group-clock-icon" />
          <span className="group-time-label">{timeRange}</span>
        </div>
        <span className="group-total">{totalStr} total</span>
      </div>

      {/* Items */}
      <div className="group-items">
        {items.map((item, i) => (
          <ActivityItem
            key={item.id ?? i}
            item={item}
            isIdle={item.category === "Idle"}
            showIdleDetails={showIdleDetails}
          />
        ))}
      </div>
    </div>
  );
}
