import React, { useContext } from 'react'
import Feed from '@/components/Feed';
import Auth from '@/components/Auth'
import { GlobalContext } from '@/state/context/GlobalContext';

export default function HomePage() {

  const {isAuthenticated, isOnboarded} = useContext(GlobalContext);

  return  isAuthenticated  && isOnboarded ? <Feed/> :<Auth/>  
};