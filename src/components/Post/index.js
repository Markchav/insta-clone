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

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function Post({id, image, username, caption, likesCount, savedCount,}) {

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
  }, [id]);




  return (
    <div className='flex flex-col w-[500px] mx-auto pb-2 border-b border-gray-300'>
    <div className='flex bg-white p-2 justify-between items-center'>
      <div className='flex justify-center items-center space-x-2'>
{/* Profile img */}
      <div className='h-10 w-10 bg-black border-2 rounded-full'>
      <Link href={`/${username}`}>
      <Image
        className="rounded-full w-16 flex mr-3"
        src={`/assets/images/avatars/${username}.jpeg`}
        alt="user"
        width={50}
        height={50}
        />
      </Link>

      </div>
      
      <div className='flex justify-center items-center text-sm '>
        {/* potential link to go to user profiles */}
        <div className='text-black cursor-pointer hover:text-black/50 font-semibold'>
        <Link href={`/${username}`}>{username}</Link>
        
        </div>
      <BsDot className='text-black/50'/> <span className='text-black/50'>
      {/* Timeline of posted post */}
      {
        posts.map((post)=>(
          <div key={post.id} className='flex space-x-2'>

            <div>
              {dayjs(post.createdAt && post.createdAt.toDate()).fromNow()}
            </div>
          </div>
        ))
      }
      </span>
      </div>
      </div>
      <div className='w-4 select-none'><BiDotsHorizontalRounded className='text-lg text-black cursor-pointer hover:text-black/50'/></div>
    </div>
    {/* Image */}
    <div className='aspect-[16/14] w-full h-[580px] relative flex items-center justify-center'>
      <Image src={image} alt={caption} fill sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' className='object-contain w-full' priority />
    </div>
{/* Icons  */}
    <div className='flex justify-between p-2 text-lg'>
      <div className='flex space-x-2'>
        <div onClick={handleLikePost}>
        {
          isLiked ? (<AiFillHeart size={25} className='text-red-500 cursor-pointer hover:text-red-500/50'/>)
          : (<AiOutlineHeart size={25} className='text-black cursor-pointer hover:text-black/50'/>)
        }
        
        </div>

        <div><BsChat size={23} className='-scale-x-90 text-black cursor-pointer hover:text-black/50 '/></div>
        <div ><RiShareForwardLine size={25} className='text-black cursor-pointer hover:text-black/50'/></div>
      </div>

      <div onClick={handleBookmark}>
      {
        isBookmarked ? (<BsFillBookmarkFill size={22} className='text-black cursor-pointer hover:text-black/50'/>) 
        : (<BsBookmark size={22} className='text-black cursor-pointer hover:text-black/50'/>)
      }
      </div>

    </div>
    <div className='px-2 text-[15px]'>
      {likesCount ? `${likesCount} likes` : 'Be the first to like!'}
    </div>

    <div className='px-2 flex gap-2 text-[15px]'>
    <div className='font-semibold '>
    <Link href={`/${username}`} className=''>{username}</Link>
   
      
    </div>
      {caption}
    </div>

    <div className='p-2'>
    <div className='flex flex-col space-y-1'>
    {comments.length > 0 && (
      <div className='h-12 overflow-y-scroll scrollbar-thumb-black scrollbar-thin'>
      {
        comments.map((commentData)=>(
          <div key={commentData.id} className='flex'>
          <div className='flex space-x-2'>
          <div className='font-medium text-[15px]'><Link href={`/${commentData.username}`} className=''>{commentData.username}</Link></div>
            <div className='text-[15px]'>{commentData.comment}</div>
          </div>
            {/* <div className='text-black/50 text-xs justify-center items-center flex '>{dayjs(commentData.createdAt && commentData.createdAt.toDate()).fromNow()}</div> */}
          </div>
        ))
      }
      </div>
    )}
    
    </div>
    </div>
    <form onSubmit={handlePostComment} className='w-full'>
    <div className='flex justify-between space-x-2 p-2'>
      <input type='text'
      name={`comment ${id}`} 
      id={`comment ${id}`}
      className='w-full outline-none text-sm'
      placeholder='Add a comment...'
      ref={comment}
      // value={input}
      // onChange={({target})=> setComments(target.value)}
      />
      
      {/* <span onClick={handleEmojis} className='flex space-x-2 items-center'>
      <BsEmojiSmile className='text-sm text-gray-500 cursor-pointer hover:text-slate-300' />
      </span> */}

      {/* { showEmoji && <div className='absolute right-[20%] top-[75%]'>
      <Picker data={data} onEmojiSelect={addEmoji} emojiSize={20} emojiButtonSize={34} maxFrequentRows={0}/>
      </div>} */}

      <button className='text-[#0095F6] font-semibold hover:text-[#00376B]' >
      Post
      </button>
    </div>
    </form>
  </div>
  )
}
