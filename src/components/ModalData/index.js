import React, {useState, useEffect, useRef, useContext} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GlobalContext } from '@/state/context/GlobalContext'

import { doc, setDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import {uuidv4} from '@firebase/util';

import {BiDotsHorizontalRounded} from 'react-icons/bi'
import {BsDot,BsChat,BsBookmark, BsFillBookmarkFill} from 'react-icons/bs'
import {AiOutlineHeart, AiFillHeart} from 'react-icons/ai'
import {RiShareForwardLine} from 'react-icons/ri'
import {HiOutlineChatBubbleOvalLeft} from 'react-icons/hi2'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ModalData({id, image, username, caption, likesCount, savedCount,}) {

  const [posts, setPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isBookmarked, setIsBookmark]= useState(false);

  const comment = useRef(null);

  const {user}= useContext(GlobalContext)
  // const [showEmoji,setShowEmoji]=useState(false)
  // const [input,setInput] = useState('')

  // const addEmoji = (e)=> {
  //   const sym = e.unified.split("_");
  //   const codeArray = [];
  //   sym.forEach((el)=> codeArray.push("0x"+el))
  //   let emoji = String.fromCodePoint(...codeArray);
  //   setInput(input + emoji);
  // }

  // const handleEmojis = ()=> {
  //   setShowEmoji(!showEmoji);
  // }

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



//   window.onload=function(){
//     document.getElementById('my_button').onclick = function() {
//         document.getElementsByTagName('input').focus();
        
//     };
// }


  return (
    <div className="w-screen h-screen max-w-6xl max-h-[90vh] flex flex-row">
                    <div className="w-3/5">
                    {posts.map((post)=> (
        <div key={post.id} className='aspect-[16/14] w-full h-[580px] relative flex items-center justify-center'>
      <Image src={post.image} alt={caption} fill sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' className='object-contain w-full' />
    </div>
    
      )
      )}
      
                    </div>

                    <div className="w-2/5 relative pt-16">
                        <div className="absolute top-0 w-full p-3 flex flex-row border-b">
                            <div className="flex-1">
                            {posts.map((post)=> (
                              <Link key={post.id} href={`/${post.username}`} className="">
                                    <Image
                                        className="rounded-full w-8 max-w-none inline"
                                        src={`/../public/assets/images/avatars/${post.username}.jpeg`}
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
                                    src={`/../public/assets/images/avatars/${post.username}.jpeg`}
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
  )
}