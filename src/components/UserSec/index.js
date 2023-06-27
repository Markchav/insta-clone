import Link from 'next/link'
import React from 'react'
import Image from 'next/image';

export default function User({username}) {
  return (
    <Link href={`/${username}`} className='grid grid-cols-4 gap-4 mb-6 items-center pt-3 '>
    <div className="flex items-center justify-between col-span-1">
    <Image
        className="rounded-full w-16 flex mr-3"
        src={`/../public/assets/images/avatars/${username}.jpeg`}
        alt="user"
        width={50}
        height={50}
        />
    </div>
    <div className="col-span-3">
    <p className="font-semibold text-sm">{username}</p>
    </div></Link>
  )
}
