import React, {useEffect, useRef, useState,} from 'react'

import { generateFakeUsers } from '@/utils/generateFakeUser'

import StoriesProfile from '../StoriesProfile'
import {IoIosArrowDropright, IoIosArrowDropleft} from 'react-icons/io'


export default function Stories() {

    const [stories, setStories] = useState([])
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const storiesRef = useRef(null)

    const onScroll = ()=> {
        if(storiesRef.current.scrollLeft > 0 ) {
            setShowLeft(true)
        } else {
            setShowLeft(false)
        }
        if(storiesRef.current.scrollLeft == storiesRef.current.scrollWidth - storiesRef.current.clientWidth) {
            setShowRight(false)
        } else {
            setShowRight(true)
        }
    }

    useEffect(() => {
        const stories = generateFakeUsers(20);
        setStories(stories)
    }, [])
    
  return (
    <div className='relative sm:w-full w-[500px]'>
    {/* <div className='fixed top-0 sm:hidden border-b border-gray-800 pb-3 w-full'>
    <Image alt='Instagram-logo' src={img3} width={175} className='mx-auto -mb-14 sm:mb-0 p-4'/>
    <div onClick={handleClickIcon} className='flex items-center justify-center ml-44'>
    <Add  size={30}/>
    </div>
    </div> */}

        <div onScroll={onScroll} ref={storiesRef} className='bg-white overflow-x-scroll max-w-3xl p-2 flex space-x-4 border-gray-200 scroll-smooth scrollbar-hide'>
        {
            stories.map((item, idx)=> {
                return (
                    <StoriesProfile
                key={idx}
                username= {item.username}
                avatar= {item.avatar}
                />
                )
            })
        }
        </div>
        <div className='absolute top-0 p-4 w-full h-full flex justify-between z-10 items-center'>
        <button onClick={()=> {storiesRef.current.scrollLeft = storiesRef.current.scrollLeft - 300}}>
        <IoIosArrowDropleft size={30} className={`cursor-pointer drop-shadow-lg filter ${showLeft ? 'visible' : 'invisible'}`}/>
        </button>
        <button onClick={()=> {storiesRef.current.scrollLeft = storiesRef.current.scrollLeft + 300}}>
        <IoIosArrowDropright size={30} className={`cursor-pointer drop-shadow-lg filter ${showRight ? 'visible' : 'invisible'}`}/>
        </button>
        </div>
        
    </div>

)
}
