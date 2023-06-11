// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId:process.env.NEXT_PUBLIC_APP_ID 
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

const auth = getAuth()
// const faceBookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async ()=> {
  try {
    await signInWithPopup(auth, googleProvider)
  } catch (error) {
    console.log(error)
  }
}

const db = getFirestore()

const storage = getStorage()

export {
    app, db, auth, storage, signInWithGoogle
}