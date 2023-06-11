/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useReducer } from 'react'
import { globalReducer } from '../reducers/globalReducer'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/lib/firebase';
import useFetchCurrentUser from '@/utils/fetchCurrentUser';


const initialState = {
    user:{},
    isAuthenticated: false,
    isOnboarded:false,
    isLoading:true,
    isUploadPostModalOpen: false
}

export const GlobalContext  = createContext(initialState)
export const GlobalDispatchContext = createContext(null)


export default function GlobalContextProvider({children}) {

    const [state, dispatch] = useReducer(globalReducer, initialState)
    const {fetchUser} = useFetchCurrentUser();

    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

        if (user) {
            
            dispatch({
                type:"SET_IS_AUTHENTICATED",
                payload: {
                    isAuthenticated:true
                }
            });

        const userData = await fetchUser()

            if(userData) {
                
                dispatch({
                    type:'SET_USER',
                    payload:{
                        user: userData
                    }
                });
                dispatch({
                    type:'SET_IS_ONBOARDED',
                    payload:{
                        isOnboarded:true
                    }
                });
            }
        } 

        dispatch({
            type:"SET_LOADING",
            payload: {
                isLoading:false
            }
        });
        });

        return ()=> unsubscribe();
    }, []);

    return (
    <GlobalContext.Provider value={state}>
    <GlobalDispatchContext.Provider value={dispatch}>
        {children}
    </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
)
}
