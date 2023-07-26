import { createPortal } from "react-dom";
import React, {useState, useContext} from 'react'
import Link from "next/link";
import Image from "next/image";
import SideNav from '/src/components/Navigation';
import ModalLayout from '/src/components/Modal';
import ProfilePost from '@/components/ProfilePosts';
import { useRouter } from "next/router";

import { GlobalContext, GlobalDispatchContext } from '@/state/context/GlobalContext';

import {db,storage} from '/src/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
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
import UserProfile from "@/pages/[username]";

export default function ModalPortal({component}) {
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
  
    const {isUploadPostModalOpen, isProfilePostModalOpen, user} = useContext(GlobalContext);
    const dispatch = useContext(GlobalDispatchContext);
    const router = useRouter()
    const username = router.query.username
    
const handleLogOut = async ()=> {
    await signOut(auth)
    window.location.reload()
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
  return (
    <div>

    {createPortal(<div className="w-full h-full shadow-xl absolute top-0  mt-20">
    {component}
    </div>, document.body)}</div>
  )
}
