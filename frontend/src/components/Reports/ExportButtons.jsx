import React from 'react';
import { Download } from 'lucide-react';

function ExportButtons({ onExportCSV }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-5">
        <button
          onClick={onExportCSV}
          className="text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, var(--accent-color), var(--accent-hover))`,
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default ExportButtons;
