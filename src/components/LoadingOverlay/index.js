import React from 'react'
import { BiLoader } from 'react-icons/bi'

export default function LoadingOverlay() {
  return (
    <div className='absolute inset-0 w-full h-full bg-black bg-opacity-5 flex place-content-center pt-[222px] z-10'>
    <BiLoader size={25} className='animate-spin text-white'/>
  </div>
  )
}
