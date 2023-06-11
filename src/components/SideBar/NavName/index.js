import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function NavName({More,name}) {


    const handleLogOut = async ()=> {
        await signOut(auth)
        window.location.reload()
    }
return (
    <button onClick={handleLogOut} className='flex flex-row fixed bottom-1 items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] hover:cursor-pointer hover:bg-gray-200 transition'>
    <More
        size={20}
    />
    <div className='ml-3 '>
    {name} 
    </div>
    </button>
)
}



