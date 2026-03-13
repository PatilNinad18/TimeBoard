import React from 'react'
import Header from '../components/Header'
import SummaryCards from '../components/Reports/SummaryCards'
import {FaClock } from "react-icons/fa"; 
import ReportsHeader from '../components/Reports/ReportsHeader';
import SearchBar from '../components/Reports/SearchBar';
import ExportButtons from '../components/Reports/ExportButtons';
import ReportsTable from '../components/Reports/ReportsTable';

function Reports() {
    return (
        <div className="p-7 space-y-6">
          {/* <h1 className="text-2xl text-black font-bold">Reports</h1> */}
          <ReportsHeader/>
          {/* <Header/>  */}

          {/* SummaryCards */}
          <div className=''>
            <div className='flex space-x-10 justify-between h-40 w-300  '>
              <SummaryCards
                title="Best Focus Day:"
                value="6 hrs"
                className="w-full"
              />
              <SummaryCards
                title="Average Focus Hours:"
                value="3h 30m"
                className="w-full"
              />
              <SummaryCards
               title="Total Focus Time:"
               value="28 hrs"
               className="w-full"
              />

              <SummaryCards
               title="Consistency:"
               value="82 %"
               className="w-full"
              />
            </div>
          
          <div className='pt-6'>
            <div className='flex items-end justify-between'>
              <SearchBar/>
              <ExportButtons/>
            </div>
          i</div>

          </div>
          <ReportsTable/>

          {/* ReportsTable */}
          {/* ExportButtons */}
        </div>
    )
}

export default Reports
