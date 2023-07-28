import React, { useContext, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { GlobalContext, GlobalDispatchContext } from '@/state/context/GlobalContext';
import {db,storage} from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { uuidv4 } from '@firebase/util';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';

import SideNav from '../Navigation';
import Post from '../Post';
import ModalLayout from '../Modal';
import User from '../UserSec';
import Suggestions from '../Suggestions';
import Stories from '../Stories';

import {Home, Add, Heart, Messenger, Search, Reels,} from '../SideBar/NavIcons'
import {IoImagesOutline} from 'react-icons/io5';
import {AiOutlineLogout} from 'react-icons/ai'
import { toast } from 'react-hot-toast';
import img3 from '/public/assets/badges/Instagram-logo.png'

export default function Feed() {
  
  const [file, setFile] = useState('');
  const [media,setMedia] = useState({
    src:'',
    isUploading:false,
    caption:'',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const {isUploadPostModalOpen} = useContext(GlobalContext);
  const dispatch = useContext(GlobalDispatchContext);

  const currentImage = useRef(null);

  const {user} = useContext(GlobalContext)

  const closeModal = ()=> {
        dispatch({
            type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
            payload: {
                isUploadPostModalOpen:false
            }
        });
}

const handleClickIcon = ()=> {
    if('Create') {
        dispatch({
            type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
            payload: {
                isUploadPostModalOpen:true
            }
        })
    }
}


  const handlePostMedia = async (url)=> {
    const postId = uuidv4();
    const postRef = doc(db, 'posts', postId)
    const post = {
      id:postId,
      image: url,
      username:user.username,
      caption:media.caption,
      createdAt:serverTimestamp()
    }
    try {
      await setDoc(postRef, post);
    } catch (error) {
      console.error(error);
      toast.error('error posting the image');
    }
  };

  const handleUploadPost = async () => {
    if (!file) return toast.error('please select a image first');
    setMedia((prev) => ({ ...prev, isUploading: true }));

    const toastId = toast.loading('uploading your post, wait a minute...');
    const postName = `posts/${uuidv4()}-${file.name}`;

    const storageRef = ref(storage,postName);

    try {
      const uploadTask = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadTask.ref);
      await handlePostMedia(url);
      
      toast.success('image has uploaded', {
        id: toastId,
      });
    } catch (error) {
      toast.error('failed to upload the image', {
        id: toastId,
      });
    } finally {
      setMedia({
        src: '',
        isUploading: false,
        caption:''
      });
      setFile('');
      closeModal();
    }
  };

  const handleRemovePost = ()=> {
    setFile('')
    currentImage.current.src=''
  }

  const handleLogOut = async ()=> {
    await signOut(auth)
    window.location.reload()

}

  useEffect(() => {
    setLoading(true)
    const postsCollection =collection(db,'posts') 
    const q = query(postsCollection, orderBy('createdAt', 'desc'))
    onSnapshot(q, (snapshot)=> {
      const posts = snapshot.docs.map((doc)=> doc.data())
      setPosts(posts)
      setLoading(false)
    })
  }, []);
  
  useEffect(() => {
    const reader = new FileReader();

    const handleEvent = (e)=> {
      switch (e.type) {
        case 'load':
          return setMedia((prev)=> ({
            ...prev,
            src:reader.result
          }));
        case 'error':
          console.log(e);
          return toast.error('something not working');
        default:
          return;
      }
    };

    if (file) {
      reader.addEventListener('load', handleEvent);
      reader.addEventListener('error', handleEvent);
      reader.readAsDataURL(file);
    }

    return ()=> {
      reader.removeEventListener('load', handleEvent);
      reader.removeEventListener('error', handleEvent);
    }
  }, [file]);


  return (
<div className="flex flex-row w-full h-full">
<Head>
    <meta
            name="viewport"
            content="width=device-width, initial-scale=0.79, maximum-scale=0.79, user-scalable=no"
          />

    </Head>
  {/* <!-- First Column - Side Navbar --> */}
  <div className="flex-[.30] invisible sm:visible">
    <SideNav/>
  </div>


  <ModalLayout closeModal={closeModal} isOpen={isUploadPostModalOpen}>
    <div className='w-screen h-screen max-w-xl max-h-[75vh] flex flex-col items-center'>
      <div className='w-full pb-2 font-semibold text-center border-b border-black'>
        Create new post
      </div>
        <div className='flex items-center justify-center w-full h-full'>
      {!file ? (
        <div className='flex flex-col justify-center items-center'>
        <IoImagesOutline size={70} className='m-5'/>
      <div className='text-xl'>
      Drag photos and videos here
      </div>
      <div className='p-5'>
      <label  htmlFor='post' className='bg-[#0095F6] hover:bg-blue-600 py-2 px-4 text-white active:scale-95 cursor-pointer transform transition  disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold'>
          Select from computer 
        </label>
        <input onChange={(e)=> setFile(e.target.files[0])} type='file' name='post' id='post' value={file.name} className='hidden' multiple={false} accept="image/jpeg,image/png"/>
      </div>
        
        </div>
      ) : (
        <div className='flex flex-col gap-y-4 '>
        <input type='image' src={media.src} ref={currentImage} className='w-96 h-96 object-contain'/>
        <input type='text' name='caption' id='caption' placeholder='Type your caption (optional...)' onChange={(e)=> setMedia((prev)=> ({...prev, caption:e.target.value}))} value={media.caption} className='w-full px-2 py-2 bg-gray-100 border rounded outline-none hover:bg-transparent focus:bg-transparent focus:border-gray-400'/>
        <div className='flex items-center justify-center w-full gap-x-6'>
          <button onClick={handleRemovePost} className='bg-[#0095F6] hover:bg-blue-600 py-2 px-4 text-white active:scale-95 cursor-pointer transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold'>Remove</button>
          <button onClick={handleUploadPost} className='bg-[#0095F6] hover:bg-blue-600 py-2 px-4 text-white active:scale-95 cursor-pointer transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold'>Upload</button>
        </div>
        </div>
      )
      }
        </div>
    </div>
  </ModalLayout>

  <div className='grid sm:grid-cols-3 grid-cols-1 gap-[50px] max-w-screen-lg mx-auto mt-10 w-full'>
    <div className='w-full col-span-2 flex flex-col space-y-5'>

    <div className='fixed sm:hidden top-0 left-0 z-50 w-full h-14 bg-white border-b border-gray-800'>
    <Image alt='Instagram-logo' src={img3} width={150} className=' -mb-14 sm:mb-0 p-4'/>

    <div className='flex items-center justify-center ml-32 gap-3 w-full'>
    <button onClick={handleLogOut} type="button" className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm gap-2 px-4 py-2 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-28">
  <AiOutlineLogout size={18}/>
  Log out
</button>
    <div onClick={handleClickIcon} className='flex items-center justify-center'>
    <Add  size={30}/>
    </div>
    <Heart size={30}/>
    </div>


    {/* <div className='flex items-center justify-center ml-40 gap-4 w-full h-6'>
    <Link href='/' onClick={handleLogOut} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md gap-2 px-4 py-2 text-center justify-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-32">
    <AiOutlineLogout size={25} className=''/>
Log out</Link>

    <div onClick={handleClickIcon} className='flex items-center justify-center'>
    <Add  size={30}/>
    </div>
    <Heart size={30}/>
    </div> */}


    </div>

    {/* stories section */}
      <section className='sm:mt-0 mt-5 '>
      <Stories />
      </section>
      {/* posts section */}
      <section className='flex flex-col gap-y-5'>
      {
        posts.map((post)=>(
          <Post key={post.id} {...post}/>
        ))
      }
      </section>


  </div>
   {/* this is our side nav that has mini prof and suggest */}
  <div className='col-span-1 invisible sm:visible'>
  <User username = {user.username}/>
  <div>
  <Suggestions/>
  </div>
    </div>
    
    </div>
    <section className=' visible sm:invisible'>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-800">
    <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50  group">
            <Home size={30}/>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Home</span>
        </button>
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group">
<Search size={30}/>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Search</span>
        </button>
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group">
<Reels size={30}/>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Reels</span>
        </button>
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group">
            <Messenger size={30}/>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Messenger</span>
        </button>
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group">
        <Link href={`/${user.username}`} className=''>
    {/* <div className="flex items-center justify-between col-span-1"> */}
    <Image
        className="rounded-full flex ml-[4px]"
        src={`/assets/images/avatars/${user.username}.jpeg`}
        alt="user"
        width={30}
        height={35}
        style={{ width: 'auto', height: 'auto' }}
        />
    {/* </div> */}
    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Profile</span>
</Link>
        </button>
    </div>
</div>
      </section>
</div>
  )
}