
import React, { useEffect, useState } from 'react'
import { generateFakeUsers } from '@/utils/generateFakeUser';
import SuggestionsProfile from '../SuggestionsProfile';

export default function Suggestions() {

  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const suggestions = generateFakeUsers(5)
    setSuggestions(suggestions)
  }, [])
  
  return (
    <div className=''>
      <div className='flex justify-between text-sm'>
        <h3 className='font-semibold text-gray-500'>Suggested for you</h3>
        <button className=' text-xs font-semibold'>See All</button>
      </div>
      <div>
        {
          suggestions.map((item,idx)=> {
            return (
              <SuggestionsProfile
                key={idx}
                username= {item.username}
                avatar= {item.avatar}
              />
            )
          })
        }
      </div>
    </div>
  )
}
