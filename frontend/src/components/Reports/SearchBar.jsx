import React from 'react';
import { Search } from 'lucide-react';

const PERIODS = ["Daily", "Weekly", "Monthly"];

function SearchBar({ selected = "weekly", onPeriodChange }) {
  return (
    <div className="bg-white text-black rounded-4xl shadow-2xl p-4 flex justify-between w-200">
      <div className="text-black flex items-baseline gap-10">
        {PERIODS.map((p) => (
          <p
            key={p}
            onClick={() => onPeriodChange?.(p.toLowerCase())}
            style={{
              cursor: "pointer",
              fontWeight: selected === p.toLowerCase() ? "bold" : "normal",
              color: selected === p.toLowerCase() ? "var(--accent-color)" : "inherit",
              borderBottom: selected === p.toLowerCase() ? `2px solid var(--accent-color)` : "none",
              paddingBottom: "2px",
            }}
          >
            {p}
          </p>
        ))}
      </div>
      <Search />
    </div>
  );
}

export default SearchBar;
