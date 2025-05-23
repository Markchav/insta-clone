import React, { useContext, useState, useMemo } from "react";
import { useForm } from "@/hooks/useForm";
import {
  GlobalContext,
  GlobalDispatchContext,
} from "@/state/context/GlobalContext";
import Image from "next/image";
import Link from "next/link";

import { auth, db, signInWithGoogle } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { handlePromise } from "@/utils/handlePromise";
import LoadingOverlay from "../LoadingOverlay";
import useFetchCurrentUser from "@/utils/fetchCurrentUser";

import { FcGoogle } from "react-icons/fc";
import AuthAnimation from "/public/assets/animations/auth-page-animation.json";
// import Lottie from "react-lottie-player";
import { toast } from "react-hot-toast";

import img4 from "/public/assets/badges/PicBurst_Transparent.png";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

export default function Auth() {
  const [isLoginForm, setIsLoginForm] = useState(false);

  const { isAuthenticated, isOnboarded, isLoading, user } =
    useContext(GlobalContext);

  const { fetchUser } = useFetchCurrentUser();

  const dispatch = useContext(GlobalDispatchContext);

  const { form, onChangeHandler, resetForm } = useForm({
    email: "",
    password: "",
  });

  const {
    form: onboardingForm,
    onChangeHandler: onboardingFormOnChangeHandler,
  } = useForm({
    fullName: "",
    username: "",
  });

  const authenticate = async () => {
    if (isLoginForm) {
      const [data, loginError] = await handlePromise(
        signInWithEmailAndPassword(auth, form.email, form.password)
      );
      return loginError;
    } else {
      const [data, signUpError] = await handlePromise(
        createUserWithEmailAndPassword(auth, form.email, form.password)
      );
      return signUpError;
    }
  };

  const setUserData = async () => {
    try {
      const userCollection = collection(db, "users");

      const userQuery = query(
        userCollection,
        where("username", "==", onboardingForm.username)
      );

      const usersSnapshot = await getDocs(userQuery);

      if (usersSnapshot.docs.length > 0) {
        toast.error("username already exists");
        return;
      }

      await setDoc(doc(db, "users", auth.currentUser.email), {
        fullName: onboardingForm.fullName,
        username: onboardingForm.username,
        email: auth.currentUser.email,
        id: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      window.location.reload();
      toast.success("Welcome to PicBurst App");

      dispatch({
        type: "SET_IS_ONBOARDED",
        payload: {
          isOnboarded: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    dispatch({
      type: "SET_LOADING",
      payload: {
        isLoading: true,
      },
    });

    let error = null;

    error = await authenticate();

    // await fetchUser();
    // check if the user data exists in the db

    const userData = await fetchUser();

    if (userData) {
      dispatch({
        type: "SET_USER",
        payload: {
          user: userData,
        },
      });
      dispatch({
        type: "SET_IS_ONBOARDED",
        payload: {
          isOnboarded: true,
        },
      });
    }

    dispatch({
      type: "SET_LOADING",
      payload: {
        isLoading: false,
      },
    });

    if (error) toast.error(error.message);
    if (!error)
      toast.success(
        `You have successfully ${isLoginForm ? "logged in" : "signed up"}`
      );
    resetForm();
  };

  const onboardingSubmitHandler = async (e) => {
    e.preventDefault();

    dispatch({
      type: "SET_LOADING",
      payload: {
        isLoading: true,
      },
    });

    await setUserData();

    dispatch({
      type: "SET_LOADING",
      payload: {
        isLoading: false,
      },
    });
  };

  const isDisabled = useMemo(() => {
    return !Object.values(form).every((val) => !!val);
  }, [form]);

  return (
    <div className=" h-screen w-screen flex items-center justify-center">
      <div className="flex w-4/5 h-4/5">
        <div className="w-full h-full hidden sm:block">
          <Lottie
            loop
            animationData={AuthAnimation}
            play
            className="sm:w-[500px] h-[500px] float-right sm:visible invisible"
          />
        </div>

        <div className="flex flex-col w-full space-y-3 ">
          <div className="bg-white border space-y-3 flex flex-col border-gray-300 sm:w-1/2 w-full p-10 relative">
            {isLoading && <LoadingOverlay />}
            <div className="tracking-wider text-[52px] sm:text-xs my-2 text-transparent">
              <Image
                alt="PicBurst-logo"
                src="/assets/badges/PicBurst_Transparent.png"
                width={175}
                height={100}
                className="mx-auto -mb-14 sm:mb-0"
              />
              PicBurst
            </div>
            {!isAuthenticated && (
              <form
                onSubmit={submitHandler}
                className="flex flex-col items-center space-y-3"
              >
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={onChangeHandler}
                  value={form.email}
                  className="w-full bg-gray-100 border rounded-sm outline-none px-2 py-1 hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="Email"
                />

                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={onChangeHandler}
                  value={form.password}
                  className="w-full bg-gray-100 border rounded-sm outline-none px-2 py-1 hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="Password"
                />

                <button
                  type="submit"
                  className="bg-[#0095F6] hover:bg-blue-600 py-1 px-6 text-white active:scale-95 transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold"
                  disabled={isDisabled}
                >
                  {isLoginForm ? "Log In" : "Sign Up"}
                </button>
              </form>
            )}
            {isAuthenticated && !isOnboarded && (
              <form
                onSubmit={onboardingSubmitHandler}
                className="flex flex-col items-center space-y-3"
              >
                <input
                  type="fullName"
                  name="fullName"
                  id="fullName"
                  onChange={onboardingFormOnChangeHandler}
                  value={onboardingForm.fullName}
                  className="w-full bg-gray-100 border rounded-sm outline-none px-2 py-1 hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="Full Name"
                />

                <input
                  type="username"
                  name="username"
                  id="username"
                  onChange={onboardingFormOnChangeHandler}
                  value={onboardingForm.username}
                  className="w-full bg-gray-100 border rounded-sm outline-none px-2 py-1 hover:bg-transparent focus:bg-transparent placeholder:text-sm focus:border-gray-400"
                  placeholder="Username"
                />

                <button
                  type="submit"
                  className="bg-[#0095F6] hover:bg-blue-600 py-1 px-6 text-white active:scale-95 transform transition w-full disabled:bg-opacity-50 disabled:scale-100 rounded text-sm font-semibold"
                  disabled={
                    !onboardingForm.fullName || !onboardingForm.username
                  }
                >
                  Submit
                </button>
              </form>
            )}

            <div className="w-full flex items-center justify-center my-5 space-x-2">
              <div className="h-[1px] w-full bg-slate-400" />
              <div className="text-gray-400 w-full text-center font-semibold text-sm">
                OR
              </div>
              <div className="h-[1px] w-full bg-slate-400" />
            </div>
            <button
              onClick={signInWithGoogle}
              className="w-full text-center justify-center flex items-center text-[#0095F6] cursor-pointer"
            >
              <FcGoogle className="inline-block mr-2 text-2xl" />
              <span className="text-sm font-semibold">
                {isLoginForm ? "Log in" : "Sign Up"} with Google
              </span>
            </button>
            {isLoginForm && (
              <div className="w-full text-xs text-center text-[#00376B]">
                Forgot password?
              </div>
            )}
          </div>
          <div className="bg-white border space-y-3 text-sm border-gray-300 sm:w-1/2 w-full py-5 text-center">
            {isLoginForm
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => setIsLoginForm((prev) => !prev)}
              className="text-[#0095F6] ml-1 font-semibold"
            >
              {isLoginForm ? "Sign Up" : "Log In"}
            </button>
          </div>

          <p class="text-xs text-gray-500 mt-4 text-center  sm:w-1/2 w-full">
            <strong>Disclaimer:</strong> This is a personal project built for
            educational and portfolio purposes. It uses Firebase Authentication
            to securely manage user sessions. Not affiliated with Instagram or
            Meta.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-gray-500 underline hover:text-gray-800 text-center sm:text-left"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
