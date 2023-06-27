import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'


export default function ProfilePost({url}) {

  const router = useRouter()
  // const username = router.query.username
  // const id = router.query.id
  return (
    <div  className=' overflow-hidden w-full'>
        <Image className="w-full h-full object-cover"
        src={url}
        alt=''
        width={300}
        height={300}/>
    </div>
  )
}
