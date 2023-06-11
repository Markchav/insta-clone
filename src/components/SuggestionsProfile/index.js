import Image from 'next/image'
import React from 'react'

export default function SuggestionsProfile({username, avatar}) {
return (
    <div className='flex items-center justify-between mt-3 cursor-pointer'>
    <Image
        src={avatar}
        alt=''
        width={40}
        height={40}
        className='rounded-full'
        priority
    />

    <div className='flex-1 ml-4 cursor-pointer'>
    <h2 className='font-semibold text-sm'>{username}</h2>
    <h3 className='text-xs text-gray-500'>Suggested for you</h3>
    </div>

    <button className='text-[#0095F6] text-sm font-semibold'>Follow</button>
    
    </div>
)
}
