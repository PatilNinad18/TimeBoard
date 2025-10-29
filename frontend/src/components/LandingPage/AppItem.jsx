import React from "react";

function AppItem({ name, selected, onToggle }) {
  return (
    <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          checked={!!selected}  // ensures true/false
          onChange={onToggle}
        />
      <span className="text-lg">{name}</span>
    </div>
  );
}
export default AppItem;
