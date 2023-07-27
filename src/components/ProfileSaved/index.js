import React from 'react'
import Image from 'next/image'

export default function ProfileSaved({url}) {
  return (
    <div className=' overflow-hidden w-full'>
    <Image  className="w-full h-60 sm:h-80 object-cover"
    src={url}
    alt=''
    width={300}
    height={300}
    priority
    />
</div>
  )
}
