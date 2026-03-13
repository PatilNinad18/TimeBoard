import React from 'react'

function ReportsTable() {
    return (
        <div >
            <table>
             <thead>
               <tr>
                 {columns.map((col, index) => (
                   <th key={index}>{col.header}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {data.map((row, rowIndex) => (
                 <tr key={rowIndex}>
                   {columns.map((col, colIndex) => (
                     <td key={colIndex}>{row[col.accessor]}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
            </table>
        </div>
    )
}

export default ReportsTable
