import React from 'react'

function ExportButtons() {
    return (
        <div className="flex items-center gap-4">
          <div className="flex gap-5">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600         text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
              Export PDF
            </button>
            
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600         text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
              Export CSV
            </button>
          </div>
        </div>

    )
}

export default ExportButtons
