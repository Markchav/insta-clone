import React, { useEffect } from 'react'
import Image from 'next/image'
export default function ProfilePost({url}) {

  return (
    <div  className=' overflow-hidden w-full h-full'>

    <Image className="w-full h-60 sm:h-80 object-cover"
        src={url}
        alt=''
        width={300}
        height={300}/>

        
    </div>
  )
}