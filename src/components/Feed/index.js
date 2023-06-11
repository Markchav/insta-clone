import React, { useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import SideNav from '../Navigation';
import Post from '../Post';
import Modal from '../Modal';
import { GlobalContext, GlobalDispatchContext } from '@/state/context/GlobalContext';
import {IoImagesOutline} from 'react-icons/io5';
import {db,storage} from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uuidv4 } from '@firebase/util';
// import { v4 as uuidv4 } from 'uuid';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import User from '../UserSec';
import Suggestions from '../Suggestions';
import Stories from '../Stories';

export default function Feed() {
  
  const {isUploadPostModalOpen} = useContext(GlobalContext);
  const dispatch = useContext(GlobalDispatchContext);
  

  const closeModal = ()=> {
        dispatch({
            type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
            payload: {
                isUploadPostModalOpen:false
            }
        });
}

  const [file, setFile] = useState('');
  const [media,setMedia] = useState({
    src:'',
    isUploading:false,
    caption:'',
  });

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

  const currentImage = useRef(null);

  const {user} = useContext(GlobalContext)

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

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    const postsCollection =collection(db,'posts') 
    const q = query(postsCollection, orderBy('createdAt', 'desc'))
    onSnapshot(q, (snapshot)=> {
      const posts = snapshot.docs.map((doc)=> doc.data())
      setPosts(posts)
      setLoading(false)
    })
  }, [])
  console.log(posts)
  

  return (
<div className="flex flex-row w-full h-full ">

  {/* <!-- First Column - Side Navbar --> */}
  <div className="flex-[.30]">
    <SideNav/>
  </div>

  <Modal closeModal={closeModal} isOpen={isUploadPostModalOpen}>
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
  </Modal>

  <div className='grid grid-cols-3 gap-[50px] max-w-screen-lg mx-auto mt-10 w-full '>
    <div className='w-full col-span-2 flex flex-col space-y-5'>
    {/* stories section */}
      <section className=''>
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
  <div className='col-span-1'>
  <User username = {user.username}/>
  <div>
  <Suggestions/>
  </div>
    </div>
    </div>
</div>
  )
}