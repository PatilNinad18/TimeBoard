import React from 'react'
import { Search } from 'lucide-react';

function SearchBar() {
    return (
      <div className='bg-white text-black rounded-4xl shadow-2xl p-4 flex justify-between w-200'>
        <div className='text-black flex items-baseline gap-10'>
            <p>Daily</p>
            <p>Weekly</p>
            <p>Monthly</p>
        </div>
        <Search/>        
      </div>
    )
}

export default SearchBar
