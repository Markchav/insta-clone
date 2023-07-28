import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { uuidv4 } from '@firebase/util';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc,deleteDoc, updateDoc,orderBy,where } from 'firebase/firestore';
import {db,storage} from '/src/lib/firebase';
export default function ProfilePost({url}) {

  return (
    <div  className=' overflow-hidden w-full h-full'>
    {/* <Link href={`/${username}/${id}`}> */}
    <Image className="w-full h-60 sm:h-80 object-cover"
        src={url}
        alt=''
        width={300}
        height={300}/>
        {/* </Link> */}
        
    </div>
  )
}