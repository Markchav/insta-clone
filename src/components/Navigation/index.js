import React, { useState } from 'react'
import Link from 'next/link'
import img3 from '../../../public/assets/badges/Instagram-logo.png'
import Image from 'next/image'
import { Add, Home,
  Heart,
  Messenger,
  Compass,
  Profile,
  Search,
  Reels,
  Menu,
  Settings,
  Bookmark
} from '../SideBar/NavIcons'

// import NavName from '@/components/SideBar/NavName'
import NavIcon from '@/components/SideBar/NavIcon'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const NAV_ITEMS = [
  {
    icon:Home,
    url:'/',
    name: 'Home'
  },
  {
    icon:Search,
    url:'/',
    name: 'Search'
  },
  {
    icon:Compass,
    url:'/',
    name: 'Explore'
  },
  {
    icon:Reels,
    url:'/',
    name: 'Reels'
  },
  {
    icon:Messenger,
    url:'/',
    name: 'Messages'
  },
  {
    icon:Heart,
    url:'/',
    name: 'Notifications'
  },
  {
    icon:Add,
    url:'/',
    name: 'Create'
  },
  {
    icon:Profile,
    url:'/',
    name: 'Profile'
  },
  
]

// const MORE_ITEM = [{
//   icon:Menu,
//     url:'/',
//     name: 'Menu',
//     submenuItems:[
//       {icon:Settings,url:'/',name:'Settings'},
//       {icon:Bookmark, url:'/',name:'Saved'},
//       {url:'/', name:'Log out'}
//     ]
// }]


export default function SideNav() {

  const handleLogOut = async ()=> {
    await signOut(auth)
    window.location.reload()
}

 const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <div className='fixed flex flex-col justify-between z-[1]'>
    <Link href='/'>
    <Image alt='Instagram-logo' src={img3} width={150} className='m-[25px] select-none cursor-pointer'/>
    </Link>
    
    <div className='flex flex-col'>
      {
        NAV_ITEMS.map((item)=>(
          <NavIcon 
            Icon={item.icon}
            key={item.name}
            name={item.name}
          />
        ))
      }
      <div className='fixed bottom-1'>
      <div className="relative inline-block text-left">
  <div onClick={()=> setSubMenuOpen(!subMenuOpen)} className='flex flex-row fixed bottom-1 w-[204px] items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] hover:cursor-pointer hover:bg-gray-200 transition'>
    <button type="button"  className="flex flex-row items-center ">
      <Menu size={20}/>
      <div className='ml-3'>
      Menu
      </div>
    </button>
  </div>
  {subMenuOpen && <div className=" right-0 mt-2  w-[214px] pb-12 bg-white border border-gray-300 divide-y divide-gray-200 rounded-[15px] shadow-lg">
    <div className="py-1 flex flex-col ">
      <a href="#" className="flex flex-row items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] hover:cursor-pointer hover:bg-gray-200 transition"><Settings size={20}/> <div className='ml-3'> Settings </div> </a>
      <a href="#" className="flex flex-row items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] hover:cursor-pointer hover:bg-gray-200 transition"><Bookmark size={20}/> <div className='ml-3'> Saved </div> </a>
      <a onClick={handleLogOut} className=" flex flex-row items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] hover:cursor-pointer hover:bg-gray-200 transition">Log Out</a>
    </div>
  </div>}
</div>
      {/* {
        MORE_ITEM.map((item)=>(
          <NavName 
            More={item.icon}
            key={item.name}
            name={item.name}
          />
        ))
      } */}
      </div>
      
    </div>
    </div>
  );
}
