import React, {useState, useEffect, useRef, useContext} from 'react'
import {BiDotsHorizontalRounded} from 'react-icons/bi'
import {BsDot,BsChat,BsBookmark, BsFillBookmarkFill} from 'react-icons/bs'
import {AiOutlineHeart, AiFillHeart} from 'react-icons/ai'
// import {TiLocationArrowOutline} from 'react-icons/ti'
import {RiShareForwardLine} from 'react-icons/ri'
import Image from 'next/image'
import { db, auth } from '@/lib/firebase'
import { doc, setDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import {uuidv4} from '@firebase/util';
import { GlobalContext } from '@/state/context/GlobalContext'
import {HiOutlineChatBubbleOvalLeft} from 'react-icons/hi2'
// import data from '@emoji-mart/data'
// import Picker from '@emoji-mart/react'
import { formatDistance } from 'date-fns'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function Post({id, image, username, caption, likesCount, savedCount,}) {

  const [posts, setPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isBookmarked, setIsBookmark]= useState(false);
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
      username
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

  const comment = useRef(null);

  const handleClickChat= ()=> document.getElementById(`comment ${id}`)

  const {user}= useContext(GlobalContext)

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


  return (
    <div className='flex flex-col w-[500px] mx-auto pb-2 border-b border-gray-300 '>
    <div className='flex bg-white p-2 justify-between items-center'>
      <div className='flex justify-center items-center space-x-2'>
      <div className='h-10 w-10 bg-black border-2  rounded-full'/>
      <div className='flex justify-center items-center text-sm '>
        {/* potential link to go to user profiles */}
        <div className='text-black cursor-pointer hover:text-black/50 font-semibold'>
        {username}
        </div>
      <BsDot className='text-black/50'/> <span className='text-black/50'>
      {
        comments.map((commentData)=>(
          <div key={commentData.id} className='flex space-x-2'>
            {/* <div>{formatDistance(commentData.createdAt.toDate(), new Date())} ago</div> */}
            <div>
              {dayjs(commentData.createdAt && commentData.createdAt.toDate()).fromNow()}
            </div>
          </div>
        ))
      }
      </span></div>
      </div>
      <div className='w-4 select-none'><BiDotsHorizontalRounded className='text-lg text-black cursor-pointer hover:text-black/50'/></div>
    </div>
    <div className='aspect-[16/14] w-full h-[580px] relative flex items-center justify-center'>
      <Image src={image} alt={caption} fill className='object-contain' />
    </div>
    <div className='flex justify-between p-2 text-lg'>
      <div className='flex space-x-2'>
        <div onClick={handleLikePost}>
        {
          isLiked ? (<AiFillHeart size={25} className='text-red-500 cursor-pointer hover:text-red-500/50'/>)
          : (<AiOutlineHeart size={25} className='text-black cursor-pointer hover:text-black/50'/>)
        }
        
        </div>

        <div onClick={handleClickChat}><BsChat size={23} className='-scale-x-90 text-black cursor-pointer hover:text-black/50 '/></div>
        <div ><RiShareForwardLine size={25} className='text-black cursor-pointer hover:text-black/50'/></div>
      </div>

      <div onClick={handleBookmark}>
      {
        isBookmarked ? (<BsFillBookmarkFill size={22} className='text-black cursor-pointer hover:text-black/50'/>) 
        : (<BsBookmark size={22} className='text-black cursor-pointer hover:text-black/50'/>)
      }
      </div>

    </div>
    <div className='px-2'>
      {likesCount ? `${likesCount} likes` : 'Be the first to like!'}
    </div>
    <div className='px-2 flex gap-2'>
    <div className='font-semibold'>
      {username}
    </div>
      {caption}
    </div>

    <div className='p-2'>
    <div className='flex flex-col space-y-1'>
    {
        comments.map((commentData)=>(
          <div key={commentData.id} className='flex space-x-2'>
            <div className='font-medium'>{commentData.username}</div>
            <div>{commentData.comment}</div>
          </div>
        ))
      }
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

      <button className='text-[#0095F6] font-semibold hover:text-[#00376B]'>
      Post
      </button>
    </div>
    </form>
  </div>
  )
}
