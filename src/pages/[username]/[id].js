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


import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'
import { db, auth ,storage} from '@/lib/firebase'
import { uuidv4 } from '@firebase/util';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc,deleteDoc, updateDoc,orderBy,where } from 'firebase/firestore';

import {Home, Add, Heart, Messenger, Search, Reels, Settings} from '/src/components/SideBar/NavIcons'
import {IoImagesOutline} from 'react-icons/io5';
import {AiOutlineLogout} from 'react-icons/ai'
import {BiDotsHorizontalRounded} from 'react-icons/bi'
import {RiShareForwardLine} from 'react-icons/ri'
import {BsChat,BsBookmark, BsFillBookmarkFill} from 'react-icons/bs'
import {AiOutlineHeart, AiFillHeart} from 'react-icons/ai'
import { toast } from 'react-hot-toast';
import img3 from '/public/assets/badges/Instagram-logo.png'
import img4 from '/public/assets/images/avatars/markchavez_.jpeg' 

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ModalPost({image, username, caption, likesCount, savedCount}) {

  const [posts, setPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isBookmarked, setIsBookmark]= useState(false);
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
  const {id} = router.query

  const dispatch = useContext(GlobalDispatchContext);

  const {isUploadPostModalOpen, isProfilePostModalOpen, user} = useContext(GlobalContext);

  const closeModal = ()=> {
    dispatch({
        type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
        payload: {
            isUploadPostModalOpen:false
        }
    });
}

  const closeProfileModal = ()=> {
    dispatch({
        type:'SET_IS_PROFILE_POST_MODAL_OPEN', 
        payload: {
            isProfilePostModalOpen:false
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
  
  const handlePostOpen = ()=> {
    dispatch({
        type:'SET_IS_PROFILE_POST_MODAL_OPEN', 
        payload: {
          isProfilePostModalOpen:true
        }
    })
    // router.push(`/${username}/${id}`)
  
  }



    const handleLikePost = async ()=> {

    const postLike = {
      postId: id,
      userId:auth.currentUser.uid,
      username
    };
    
    const likeRef = doc(db,`likes/${id}_${auth.currentUser.uid}`);
    const postRef = doc(db,`posts/${id}`);
    
    let updatedLikesCount;
    
    
    if(isLiked) {
      await deleteDoc(likeRef)
      if(likesCount) {
        updatedLikesCount = likesCount -1;
      } else {
        updatedLikesCount = 0;
      }
      await updateDoc(postRef, {
        likesCount : updatedLikesCount 
      });
    } else {
      await setDoc(likeRef, postLike);
      if(likesCount) {
        updatedLikesCount = likesCount + 1;
      } else {
        updatedLikesCount = 1;
      }
      await updateDoc(postRef, {
        likesCount : updatedLikesCount 
      });
    }
      };

      const handleBookmark = async ()=> {
    
        const postBookmark = {
          postId:id, 
          userId:auth.currentUser.uid,
          username:user.username,
          image
        }
    
        const bookmarkRef = doc(db,`saved/${id}_${auth.currentUser.uid}`);
        const postRef = doc(db,`posts/${id}`);
    
        let updatedSavedCount;
    
        if(isBookmarked) {
          await deleteDoc(bookmarkRef)
          if(savedCount) {
            updatedSavedCount = savedCount -1;
          } else {
            updatedSavedCount = 0;
          }
          await updateDoc(postRef, {
            savedCount:updatedSavedCount
          });
        } else {
          await setDoc(bookmarkRef, postBookmark);
          if(savedCount) {
            updatedSavedCount = savedCount +1;
          } else {
            updatedSavedCount = 1;
          }
          await updateDoc(postRef, {
            savedCount : updatedSavedCount
          });
        }
      }

      const handlePostComment = async (e)=> {
        e.preventDefault()
    
        const commentData = {
          id:uuidv4(),
          username:user.username,
          comment:comment.current.value,
          createdAt: serverTimestamp()
        }
    
        comment.current.value = '';
    
        const commentRef= doc(db,`posts/${id}/comments/${commentData.id}`)
    
        await setDoc(commentRef, commentData)
    
    
        // setInput('');
        // setShowEmoji(false)
        
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
    if(id) {
      const likesRef = collection(db,'likes');
      const likesQuery = query(likesRef, where('postId','==', id), where('userId','==',auth.currentUser.uid));
  
      const unsubscribeLike= onSnapshot(likesQuery, (snapshot)=>{
        const like = (snapshot.docs.map((doc)=> doc.data()));
        if(like.length !== 0) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      });
  
      const commentsRef = collection(db, `posts/${id}/comments`);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));
  
      const unsubscribeComment = onSnapshot(commentsQuery, (snapshot)=> {
        const comment = snapshot.docs.map((doc)=> doc.data());
  
        setComments(comment);
      })
  
      // const postRef = doc(db, 'posts', postId) 
      const postsCollection =collection(db,'posts') 
      const q = query(postsCollection, where('id','==', id))
      onSnapshot(q, (snapshot)=> {
        const posts = snapshot.docs.map((doc)=> doc.data())
        setPosts(posts);
        // console.log(posts)
      })
  
      const bookmarksRef = collection(db, 'saved');
      const bookmarksQuery = query(bookmarksRef, where('postId','==', id), where('userId','==',auth.currentUser.uid))
  
      const unsubscribeBookmark = onSnapshot(bookmarksQuery, (snapshot)=> {
        const bookmark = snapshot.docs.map((doc)=> doc.data());
  
        if(bookmark.length !== 0 ) {
          setIsBookmark(true);
        } else {
          setIsBookmark(false);
        }
      })
      return ()=> {
        unsubscribeLike();
        unsubscribeComment();
        unsubscribeBookmark();
      }
    }
    
  }, [id]);

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
    <div className='flex flex-row w-full h-full'>
    <div className="flex-[.30] invisible sm:visible">
  <SideNav/>
    </div>
<div className='flex-[.50] mx-auto justify-center items-center mt-10'>


{/* <div className='fixed sm:hidden top-0 left-0 z-50 w-full h-16 bg-white border-b border-gray-800 mt-3'>
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



    </div> */}

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


<div className="w-screen h-screen max-w-6xl sm:max-h-[90vh] flex sm:flex-row flex-col">
                    <div className="sm:w-3/5 w-full h-full justify-center">
                                            <div className="absolute top-0  w-full p-3 flex flex-row border-b sm:hidden">
                            <div className="flex-1">
                            {posts.map((post)=> (
                              <Link key={post.id} href={`/${post.username}`} className="">
                                    <Image
                                        className="rounded-full w-8 max-w-none inline"
                                        src={`/assets/images/avatars/${post.username}.jpeg`}
                                        alt=""
                                        width={50}
                                        height={50}
                                    />
                                    <span className="font-medium text-sm ml-2">
                                        {post.username}
                                    </span>
                                </Link>
                            ))}

                            </div>
                            <div className="">
                                <a className="" >
                                    <BiDotsHorizontalRounded className='text-lg text-black cursor-pointer hover:text-black/50'/>
                                </a>
                            </div>
                        </div>
                    {posts.map((post)=> (
        <div key={post.id} className='aspect-[16/14] w-full h-[580px] relative flex items-center justify-center'>
      <Image src={post.image} alt={post.caption} fill sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' className='object-contain w-full mt-20' priority />
    </div>
    
      )
      )}
                    </div>
                    

                    <div className="sm:w-2/5 w-full relative pt-16">
                        <div className="absolute top-0 w-full p-3 flex flex-row border-b sm:visible invisible">
                            <div className="flex-1">
                            {posts.map((post)=> (
                              <Link key={post.id} href={`/${post.username}`} className="">
                                    <Image
                                        className="rounded-full w-8 max-w-none inline"
                                        src={`/assets/images/avatars/${post.username}.jpeg`}
                                        alt=""
                                        width={50}
                                        height={50}
                                    />{" "}
                                    <span className="font-medium text-sm ml-2">
                                        {post.username}
                                    </span>
                                </Link>
                            ))}

                            </div>
                            <div className="">
                                <a className="" >
                                    <BiDotsHorizontalRounded className='text-lg text-black cursor-pointer hover:text-black/50'/>
                                </a>
                            </div>
                        </div>

                        <div className="overflow-scroll h-full pb-48">
                        {posts.map((post)=> (
                          <div key={post.id} className="flex flex-row p-3">
                                <div>
                                    <Image
                                    className="rounded-full w-8  max-w-none inline"
                                    src={`/assets/images/avatars/${post.username}.jpeg`}
                                    alt="user"
                                    width={50}
                                    height={50}
                                    />
                                </div>
                                <div className="">
                                    <div className="px-3 text-sm">
                                        <span className="font-medium mr-2">
                                            {post.username}
                                        </span>
                                        {post.caption}
                                        
                                    </div>
                                </div>
                            </div>
                        ))}


                            {comments &&
                                comments.map((commentData) => (
                                    <div className="flex flex-row p-3"
                                        key={commentData.id}
                                    >
                                        <div className="">
                                            <Image
                                                className="rounded-full w-8 inline max-w-none"
                                                src={img4}
                                                alt=""
                                            />
                                        </div>
                                        <div className="grow relative">
                                            <div className="px-4 text-sm">
                                                <span className="font-medium mr-2">
                                                    <Link href={`/${commentData.username}`} className=''>{commentData.username}</Link>
                                                </span>
                                                {commentData.comment}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="absolute bottom-0 w-full border-t bg-white">
                            <div className="header p-3 flex flex-row text-2xl w-full">
                                <div className="flex">
                                    <a onClick={handleLikePost} className='mr-3 cursor-pointer'>
                                    {
          isLiked ? (<AiFillHeart size={25} className='text-red-500 cursor-pointer hover:text-red-500/50'/>)
          : (<AiOutlineHeart size={25} className='text-black cursor-pointer hover:text-black/50'/>)
        }
                                    </a>
                                    <a className="mr-3 cursor-pointer">
                                    <BsChat size={23} className='-scale-x-90 text-black cursor-pointer hover:text-black/50 '/>
                                    </a>
                                    {/* <a className="cursor-pointer">
                                    <RiShareForwardLine size={25} className='text-black cursor-pointer hover:text-black/50'/>
                                    </a> */}
                                </div>
                                <div onClick={handleBookmark} className="">
                                {
        isBookmarked ? (<BsFillBookmarkFill size={22} className='text-black cursor-pointer hover:text-black/50'/>) 
        : (<BsBookmark size={22} className='text-black cursor-pointer hover:text-black/50'/>)
      }
                                </div>
                            </div>
                            
                            <div className="font-medium text-sm px-3">
                            {likesCount ? `${likesCount} likes` : 'Be the first to like!'}
                            </div>
                            <div className="text-gray-500 uppercase px-3 text-xs tracking-wide my-3">
                            {
        posts.map((post)=>(
          <div key={post.id} className='flex space-x-2'>

            <div>
              {dayjs(post.createdAt && post.createdAt.toDate()).fromNow()}
            </div>
          </div>
        ))
      }
                            </div>

                            <form onSubmit={handlePostComment} className="p-3 flex flex-row border-t">
                                <div className="flex items-center">

                                </div>
                                <div className="flex-1 pr-3 py-1">
                                    <input
                                        className="w-full px-3 py-1 text-sm outline-0"
                                        type="text"
                                        placeholder="Add a comment..."
                                        ref={comment}
                                        name={`comment ${id}`} 
                                        id={`comment ${id}`}
                                    />
                                </div>
                                <div className="flex items-center text-sm">
                                    <button
                                        className="'text-[#0095F6] font-semibold hover:text-[#00376B]'"
                                        href="#"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>



      

</div>
<section className=' visible sm:invisible'>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-800">
    <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50  group">
        <Link href='/'> <Home size={30}/></Link>
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

    <Image
        className="rounded-full flex ml-[4px]"
        src={`/assets/images/avatars/${user.username}.jpeg`}
        alt="user"
        width={30}
        height={35}
        />

    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">Profile</span>
</Link>
        </button>
    </div>
</div>
      </section>
</div>
  )
}
