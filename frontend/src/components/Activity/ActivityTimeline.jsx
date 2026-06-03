import React from "react";
import { ListX } from "lucide-react";
import ActivityGroup from "./ActivityGroup";

export default function ActivityTimeline({ groups = [], showIdleDetails = false }) {
  if (!groups.length) {
    return (
      <div className="timeline-empty">
        <ListX size={36} className="empty-icon" />
        <p className="empty-title">No activity found</p>
        <p className="empty-sub">Try adjusting the filter or date.</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      {groups.map((group, i) => (
        <ActivityGroup key={group.timeLabel ?? i} group={group} showIdleDetails={showIdleDetails} />
      ))}
    </div>
  );
}
