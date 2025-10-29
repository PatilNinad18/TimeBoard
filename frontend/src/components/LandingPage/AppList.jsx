import React from "react";
import AppItem from "./AppItem";

function AppList({ apps, onToggle }) {
  return (
    <div>
      {apps.map((app, index) => (
        <AppItem
          key={index}
          name={app.name}
          selected={app.selected}
          onToggle={() => onToggle(index)}  // ✅ calls parent’s handler
        />
      ))}
    </div>
  );
}
export default AppList;
