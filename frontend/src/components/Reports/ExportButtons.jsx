import React from 'react';
import { Download } from 'lucide-react';

function ExportButtons({ onExportCSV }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-5">
        <button
          onClick={onExportCSV}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default ExportButtons;
