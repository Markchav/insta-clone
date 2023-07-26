import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { uuidv4 } from '@firebase/util';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc,deleteDoc, updateDoc,orderBy,where } from 'firebase/firestore';
import {db,storage} from '/src/lib/firebase';
export default function ProfilePost({url}) {

  // useEffect(()=> {
  //   if(id){
  //     const postsCollection =collection(db,'posts') 
  //     const q = query(postsCollection, where('id','==', id))
  //     onSnapshot(q, (snapshot)=> {
  //       const posts = snapshot.docs.map((doc)=> doc.data())
  //       setPosts(posts);
  //       // console.log(posts)
  //     })
  //   }

  // })

  // const router = useRouter()
  // const username = router.query.username
  // const id = router.query.id
  return (
    <div  className=' overflow-hidden w-full h-full'>
    {/* <Link href={`/${username}/${id}`}> */}
     <Image className="w-full h-full object-cover"
        src={url}
        alt=''
        width={300}
        height={300}/>
        {/* </Link> */}
        
    </div>
  )
}