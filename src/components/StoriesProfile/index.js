import Image from 'next/image'
import React from 'react'

export default function StoriesProfile({username, avatar}) {
return (
<div>
    <div className='bg-gradient-to-tr from-yellow-500 to-red-600 p-[1.5px] rounded-full'>
        <div className='bg-white rounded-full p-1'>
            <Image
            src={avatar}
            alt=''
            width={40}
            height={40}
            className='rounded-full h-14 w-14 '
            priority
            unoptimized={true}
            />
        </div>
    </div>
        <p className='font-semibold text-xs truncate text-center w-16'>{username}</p>
    </div>
)
}