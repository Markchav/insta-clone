import React, { useContext, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'
import Modal from 'react-modal';

import SideNav from '/src/components/Navigation';
import ModalLayout from '/src/components/Modal';
import ProfilePost from '@/components/ProfilePosts';

import { GlobalContext, GlobalDispatchContext } from '@/state/context/GlobalContext';

import {db,storage} from '/src/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { uuidv4 } from '@firebase/util';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc,where } from 'firebase/firestore';

import {Home, Add, Heart, Messenger, Search, Reels, Settings} from '/src/components/SideBar/NavIcons'
import {IoImagesOutline} from 'react-icons/io5';
import {AiOutlineLogout} from 'react-icons/ai'
import { toast } from 'react-hot-toast';
import img3 from '/public/assets/badges/Instagram-logo.png'
import img4 from '/public/assets/images/avatars/markchavez_.jpeg'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

Modal.setAppElement('#__next');

export default function UserProfile({id, image, caption, likesCount, savedCount}) {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState('');
  const [media,setMedia] = useState({
    src:'',
    isUploading:false,
    caption:'',
  });

  const currentImage = useRef(null);
  const comment = useRef(null);


    const router = useRouter()
    const username = router.query.username



    const {isUploadPostModalOpen, user} = useContext(GlobalContext);
  const dispatch = useContext(GlobalDispatchContext);
  

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


  useEffect(() => {
    if(username) {
      setLoading(true)
      const postsCollection =collection(db,'posts') 
      const q = query(postsCollection, where('username','==', username))
      onSnapshot(q, (snapshot)=> {
        const posts = snapshot.docs.map((doc)=> doc.data())
        setPosts(posts)
        setLoading(false)
      })
    }

  }, [username])

  return (
    <div className="flex flex-row w-full h-full">
    <Head>
    <title>{` @${username} | Instagram`}</title>
    <meta
            name="viewport"
            content="width=device-width, initial-scale=0.66, maximum-scale=0.66, user-scalable=no"
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

{/* top bar mobile */}
    <div className='fixed sm:hidden top-0 left-0 z-50 w-full h-16 bg-white border-b border-gray-800 mt-3'>
    <Link href='/'><Image alt='Instagram-logo' src={img3} width={175} className=' -mb-14 sm:mb-0 p-4'/>
</Link>
    
    <div className='flex items-center justify-center ml-40 gap-4 w-full h-6'>
    <Link href='/' onClick={handleLogOut} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md gap-2 px-4 py-2 text-center justify-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-32">
    <AiOutlineLogout size={25} className=''/>
Log out</Link>

    <div onClick={handleClickIcon} className='flex items-center justify-center'>
    <Add  size={38}/>
    </div>
    <Heart size={38}/>
    </div>



    </div>

{/* Second Column - UserProfile page */}
    <section className='flex mx-auto gap-y-5'>

  {/* <!--body start--> */}
  {/* <!--profile data--> */}
    <div className="h-auto flex flex-col mx-auto sm:ml-10 sm:w-[950px]">
        <div className="flex md:flex-row-reverse flex-row-reverse sm:w-full w-[600px] sm:ml-0 mr-5">
        <div className="w-full md:w-3/4 p-4 text-center">
            <div className="text-left pl-4 pt-3">
            <span className="text-gray-700 text-2xl mr-2">{username}</span>

            <span className="text-base font-semibold text-gray-700">
            <button
            className="p-1 border-transparent text-gray-700 rounded-full hover:text-blue-600 focus:outline-none focus:text-gray-600"
            aria-label="Notifications"
            >
            <Settings size={20}/>
            </button>
            </span>
        </div>

        <div className="text-left pl-4 pt-3">
            <span className="text-base font-semibold text-gray-700 mr-2">
            <b>{posts.length}</b> posts
            </span>
            <span className="text-base font-semibold text-gray-700 mr-2">
            <b>114</b> followers
            </span>
            <span className="text-base font-semibold text-gray-700">
            <b>200</b> following
            </span>
        </div>



        <div className="text-left pl-4 pt-3">
        <p
            className="text-base font-medium text-blue-700 mr-2"
        >Welcome to my profile for instagram-clone</p>
        <p
            className="text-base font-medium text-gray-700 mr-2 w-80"
        >Feel free to roam around feed section </p>
        </div>
    </div>

    <div className="w-full md:w-1/4 p-4 text-center">
        <div className="w-full relative md:w-3/4 text-center mt-8">
        <button
            className="flex rounded-full"
            id="user-menu"
            aria-label="User menu"
            aria-haspopup="true"
        >
            <Image
            className="h-40 w-40 rounded-full"
            src={`/assets/images/avatars/${username}.jpeg`}
            alt=''
            width={200}
            height={200}
            priority
            />
        </button>
        </div>
    </div>
    </div>



    <hr className="border-gray-500 mt-6" />


    {/* <!--post icon and title--> */}
    <div className="flex flex-row mt-4 justify-center">
    <div className="flex text-gray-700 text-center py-2 m-2 pr-5">
        <div className="inline-flex">
        <button
            className="border-transparent text-gray-800 rounded-full hover:text-blue-600 focus:outline-none focus:text-gray-600"
            aria-label="Notifications"
        >
            <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
            />
            </svg>
        </button>
        </div>
        <div className="inline-flex ml-2 mt-1">
        <h3 className="text-sm font-bold text-gray-800 mr-2">POSTS</h3>
        </div>
    </div>


{user.username === username ? <div onClick={()=>router.push(`/${username}/saved`)} className="flex text-gray-700 text-center py-2 m-2 pr-5">
        <div className=" inline-flex">
        <button
            className="border-transparent text-gray-600 rounded-full hover:text-blue-600 focus:outline-none focus:text-gray-600"
            aria-label="Notifications"
        >
            <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        </button>
        </div>
        <div className=" inline-flex ml-2 mt-1">
        <h3 className="text-sm font-medium text-gray-700 mr-2 cursor-pointer">
        SAVED</h3>
        </div>
    </div> : null
}



    </div>

    {/* <!--post images--> */}

            <div className='grid grid-cols-3 gap-1 lg:gap-6 pt-5 pb-10'>
            
            {posts.map((post)=> (
              <ProfilePost key={post.id} url={post.image}/>
            )
            )}
            </div>
            {!posts || (posts.length ===0 && <p className='flex mx-auto justify-center content-center mt-10 text-2xl'>No Photos Yet</p>)}

</div>

    </section>


</div>

</div>

{/* Bottom nav bar mobile */}
<section className=' visible sm:invisible'>
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-gray-800">
  <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium gap-28">
      <button type="button" className="inline-flex flex-col items-center justify-center hover:bg-gray-50 group ">
      <Link href='/'> <Home size={40}/></Link>
          <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Home</span>
      </button>
      <button type="button" className="inline-flex flex-col items-center justify-center  hover:bg-gray-50 group">
<Search size={38}/>
          <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Search</span>
      </button>
      <button type="button" className="inline-flex flex-col items-center justify-center hover:bg-gray-50 group">
<Reels size={38}/>
          <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Reels</span>
      </button>
      <button type="button" className="inline-flex flex-col items-center justify-center hover:bg-gray-50 group">
          <Messenger size={38}/>
          <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Messenger</span>
      </button>
      <button type="button" className="inline-flex flex-col items-center justify-center hover:bg-gray-50 group">
      <Link href={`/${user.username}`} className=''>
  {/* <div className="flex items-center justify-between col-span-1"> */}
  <Image
      className="rounded-full flex ml-[2px]"
      src={`/assets/images/avatars/${user.username}.jpeg`}
      alt="user"
      width={40}
      height={40}
      priority
      />
  {/* </div> */}
  <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Profile</span>
</Link>
      </button>
  </div>
</div>
    </section>
</div>
  )
}